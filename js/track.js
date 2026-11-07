// ==========================================================================
// تتبع الطلبات المباشر بالوقت الفعلي (Real-Time Order Tracking Logic)
// ==========================================================================

let activeTrackingUnsubscribe = null;

const STATUS_STAGES = [
  { key: 'pending', label: 'تم استلام الطلب', desc: 'تم استلام طلبك ومراجعته بواسطة الفرع', icon: 'receipt_long', step: 1 },
  { key: 'cooking', label: 'جاري التحضير', desc: 'يقوم الشيف الآن بشواء وتحضير أطباقك الطازجة', icon: 'outdoor_grill', step: 2 },
  { key: 'delivering', label: 'في الطريق إليك', desc: 'الطلب بحوزة مندوب التوصيل وهو في الطريق لموقعك', icon: 'delivery_dining', step: 3 },
  { key: 'completed', label: 'تم التوصيل بنجاح', desc: 'بالهناء والشفاء! نتمنى لك وجبة شهية', icon: 'verified', step: 4 }
];

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  let orderId = urlParams.get('orderId');
  const isNew = urlParams.get('newOrder');

  if (isNew && window.CartManager) {
    window.CartManager.showToast('تم إرسال طلبك بنجاح وجاري تتبعه الآن!', 'success');
  }

  if (orderId) {
    orderId = orderId.trim();
    const trackInput = document.getElementById('trackingInput');
    if (trackInput) trackInput.value = orderId;
    startTrackingOrder(orderId);
  } else {
    // محاولة جلب آخر طلب تم عمله
    const lastOrders = window.FirebaseService.getAllLocalOrders();
    if (lastOrders.length > 0) {
      const latest = lastOrders[0];
      const trackInput = document.getElementById('trackingInput');
      if (trackInput) trackInput.value = latest.orderNumber;
      startTrackingOrder(latest.orderNumber);
    }
  }

  const trackForm = document.getElementById('trackOrderForm');
  if (trackForm) {
    trackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = document.getElementById('trackingInput').value.trim();
      if (!code) return;
      startTrackingOrder(code);
    });
  }
});

// بدء التتبع المباشر للطلب
function startTrackingOrder(orderCode) {
  // تنظيف أي متابعة سابقة
  if (typeof activeTrackingUnsubscribe === 'function') {
    activeTrackingUnsubscribe();
  }

  // ضبط بادئة DWN- إن لم تكن مكتوبة
  let formattedCode = orderCode.toUpperCase();
  if (!formattedCode.startsWith('DWN-') && !formattedCode.startsWith('LOCAL_')) {
    formattedCode = 'DWN-' + formattedCode;
  }

  const detailsContainer = document.getElementById('trackingDetailsContainer');
  const notFoundContainer = document.getElementById('trackingNotFound');
  const loaderContainer = document.getElementById('trackingLoader');

  if (loaderContainer) loaderContainer.classList.remove('hidden');
  if (detailsContainer) detailsContainer.classList.add('hidden');
  if (notFoundContainer) notFoundContainer.classList.add('hidden');

  activeTrackingUnsubscribe = window.FirebaseService.listenToOrder(formattedCode, (order) => {
    if (loaderContainer) loaderContainer.classList.add('hidden');

    if (!order) {
      if (notFoundContainer) notFoundContainer.classList.remove('hidden');
      if (detailsContainer) detailsContainer.classList.add('hidden');
      return;
    }

    if (notFoundContainer) notFoundContainer.classList.add('hidden');
    if (detailsContainer) detailsContainer.classList.remove('hidden');

    renderOrderTrackingUI(order);
  });
}

// رسم واجهة التتبع وحالة المراحل
function renderOrderTrackingUI(order) {
  document.getElementById('displayOrderNumber').innerText = order.orderNumber || '#DWN';
  
  // التاريخ والوقت
  let dateText = 'الآن';
  if (order.createdAt && order.createdAt.toDate) {
    dateText = order.createdAt.toDate().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  } else if (order.createdLocal) {
    dateText = new Date(order.createdLocal).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }
  document.getElementById('displayOrderTime').innerText = dateText;

  // تحديد المرحلة الحالية
  const status = order.status || 'pending';
  const stageIndex = STATUS_STAGES.findIndex(s => s.key === status);
  const currentStep = stageIndex >= 0 ? stageIndex + 1 : 1;

  // تحديث نصوص الحالة
  const currentStageObj = STATUS_STAGES[stageIndex >= 0 ? stageIndex : 0];
  document.getElementById('currentStatusTitle').innerText = currentStageObj.label;
  document.getElementById('currentStatusDesc').innerText = currentStageObj.desc;

  // تحديث شريط الخطوات (Stepper)
  for (let i = 1; i <= 4; i++) {
    const stepEl = document.getElementById(`step-${i}`);
    const lineEl = document.getElementById(`line-${i}`);
    const iconEl = document.getElementById(`step-icon-${i}`);

    if (stepEl) {
      if (i < currentStep) {
        // مكتمل
        stepEl.className = 'w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold shadow-md';
        if (iconEl) iconEl.innerText = 'check';
        if (lineEl) lineEl.className = 'flex-1 h-1 bg-primary transition-all duration-500';
      } else if (i === currentStep) {
        // المرحلة الحالية
        stepEl.className = 'w-10 h-10 rounded-full bg-secondary-container text-on-secondary-fixed flex items-center justify-center font-bold ring-4 ring-secondary-fixed/50 animate-pulse';
        if (iconEl) iconEl.innerText = STATUS_STAGES[i - 1].icon;
        if (lineEl) lineEl.className = 'flex-1 h-1 bg-surface-container-highest transition-all duration-500';
      } else {
        // قادم
        stepEl.className = 'w-10 h-10 rounded-full bg-surface-container text-outline flex items-center justify-center font-bold';
        if (iconEl) iconEl.innerText = STATUS_STAGES[i - 1].icon;
        if (lineEl) lineEl.className = 'flex-1 h-1 bg-surface-container-highest transition-all duration-500';
      }
    }
  }

  // رسم تفاصيل الأصناف المطلوبة
  const itemsList = document.getElementById('trackingItemsList');
  if (itemsList && order.items) {
    itemsList.innerHTML = '';
    order.items.forEach(item => {
      const row = document.createElement('div');
      row.className = 'flex items-center justify-between py-2 border-b border-surface-container/60 text-sm';
      row.innerHTML = `
        <div class="flex items-center gap-2">
          <span class="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold flex items-center justify-center text-xs">${item.quantity}x</span>
          <span class="font-medium text-on-surface">${item.title}</span>
        </div>
        <span class="font-bold text-primary">${item.price * item.quantity} ج.م</span>
      `;
      itemsList.appendChild(row);
    });
  }

  // بيانات العميل والتوصيل
  if (order.customer) {
    document.getElementById('trackingCustName').innerText = order.customer.name || 'عميل ديوان';
    document.getElementById('trackingCustPhone').innerText = order.customer.phone || '-';
    document.getElementById('trackingCustAddress').innerText = order.customer.address || '-';
  }

  // ملخص الحساب
  document.getElementById('trackingSubtotal').innerText = `${order.subtotal || 0} ج.م`;
  document.getElementById('trackingDiscount').innerText = `-${order.discount || 0} ج.م`;
  document.getElementById('trackingDeliveryFee').innerText = `${order.deliveryFee || 20} ج.م`;
  document.getElementById('trackingTotal').innerText = `${order.total || 0} ج.م`;
}
