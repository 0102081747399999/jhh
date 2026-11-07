// ==========================================================================
// صفحة طلبات العملاء الشاملة (Customer Orders Management & View Logic)
// ==========================================================================

let ordersData = [];
let currentStatusFilter = 'all';
let currentDateFilter = 'all'; // 'all' or 'today'
let currentSearchQuery = '';
let currentViewMode = 'table'; // 'table' or 'cards'
let selectedOrder = null;

document.addEventListener('DOMContentLoaded', () => {
  initCustomerOrdersPage();
  setupEventListeners();
});

function initCustomerOrdersPage() {
  const tableBody = document.getElementById('ordersTableBody');
  const cardsContainer = document.getElementById('ordersCardsContainer');
  if (!tableBody && !cardsContainer) return;

  // الاستماع المباشر لجميع الطلبات في الوقت الفعلي من Firebase
  window.FirebaseService.listenToAllOrders((orders) => {
    ordersData = orders;
    updateOrdersStats();
    renderFilteredOrders();
  });
}

function setupEventListeners() {
  // حقل البحث المباشر
  const searchInput = document.getElementById('ordersSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearchQuery = e.target.value.trim().toLowerCase();
      renderFilteredOrders();
    });
  }

  // فلتر التاريخ
  const dateFilterSelect = document.getElementById('ordersDateFilter');
  if (dateFilterSelect) {
    dateFilterSelect.addEventListener('change', (e) => {
      currentDateFilter = e.target.value;
      renderFilteredOrders();
    });
  }
}

// تحديث الإحصائيات في شريط المؤشرات العلوي
function updateOrdersStats() {
  const statTotal = document.getElementById('statsTotalOrders');
  const statToday = document.getElementById('statsTodayOrders');
  const statPending = document.getElementById('statsPendingOrders');
  const statDelivering = document.getElementById('statsDeliveringOrders');
  const statCompleted = document.getElementById('statsCompletedOrders');
  const statRevenue = document.getElementById('statsTotalRevenue');

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const total = ordersData.length;
  const todayOrders = ordersData.filter(o => {
    if (o.createdLocal && o.createdLocal.startsWith(todayStr)) return true;
    if (o.createdAt && o.createdAt.toDate) {
      return o.createdAt.toDate().toISOString().startsWith(todayStr);
    }
    return false;
  }).length;

  const pending = ordersData.filter(o => o.status === 'pending' || o.status === 'cooking').length;
  const delivering = ordersData.filter(o => o.status === 'delivering').length;
  const completed = ordersData.filter(o => o.status === 'completed').length;
  const revenue = ordersData.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  if (statTotal) statTotal.innerText = total;
  if (statToday) statToday.innerText = todayOrders;
  if (statPending) statPending.innerText = pending;
  if (statDelivering) statDelivering.innerText = delivering;
  if (statCompleted) statCompleted.innerText = completed;
  if (statRevenue) statRevenue.innerText = `${revenue.toLocaleString()} ج.م`;
}

// تصفية الطلبات حسب الحالة
window.filterByStatus = function(status, btnElement) {
  currentStatusFilter = status;

  document.querySelectorAll('.status-filter-btn').forEach(btn => {
    btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    btn.classList.add('bg-surface-container', 'text-on-surface-variant');
  });

  if (btnElement) {
    btnElement.classList.remove('bg-surface-container', 'text-on-surface-variant');
    btnElement.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
  }

  renderFilteredOrders();
};

// التبديل بين عرض الجدول وعرض البطاقات
window.switchViewMode = function(mode) {
  currentViewMode = mode;
  const tableViewBtn = document.getElementById('viewTableBtn');
  const cardsViewBtn = document.getElementById('viewCardsBtn');
  const tableSection = document.getElementById('ordersTableSection');
  const cardsSection = document.getElementById('ordersCardsSection');

  if (mode === 'table') {
    tableViewBtn.className = 'p-2 rounded-lg bg-primary text-on-primary shadow-sm cursor-pointer';
    cardsViewBtn.className = 'p-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high cursor-pointer';
    tableSection.classList.remove('hidden');
    cardsSection.classList.add('hidden');
  } else {
    cardsViewBtn.className = 'p-2 rounded-lg bg-primary text-on-primary shadow-sm cursor-pointer';
    tableViewBtn.className = 'p-2 rounded-lg bg-surface-container text-on-surface-variant hover:bg-surface-container-high cursor-pointer';
    tableSection.classList.add('hidden');
    cardsSection.classList.remove('hidden');
  }
};

