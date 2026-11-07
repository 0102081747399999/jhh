// ==========================================================================
// لوحة تحكم إدارة الطلبات والمطبخ بالوقت الفعلي (Real-Time Admin Dashboard)
// ==========================================================================

let allOrdersCache = [];
let currentFilter = 'all';
let previousOrdersCount = 0;

document.addEventListener('DOMContentLoaded', () => {
  initAdminDashboard();
});

function initAdminDashboard() {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;

  // الاستماع لجميع الطلبات في الوقت الفعلي
  window.FirebaseService.listenToAllOrders((orders) => {
    // تشغيل تنبيه صوتي عند وصول طلب جديد
    if (previousOrdersCount > 0 && orders.length > previousOrdersCount) {
      playNewOrderSound();
      if (window.CartManager) {
        window.CartManager.showToast('🔔 وصل طلب جديد للتو!', 'success');
      }
    }
    previousOrdersCount = orders.length;

    allOrdersCache = orders;
    updateDashboardStats(orders);
    renderAdminOrdersList();
  });
}

// تحديث الإحصائيات في أعلى اللوحة
function updateDashboardStats(orders) {
  const totalCountEl = document.getElementById('statTotalOrders');
  const activeCountEl = document.getElementById('statActiveOrders');
  const revenueEl = document.getElementById('statTotalRevenue');
  const completedCountEl = document.getElementById('statCompletedOrders');

  const total = orders.length;
  const active = orders.filter(o => o.status === 'pending' || o.status === 'cooking' || o.status === 'delivering').length;
  const completed = orders.filter(o => o.status === 'completed').length;
  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((sum, o) => sum + (Number(o.total) || 0), 0);

  if (totalCountEl) totalCountEl.innerText = total;
  if (activeCountEl) activeCountEl.innerText = active;
  if (revenueEl) revenueEl.innerText = `${revenue.toLocaleString()} ج.م`;
  if (completedCountEl) completedCountEl.innerText = completed;
}

// تصفية الطلبات المعروضة
window.filterAdminOrders = function(status, btnElement) {
  currentFilter = status;

  document.querySelectorAll('.admin-filter-btn').forEach(btn => {
    btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    btn.classList.add('bg-surface-container', 'text-on-surface-variant');
  });

  if (btnElement) {
    btnElement.classList.remove('bg-surface-container', 'text-on-surface-variant');
    btnElement.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
  }

  renderAdminOrdersList();
};

