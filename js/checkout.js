// ==========================================================================
// منطق صفحة السلة وإتمام الطلب (Checkout Page Logic)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  renderCartPage();
  prefillUserInfo();

  window.addEventListener('cartUpdated', () => {
    renderCartPage();
  });

  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
  }
});

// تعبئة بيانات المستخدم المسجل تلقائياً
function prefillUserInfo() {
  if (window.auth) {
    window.auth.onAuthStateChanged(user => {
      if (user) {
        const nameInput = document.getElementById('checkoutName');
        const phoneInput = document.getElementById('checkoutPhone');
        if (nameInput && !nameInput.value && user.displayName) {
          nameInput.value = user.displayName;
        }
        if (phoneInput && !phoneInput.value && user.phoneNumber) {
          phoneInput.value = user.phoneNumber;
        }
      }
    });
  }
}

// رسم أصناف السلة في صفحة السلة المخصصة
function renderCartPage() {
  const container = document.getElementById('cartPageItemsContainer');
  const emptyState = document.getElementById('cartEmptyState');
  const checkoutSection = document.getElementById('checkoutSection');

  if (!container || !window.CartManager) return;

  const cart = window.CartManager.getCart();
  const subtotal = window.CartManager.getSubtotal();
  const discount = window.CartManager.getDiscount();
  const delivery = window.CartManager.deliveryFee;
  const total = window.CartManager.getFinalTotal();

  // تحديث المجاميع
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const discountEl = document.getElementById('checkoutDiscount');
  const deliveryEl = document.getElementById('checkoutDelivery');
  const totalEl = document.getElementById('checkoutTotal');

  if (subtotalEl) subtotalEl.innerText = `${subtotal} ج.م`;
  if (discountEl) discountEl.innerText = `-${discount} ج.م`;
  if (deliveryEl) deliveryEl.innerText = `${delivery} ج.م`;
  if (totalEl) totalEl.innerText = `${total} ج.م`;

  if (cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (checkoutSection) checkoutSection.classList.add('hidden');
    container.innerHTML = '';
    return;
  }

  if (emptyState) emptyState.classList.add('hidden');
  if (checkoutSection) checkoutSection.classList.remove('hidden');

  container.innerHTML = '';

  cart.forEach(item => {
    const itemCard = document.createElement('div');
    itemCard.className = 'flex flex-col sm:flex-row items-center justify-between p-space-md bg-surface-container-lowest rounded-xl shadow-sm gap-space-md';

    itemCard.innerHTML = `
      <div class="flex items-center gap-space-md w-full sm:w-auto">
        <div class="w-20 h-20 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex flex-col">
          <h4 class="font-headline-sm text-headline-sm font-bold text-on-surface">${item.title}</h4>
          <span class="font-body-sm text-body-sm text-outline">سعر القطعة: ${item.price} ج.م</span>
          <span class="font-label-md text-label-md font-bold text-primary mt-1">الإجمالي: ${item.price * item.quantity} ج.م</span>
        </div>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-space-md w-full sm:w-auto border-t sm:border-t-0 pt-space-xs sm:pt-0">
        <div class="flex items-center bg-surface-container rounded-full px-space-xs py-1">
          <button type="button" onclick="CartManager.updateQuantity('${item.id}', -1)" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold cursor-pointer text-lg">-</button>
          <span class="font-label-md text-label-md px-3 font-bold">${item.quantity}</span>
          <button type="button" onclick="CartManager.updateQuantity('${item.id}', 1)" class="w-8 h-8 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold cursor-pointer text-lg">+</button>
        </div>
        
        <button type="button" onclick="CartManager.removeItem('${item.id}')" class="w-9 h-9 rounded-full bg-error-container/20 text-error hover:bg-error-container/40 flex items-center justify-center transition-colors cursor-pointer" title="حذف الصنف">
          <span class="material-symbols-outlined text-[20px]">delete</span>
        </button>
      </div>
    `;

    container.appendChild(itemCard);
  });
}

// تطبيق كود الخصم في صفحة السلة
window.applyCheckoutCoupon = function() {
  const couponInput = document.getElementById('checkoutCouponInput');
  if (!couponInput) return;

  const code = couponInput.value.trim().toUpperCase();
  if (!code) {
    window.CartManager.showToast('الرجاء إدخال كود الكوبون', 'error');
    return;
  }

  if (code === 'NAKHA20') {
    window.CartManager.setCoupon(code);
    window.CartManager.showToast('تم تطبيق خصم ٢٠٪ بنجاح!', 'success');
    renderCartPage();
  } else {
    window.CartManager.showToast('كود الكوبون غير صالح أو منتهي الصلاحية', 'error');
  }
};

// إرسال الطلب من صفحة السلة وحفظه في Firebase Firestore
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  const cart = window.CartManager.getCart();
  if (cart.length === 0) {
    window.CartManager.showToast('سلتك فارغة!', 'error');
    return;
  }

  const submitBtn = document.getElementById('checkoutSubmitBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>جاري حفظ وتأكيد الطلب في Firebase...</span>`;
  }

  const name = document.getElementById('checkoutName').value.trim();
  const phone = document.getElementById('checkoutPhone').value.trim();
  const city = document.getElementById('checkoutCity').value.trim();
  const address = document.getElementById('checkoutAddress').value.trim();
  const notes = document.getElementById('checkoutNotes')?.value.trim() || '';
  const paymentMethod = document.querySelector('input[name="checkoutPayment"]:checked')?.value || 'cash';

  const orderNumber = 'DWN-' + Math.floor(1000 + Math.random() * 9000);
  const subtotal = window.CartManager.getSubtotal();
  const discount = window.CartManager.getDiscount();
  const delivery = window.CartManager.deliveryFee;
  const total = window.CartManager.getFinalTotal();

  const orderPayload = {
    orderNumber,
    customer: {
      name,
      phone,
      city,
      address,
      notes
    },
    items: cart,
    subtotal,
    discount,
    deliveryFee: delivery,
    total,
    paymentMethod,
    status: 'pending',
    userId: window.auth?.currentUser?.uid || 'guest',
    userEmail: window.auth?.currentUser?.email || null
  };

  try {
    // حفظ الطلب في Firestore
    await window.FirebaseService.createOrder(orderPayload);

    // تفريغ السلة
    window.CartManager.clearCart();

    // التوجيه المباشر إلى صفحة التتبع مع رقم الطلب الجديد
    window.location.href = `track.html?orderId=${orderNumber}&newOrder=1`;

  } catch (error) {
    console.error("Checkout submission failed:", error);
    alert("تعذر إتمام الطلب، يُرجى مراجعة الاتصال والمحاولة لاحقاً.");
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span>تأكيد الطلب الآن</span><span class="material-symbols-outlined text-[20px]">check_circle</span>`;
    }
  }
}