// تصفية وعرض قائمة الطلبات
function renderFilteredOrders() {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  const filtered = ordersData.filter(order => {
    // 1. فلتر الحالة
    if (currentStatusFilter !== 'all' && order.status !== currentStatusFilter) {
      return false;
    }

    // 2. فلتر التاريخ
    if (currentDateFilter === 'today') {
      const isToday = (order.createdLocal && order.createdLocal.startsWith(todayStr)) ||
                      (order.createdAt?.toDate && order.createdAt.toDate().toISOString().startsWith(todayStr));
      if (!isToday) return false;
    }

    // 3. فلتر البحث
    if (currentSearchQuery) {
      const q = currentSearchQuery;
      const orderNum = (order.orderNumber || '').toLowerCase();
      const custName = (order.customer?.name || '').toLowerCase();
      const custPhone = (order.customer?.phone || '').toLowerCase();
      const custAddress = (order.customer?.address || '').toLowerCase();
      const itemsStr = (order.items || []).map(i => i.title.toLowerCase()).join(' ');

      if (!orderNum.includes(q) && !custName.includes(q) && !custPhone.includes(q) && !custAddress.includes(q) && !itemsStr.includes(q)) {
        return false;
      }
    }

    return true;
  });

  renderTable(filtered);
  renderCards(filtered);

  const countBadge = document.getElementById('filteredOrdersCount');
  if (countBadge) countBadge.innerText = `${filtered.length} طلب`;
}

// دالة مساعدة لتنسيق الحالة والألوان
function getStatusBadge(status) {
  const map = {
    pending: { label: 'قيد المراجعة', class: 'bg-amber-100 text-amber-800 border-amber-300', icon: 'hourglass_empty' },
    cooking: { label: 'جاري التحضير', class: 'bg-blue-100 text-blue-800 border-blue-300', icon: 'outdoor_grill' },
    delivering: { label: 'في الطريق', class: 'bg-orange-100 text-orange-800 border-orange-300', icon: 'delivery_dining' },
    completed: { label: 'تم التوصيل', class: 'bg-green-100 text-green-800 border-green-300', icon: 'check_circle' },
    cancelled: { label: 'ملغي', class: 'bg-red-100 text-red-800 border-red-300', icon: 'cancel' }
  };
  return map[status] || { label: status, class: 'bg-gray-100 text-gray-800 border-gray-300', icon: 'info' };
}