// رسم قائمة الطلبات
function renderAdminOrdersList() {
  const container = document.getElementById('adminOrdersList');
  if (!container) return;

  let filtered = allOrdersCache;
  if (currentFilter !== 'all') {
    filtered = allOrdersCache.filter(o => o.status === currentFilter);
  }

  container.innerHTML = '';

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-outline bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
        <span class="material-symbols-outlined text-[56px] text-surface-container-highest">inventory_2</span>
        <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface-variant mt-2">لا توجد طلبات في هذا القسم</h4>
        <p class="text-sm mt-1">أي طلب جديد سيظهر هنا فوراً في الوقت الفعلي عبر فيربيز</p>
      </div>
    `;
    return;
  }

  filtered.forEach(order => {
    const card = createOrderCard(order);
    container.appendChild(card);
  });
}

// إنشاء بطاقة الطلب
function createOrderCard(order) {
  const card = document.createElement('div');
  card.className = 'bg-surface-container-lowest rounded-2xl p-space-md shadow-sm border border-surface-container-high/70 flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow';

  // حالة الطلب
  const statusConfig = {
    pending: { label: 'قيد المراجعة', class: 'bg-amber-100 text-amber-900 border-amber-300', icon: 'schedule' },
    cooking: { label: 'جاري التحضير', class: 'bg-blue-100 text-blue-900 border-blue-300', icon: 'outdoor_grill' },
    delivering: { label: 'في الطريق', class: 'bg-orange-100 text-orange-900 border-orange-300', icon: 'local_shipping' },
    completed: { label: 'مكتمل ومسلم', class: 'bg-green-100 text-green-900 border-green-300', icon: 'check_circle' },
    cancelled: { label: 'ملغي', class: 'bg-red-100 text-red-900 border-red-300', icon: 'cancel' }
  };

  const st = statusConfig[order.status] || statusConfig.pending;

  // تنسيق الوقت
  let timeStr = 'الآن';
  if (order.createdAt && order.createdAt.toDate) {
    timeStr = order.createdAt.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  } else if (order.createdLocal) {
    timeStr = new Date(order.createdLocal).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }

  // عناصر الطلب
  let itemsHtml = '';
  if (order.items && order.items.length) {
    itemsHtml = order.items.map(i => `
      <div class="flex items-center justify-between text-xs py-1 border-b border-surface-container/50">
        <span class="font-semibold text-on-surface">${i.quantity}x ${i.title}</span>
        <span class="text-primary font-bold">${i.price * i.quantity} ج.م</span>
      </div>
    `).join('');
  }

  const cust = order.customer || {};

  card.innerHTML = `
    <div class="flex flex-col gap-3">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="font-headline-sm text-headline-sm font-bold text-primary">${order.orderNumber}</span>
          <span class="text-xs text-outline flex items-center gap-0.5">
            <span class="material-symbols-outlined text-[14px]">schedule</span> ${timeStr}
          </span>
        </div>
        <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${st.class}">
          <span class="material-symbols-outlined text-[14px]">${st.icon}</span>
          <span>${st.label}</span>
        </span>
      </div>

      <!-- Customer info -->
      <div class="p-3 bg-surface-container-low rounded-xl text-xs flex flex-col gap-1.5 text-right">
        <div class="flex items-center justify-between">
          <span class="font-bold text-on-surface flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px] text-primary">person</span> ${cust.name || 'عميل'}
          </span>
          <a href="tel:${cust.phone || ''}" class="text-secondary font-bold hover:underline flex items-center gap-1" dir="ltr">
            <span class="material-symbols-outlined text-[14px]">call</span> ${cust.phone || '-'}
          </a>
        </div>
        <div class="text-on-surface-variant flex items-start gap-1">
          <span class="material-symbols-outlined text-[16px] text-outline flex-shrink-0">pin_drop</span>
          <span>${cust.city ? cust.city + ' - ' : ''}${cust.address || 'العنوان غير محدد'}</span>
        </div>
      </div>

      <!-- Items List -->
      <div class="flex flex-col max-h-32 overflow-y-auto pr-1">
        ${itemsHtml}
      </div>

      <!-- Total & Payment -->
      <div class="flex items-center justify-between pt-2 border-t border-surface-container font-label-md text-sm">
        <span class="text-outline">طريقة الدفع: <b class="text-on-surface">${order.paymentMethod === 'card' ? 'فيزا' : order.paymentMethod === 'wallet' ? 'محفظة' : 'كاش'}</b></span>
        <span class="text-primary font-bold text-base">الإجمالي: ${order.total} ج.م</span>
      </div>
    </div>

    <!-- Actions Buttons -->
    <div class="flex flex-wrap items-center gap-1.5 pt-3 border-t border-surface-container-high/60">
      ${order.status === 'pending' ? `
        <button onclick="changeOrderStatus('${order.id || order.orderNumber}', 'cooking')" class="flex-1 py-1.5 px-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[16px]">outdoor_grill</span> تحضير
        </button>
      ` : ''}

      ${order.status === 'cooking' ? `
        <button onclick="changeOrderStatus('${order.id || order.orderNumber}', 'delivering')" class="flex-1 py-1.5 px-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[16px]">delivery_dining</span> إرسال للتوصيل
        </button>
      ` : ''}

      ${order.status === 'delivering' ? `
        <button onclick="changeOrderStatus('${order.id || order.orderNumber}', 'completed')" class="flex-1 py-1.5 px-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1">
          <span class="material-symbols-outlined text-[16px]">verified</span> تم التوصيل
        </button>
      ` : ''}

      ${order.status !== 'completed' && order.status !== 'cancelled' ? `
        <button onclick="changeOrderStatus('${order.id || order.orderNumber}', 'cancelled')" class="py-1.5 px-2.5 bg-surface-container hover:bg-red-50 text-outline hover:text-error rounded-lg text-xs font-bold transition-colors" title="إلغاء الطلب">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      ` : ''}

      <a href="track.html?orderId=${order.orderNumber}" target="_blank" class="py-1.5 px-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-lg text-xs font-bold transition-colors" title="معاينة شاشة العميل">
        <span class="material-symbols-outlined text-[16px]">open_in_new</span>
      </a>
    </div>
  `;

  return card;
}

// دالة تغيير حالة الطلب
window.changeOrderStatus = async function(orderId, newStatus) {
  try {
    const success = await window.FirebaseService.updateOrderStatus(orderId, newStatus);
    if (success && window.CartManager) {
      window.CartManager.showToast(`تم تحديث حالة الطلب إلى "${getStatusArabicLabel(newStatus)}"`, 'success');
    }
  } catch (err) {
    console.error("Error updating status:", err);
  }
};

function getStatusArabicLabel(st) {
  const map = {
    pending: 'قيد المراجعة',
    cooking: 'جاري التحضير',
    delivering: 'في الطريق',
    completed: 'مكتمل',
    cancelled: 'ملغي'
  };
  return map[st] || st;
}

// صوت تنبيه عند وصول طلب جديد
function playNewOrderSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.35);
  } catch (e) {
    console.log("Audio not supported or blocked by browser policy");
  }
}