// رسم الجدول (Table View)
function renderTable(orders) {
  const tbody = document.getElementById('ordersTableBody');
  const emptyState = document.getElementById('ordersEmptyState');
  if (!tbody) return;

  tbody.innerHTML = '';

  if (orders.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }
  if (emptyState) emptyState.classList.add('hidden');

  orders.forEach((order, index) => {
    const tr = document.createElement('tr');
    tr.className = 'border-b border-surface-container hover:bg-surface-container-low transition-colors';

    const st = getStatusBadge(order.status);
    const cust = order.customer || {};

    let timeText = 'الآن';
    if (order.createdAt && order.createdAt.toDate) {
      timeText = order.createdAt.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) + 
                 ' • ' + order.createdAt.toDate().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    } else if (order.createdLocal) {
      const d = new Date(order.createdLocal);
      timeText = d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }) +
                 ' • ' + d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    }

    const itemsSummary = (order.items || []).map(i => `${i.quantity}x ${i.title}`).join('، ');

    tr.innerHTML = `
      <td class="py-3 px-4 font-bold text-primary text-sm whitespace-nowrap" dir="ltr">
        ${order.orderNumber}
      </td>
      <td class="py-3 px-4 text-xs text-outline whitespace-nowrap">
        ${timeText}
      </td>
      <td class="py-3 px-4">
        <div class="flex flex-col text-right">
          <span class="font-bold text-on-surface text-sm">${cust.name || 'عميل'}</span>
          <span class="text-xs text-outline" dir="ltr">${cust.phone || '-'}</span>
        </div>
      </td>
      <td class="py-3 px-4 max-w-xs">
        <p class="text-xs text-on-surface line-clamp-1" title="${itemsSummary}">${itemsSummary || 'بدون تفاصيل'}</p>
        <span class="text-[11px] text-outline">عدد الأصناف: ${order.items ? order.items.length : 0}</span>
      </td>
      <td class="py-3 px-4 text-xs text-on-surface-variant max-w-xs truncate" title="${cust.address || ''}">
        ${cust.city ? cust.city + ' - ' : ''}${cust.address || 'العنوان غير محدد'}
      </td>
      <td class="py-3 px-4 font-bold text-primary text-sm whitespace-nowrap">
        ${order.total || 0} ج.م
      </td>
      <td class="py-3 px-4 whitespace-nowrap">
        <select onchange="handleStatusChangeFromTable('${order.id || order.orderNumber}', this.value)" 
                class="text-xs font-bold py-1 px-2.5 rounded-full border cursor-pointer focus:outline-none ${st.class}">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ قيد المراجعة</option>
          <option value="cooking" ${order.status === 'cooking' ? 'selected' : ''}>👨‍🍳 جاري التحضير</option>
          <option value="delivering" ${order.status === 'delivering' ? 'selected' : ''}>🛵 في الطريق</option>
          <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>✅ تم التوصيل</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ ملغي</option>
        </select>
      </td>
      <td class="py-3 px-4 whitespace-nowrap text-left">
        <div class="flex items-center gap-1.5 justify-end">
          <button onclick="viewOrderDetails('${order.orderNumber}')" 
                  class="p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer" 
                  title="عرض التفاصيل والفاتورة">
            <span class="material-symbols-outlined text-[18px]">visibility</span>
          </button>
          <a href="track.html?orderId=${order.orderNumber}" target="_blank"
             class="p-1.5 rounded-lg bg-primary-fixed hover:bg-primary-fixed-dim text-primary transition-colors cursor-pointer" 
             title="متابعة تتبع العميل">
            <span class="material-symbols-outlined text-[18px]">my_location</span>
          </a>
        </div>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// رسم البطاقات (Cards View)
function renderCards(orders) {
  const container = document.getElementById('ordersCardsContainer');
  if (!container) return;

  container.innerHTML = '';

  orders.forEach(order => {
    const card = document.createElement('div');
    card.className = 'bg-surface-container-lowest rounded-2xl p-5 shadow-sm border border-surface-container-high/60 flex flex-col justify-between gap-4 hover:shadow-md transition-shadow';

    const st = getStatusBadge(order.status);
    const cust = order.customer || {};

    let timeText = 'الآن';
    if (order.createdAt && order.createdAt.toDate) {
      timeText = order.createdAt.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else if (order.createdLocal) {
      timeText = new Date(order.createdLocal).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    }

    let itemsHtml = '';
    if (order.items && order.items.length) {
      itemsHtml = order.items.map(i => `
        <div class="flex items-center justify-between text-xs py-1 border-b border-surface-container/60">
          <span class="font-medium text-on-surface">${i.quantity}x ${i.title}</span>
          <span class="font-bold text-primary">${i.price * i.quantity} ج.م</span>
        </div>
      `).join('');
    }

    card.innerHTML = `
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="font-bold text-lg text-primary" dir="ltr">${order.orderNumber}</span>
            <span class="text-xs text-outline">${timeText}</span>
          </div>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${st.class}">
            <span class="material-symbols-outlined text-[14px]">${st.icon}</span>
            <span>${st.label}</span>
          </span>
        </div>

        <div class="p-3 bg-surface-container-low rounded-xl text-xs flex flex-col gap-1.5">
          <div class="flex items-center justify-between">
            <span class="font-bold text-on-surface flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px] text-primary">person</span>
              <span>${cust.name || 'عميل'}</span>
            </span>
            <a href="tel:${cust.phone || ''}" class="font-bold text-secondary hover:underline flex items-center gap-1" dir="ltr">
              <span class="material-symbols-outlined text-[14px]">call</span>
              <span>${cust.phone || '-'}</span>
            </a>
          </div>
          <div class="text-on-surface-variant flex items-start gap-1">
            <span class="material-symbols-outlined text-[16px] text-outline flex-shrink-0">pin_drop</span>
            <span class="truncate">${cust.city ? cust.city + ' - ' : ''}${cust.address || 'العنوان غير محدد'}</span>
          </div>
        </div>

        <div class="flex flex-col max-h-36 overflow-y-auto">
          ${itemsHtml}
        </div>

        <div class="flex items-center justify-between pt-2 border-t border-surface-container text-xs">
          <span class="text-outline">طريقة الدفع: <b>${order.paymentMethod === 'card' ? 'فيزا' : order.paymentMethod === 'wallet' ? 'محفظة' : 'كاش'}</b></span>
          <span class="text-primary font-bold text-base">الإجمالي: ${order.total} ج.م</span>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-3 border-t border-surface-container">
        <button onclick="viewOrderDetails('${order.orderNumber}')" 
                class="flex-1 py-2 bg-surface-container hover:bg-surface-container-high rounded-xl text-xs font-bold text-on-surface transition-colors flex items-center justify-center gap-1 cursor-pointer">
          <span class="material-symbols-outlined text-[16px]">visibility</span>
          <span>عرض الفاتورة</span>
        </button>
        <a href="track.html?orderId=${order.orderNumber}" target="_blank"
           class="py-2 px-3 bg-primary hover:bg-primary-container text-on-primary rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1" title="تتبع الطلب">
          <span class="material-symbols-outlined text-[16px]">my_location</span>
          <span>تتبع</span>
        </a>
      </div>
    `;

    container.appendChild(card);
  });
}

// تغيير الحالة من القائمة المنسدلة في الجدول
window.handleStatusChangeFromTable = async function(orderId, newStatus) {
  try {
    await window.FirebaseService.updateOrderStatus(orderId, newStatus);
    if (window.CartManager) {
      window.CartManager.showToast('تم تحديث حالة الطلب في Firebase بنجاح!', 'success');
    }
  } catch (e) {
    console.error(e);
  }
};

// فتح نافذة تفاصيل الفاتورة والطلب
window.viewOrderDetails = function(orderNumber) {
  const order = ordersData.find(o => o.orderNumber === orderNumber);
  if (!order) return;

  selectedOrder = order;
  const modal = document.getElementById('orderDetailModal');
  if (!modal) return;

  document.getElementById('modalOrderNum').innerText = order.orderNumber;
  
  const st = getStatusBadge(order.status);
  const statusEl = document.getElementById('modalOrderStatus');
  statusEl.className = `px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${st.class}`;
  statusEl.innerHTML = `<span class="material-symbols-outlined text-[14px]">${st.icon}</span><span>${st.label}</span>`;

  // العميل
  const cust = order.customer || {};
  document.getElementById('modalCustName').innerText = cust.name || 'عميل ديوان';
  document.getElementById('modalCustPhone').innerText = cust.phone || '-';
  document.getElementById('modalCustAddress').innerText = (cust.city ? cust.city + ' - ' : '') + (cust.address || '-');
  document.getElementById('modalCustNotes').innerText = cust.notes || 'لا توجد ملاحظات إضافية';

  // روابط التواصل
  const callBtn = document.getElementById('modalCallBtn');
  const waBtn = document.getElementById('modalWhatsAppBtn');
  if (callBtn) callBtn.href = `tel:${cust.phone || ''}`;
  if (waBtn) {
    const text = encodeURIComponent(`مرحباً ${cust.name || ''}، نتواصل معك من ديوان الضيافة بخصوص طلبك رقم ${order.orderNumber}`);
    waBtn.href = `https://wa.me/${cust.phone ? cust.phone.replace(/[^0-9]/g, '') : ''}?text=${text}`;
  }

  // الأصناف
  const itemsContainer = document.getElementById('modalItemsList');
  if (itemsContainer) {
    itemsContainer.innerHTML = '';
    (order.items || []).forEach(item => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between py-2 border-b border-surface-container text-xs';
      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-[11px]">${item.quantity}x</span>
          <span class="font-semibold text-on-surface">${item.title}</span>
        </div>
        <span class="font-bold text-primary">${item.price * item.quantity} ج.م</span>
      `;
      itemsContainer.appendChild(row);
    });
  }

  // المالية
  document.getElementById('modalSubtotal').innerText = `${order.subtotal || 0} ج.م`;
  document.getElementById('modalDeliveryFee').innerText = `${order.deliveryFee || 20} ج.م`;
  document.getElementById('modalDiscount').innerText = `-${order.discount || 0} ج.م`;
  document.getElementById('modalTotal').innerText = `${order.total || 0} ج.م`;
  document.getElementById('modalPaymentMethod').innerText = order.paymentMethod === 'card' ? 'فيزا / كارت' : order.paymentMethod === 'wallet' ? 'محفظة إلكترونية' : 'كاش عند الاستلام';

  modal.classList.remove('hidden');
  modal.classList.add('flex');
};

window.closeOrderDetailModal = function() {
  const modal = document.getElementById('orderDetailModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// طباعة فاتورة الطلب
window.printCurrentOrder = function() {
  window.print();
};
