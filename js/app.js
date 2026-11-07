// ==========================================================================
// منطق الصفحة الرئيسية وقائمة الطعام (Main App Logic)
// ==========================================================================

let activeCategory = 'all';

document.addEventListener('DOMContentLoaded', () => {
  renderDishesGrid(MENU_ITEMS);
  checkUrlParams();
  
  // الاستماع لتحديثات السلة لإعادة رسم الدرج إن كان مفتوحاً
  window.addEventListener('cartUpdated', () => {
    renderCartDrawer();
  });
});

// التحقق من المعاملات في الرابط (مثل البحث أو الفلتر)
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const search = urlParams.get('search');
  const cat = urlParams.get('category');

  if (search) {
    const searchInput = document.querySelector('header input[type="search"]');
    if (searchInput) searchInput.value = search;
    filterBySearch(search);
  } else if (cat) {
    filterCategory(cat);
  }
}

// عرض شبكة الأطباق ديناميكياً
function renderDishesGrid(items) {
  const grid = document.getElementById('dishesGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full py-space-xl flex flex-col items-center justify-center text-center">
        <span class="material-symbols-outlined text-[64px] text-outline mb-space-sm">search_off</span>
        <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">لا توجد أطباق مطابقة للبحث</h4>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1">جرّب البحث بكلمات أخرى أو تصفح باقي الأقسام</p>
        <button onclick="filterCategory('all')" class="mt-space-md px-space-lg py-space-xs rounded-full bg-primary text-on-primary font-label-md">عرض كل الأصناف</button>
      </div>
    `;
    updateAvailableCount(0);
    return;
  }

  items.forEach(item => {
    const card = document.createElement('article');
    card.className = 'dish-card group flex flex-col bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300';
    card.setAttribute('data-category', item.category);

    card.innerHTML = `
      <div class="relative w-full h-52 overflow-hidden bg-surface-container">
        <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
             src="${item.image}" alt="${item.title}" loading="lazy" />
        ${item.tag ? `<span class="absolute top-space-sm right-space-sm bg-primary text-on-primary font-label-sm text-label-sm px-space-sm py-space-xs rounded-full shadow-md font-semibold">${item.tag}</span>` : ''}
        <span class="absolute bottom-space-sm left-space-sm bg-inverse-surface/85 backdrop-blur-md text-inverse-on-surface font-label-sm text-label-sm px-space-sm py-space-xs rounded-full flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px] text-secondary-fixed">star</span> ${item.rating} (${item.reviews})
        </span>
      </div>
      <div class="flex flex-col p-space-md flex-1 justify-between gap-space-md">
        <div class="flex flex-col gap-space-xs text-right">
          <div class="flex items-center justify-between">
            <h4 class="font-headline-sm text-headline-sm text-on-surface font-bold">${item.title}</h4>
          </div>
          <p class="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
            ${item.desc}
          </p>
          <div class="flex items-center gap-space-md text-outline font-label-sm text-label-sm pt-space-xs">
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">timer</span> ${item.time}</span>
            <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[14px] text-primary">local_fire_department</span> ${item.calories}</span>
          </div>
        </div>
        <div class="flex items-center justify-between pt-space-sm border-t border-surface-container/70">
          <div class="flex flex-col text-right">
            <span class="font-headline-sm text-headline-sm font-bold text-primary">${item.price} ج.م</span>
            ${item.oldPrice ? `<span class="font-label-sm text-label-sm text-outline line-through">${item.oldPrice} ج.م</span>` : ''}
          </div>
          <button class="add-to-cart-btn flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all active:scale-95 cursor-pointer shadow-sm" 
                  onclick="handleAddToCart('${item.id}', this)">
            <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
            <span>أضف للسلة</span>
          </button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  updateAvailableCount(items.length);
}

// دالة إضافة الصنف للسلة
window.handleAddToCart = function(itemId, btn) {
  const item = MENU_ITEMS.find(i => i.id === itemId);
  if (item && window.CartManager) {
    window.CartManager.addItem(item, btn);
  }
};

// تصفية حسب التصنيف
window.filterCategory = function(cat) {
  activeCategory = cat;

  // تحديث شكل أزرار التصنيف
  document.querySelectorAll('.category-btn').forEach(btn => {
    if (btn.getAttribute('data-category') === cat) {
      btn.classList.remove('bg-surface-container', 'text-on-surface-variant');
      btn.classList.add('bg-primary', 'text-on-primary', 'shadow-sm');
    } else {
      btn.classList.add('bg-surface-container', 'text-on-surface-variant');
      btn.classList.remove('bg-primary', 'text-on-primary', 'shadow-sm');
    }
  });

  const filtered = cat === 'all' 
    ? MENU_ITEMS 
    : MENU_ITEMS.filter(item => item.category === cat);

  renderDishesGrid(filtered);
};

// تصفية بالبحث
window.filterBySearch = function(query) {
  if (!query) {
    window.filterCategory(activeCategory);
    return;
  }

  const normalized = query.toLowerCase();
  const filtered = MENU_ITEMS.filter(item => 
    item.title.toLowerCase().includes(normalized) ||
    item.desc.toLowerCase().includes(normalized)
  );

  renderDishesGrid(filtered);
};

function updateAvailableCount(count) {
  const el = document.getElementById('availableItemsCount');
  if (el) el.innerText = `${count} أطباق`;
}

// نسخ كود الكوبون
window.copyCouponCode = function(code) {
  navigator.clipboard.writeText(code).then(() => {
    if (window.CartManager) {
      window.CartManager.setCoupon(code);
      window.CartManager.showToast(`تم نسخ الكوبون ${code} وتطبيقه بنجاح!`, 'success');
    }
    const btn = document.getElementById('copyBtn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<span class="material-symbols-outlined text-[18px]">done</span><span>تم النسخ!</span>`;
      btn.classList.add('bg-tertiary-fixed', 'text-on-tertiary-fixed');
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.classList.remove('bg-tertiary-fixed', 'text-on-tertiary-fixed');
      }, 2000);
    }
  });
};

// رسم محتويات درج السلة المنزلق
window.renderCartDrawer = function() {
  const list = document.getElementById('cartItemsList');
  if (!list || !window.CartManager) return;

  const cart = window.CartManager.getCart();
  const subtotal = window.CartManager.getSubtotal();
  const discount = window.CartManager.getDiscount();
  const total = window.CartManager.getFinalTotal();
  const totalCount = window.CartManager.getTotalCount();

  const countEl = document.getElementById('cartDrawerCount');
  if (countEl) countEl.innerText = `${totalCount} عناصر مضافة`;

  const subtotalEl = document.getElementById('cartSubtotal');
  const discountEl = document.getElementById('cartDiscount');
  const totalEl = document.getElementById('cartTotal');
  const checkoutBtn = document.getElementById('checkoutBtn');

  if (subtotalEl) subtotalEl.innerText = `${subtotal} ج.م`;
  if (discountEl) discountEl.innerText = `-${discount} ج.م`;
  if (totalEl) totalEl.innerText = `${total} ج.م`;

  if (checkoutBtn) {
    if (totalCount > 0) {
      checkoutBtn.removeAttribute('disabled');
    } else {
      checkoutBtn.setAttribute('disabled', 'true');
    }
  }

  list.innerHTML = '';

  if (cart.length === 0) {
    list.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full text-center py-space-xl text-outline">
        <span class="material-symbols-outlined text-[56px] text-surface-container-highest mb-space-sm">production_quantity_limits</span>
        <p class="font-headline-sm text-headline-sm text-on-surface-variant font-semibold">سلتك فارغة حالياً</p>
        <p class="font-body-sm text-body-sm text-outline mt-1">تصفح وجباتنا الشهية وأضف ما يعجبك بنقرة واحدة</p>
      </div>
    `;
    return;
  }

  cart.forEach(item => {
    const row = document.createElement('div');
    row.className = 'flex items-center justify-between gap-space-sm pt-space-sm';
    row.innerHTML = `
      <div class="flex items-center gap-space-sm flex-1 text-right">
        <div class="w-12 h-12 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
          <img src="${item.image}" alt="${item.title}" class="w-full h-full object-cover">
        </div>
        <div class="flex flex-col">
          <h5 class="font-label-md text-label-md font-bold text-on-surface">${item.title}</h5>
          <span class="font-body-sm text-body-sm text-primary font-semibold">${item.price} ج.م</span>
        </div>
      </div>
      <div class="flex items-center gap-space-xs">
        <div class="flex items-center bg-surface-container rounded-full px-space-xs py-1">
          <button onclick="CartManager.updateQuantity('${item.id}', -1)" class="w-6 h-6 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold cursor-pointer">-</button>
          <span class="font-label-md text-label-md px-2 font-semibold">${item.quantity}</span>
          <button onclick="CartManager.updateQuantity('${item.id}', 1)" class="w-6 h-6 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors font-bold cursor-pointer">+</button>
        </div>
        <button onclick="CartManager.removeItem('${item.id}')" class="w-8 h-8 rounded-full text-outline hover:text-error flex items-center justify-center transition-colors cursor-pointer">
          <span class="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    `;
    list.appendChild(row);
  });
};

// مودال الطلب السريع
window.openQuickCheckoutModal = function() {
  const cart = window.CartManager ? window.CartManager.getCart() : [];
  if (cart.length === 0) {
    if (window.CartManager) window.CartManager.showToast('سلتك فارغة! أضف بعض الأطباق أولاً', 'error');
    return;
  }

  if (window.closeCartDrawer) window.closeCartDrawer();
  const modal = document.getElementById('checkoutModalBackdrop');
  if (modal) {
    const total = window.CartManager.getFinalTotal();
    const sumEl = document.getElementById('modalSummaryTotal');
    if (sumEl) sumEl.innerText = `${total} ج.م`;

    // إذا كان المستخدم مسجل دخوله نملأ الاسم تلقائياً
    if (window.auth && window.auth.currentUser) {
      const u = window.auth.currentUser;
      const nameInput = document.getElementById('custName');
      if (nameInput && !nameInput.value && u.displayName) {
        nameInput.value = u.displayName;
      }
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
};

window.closeQuickCheckoutModal = function() {
  const modal = document.getElementById('checkoutModalBackdrop');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
};

// معالجة إرسال الطلب وحفظه في Firebase Firestore
window.handleQuickOrderSubmit = async function(e) {
  e.preventDefault();
  const submitBtn = document.getElementById('submitOrderBtn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[20px]">sync</span><span>جاري تأكيد وحفظ الطلب في فيربيز...</span>`;
  }

  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'cash';

  const cart = window.CartManager.getCart();
  const subtotal = window.CartManager.getSubtotal();
  const discount = window.CartManager.getDiscount();
  const delivery = window.CartManager.deliveryFee;
  const total = window.CartManager.getFinalTotal();

  // رقم الطلب المميز
  const orderNumber = 'DWN-' + Math.floor(1000 + Math.random() * 9000);

  const orderPayload = {
    orderNumber,
    customer: {
      name,
      phone,
      address
    },
    items: cart,
    subtotal,
    discount,
    deliveryFee: delivery,
    total,
    paymentMethod,
    status: 'pending', // pending, cooking, delivering, completed, cancelled
    userId: window.auth?.currentUser?.uid || 'guest',
    userEmail: window.auth?.currentUser?.email || null
  };

  try {
    // حفظ في Firebase Firestore عبر الخدمة الموحدة
    const result = await window.FirebaseService.createOrder(orderPayload);
    
    // إغلاق مودال الطلب
    closeQuickCheckoutModal();

    // عرض نافذة النجاح
    const successModal = document.getElementById('orderSuccessModal');
    if (successModal) {
      document.getElementById('orderTrackingNumber').innerText = '#' + orderNumber;
      
      // رابط الواتساب
      const waText = encodeURIComponent(`مرحباً ديوان الضيافة، قمت بطلب جديد برقم ${orderNumber} بقيمة ${total} ج.م باسم: ${name}`);
      const waLink = document.getElementById('whatsappFollowLink');
      if (waLink) waLink.href = `https://wa.me/201000000000?text=${waText}`;

      // رابط صفحة التتبع
      const trackDirectLink = document.getElementById('directTrackLink');
      if (trackDirectLink) {
        trackDirectLink.href = `track.html?orderId=${orderNumber}`;
      }

      successModal.classList.remove('hidden');
      successModal.classList.add('flex');
    }

    // تفريغ السلة
    window.CartManager.clearCart();

  } catch (error) {
    console.error("Order error:", error);
    alert("حدث خطأ أثناء حفظ الطلب، يُرجى المحاولة مجدداً.");
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<span class="material-symbols-outlined text-[22px]">check_circle</span><span>تأكيد الطلب الفوري الآن</span>`;
    }
  }
};

window.closeSuccessModal = function() {
  const successModal = document.getElementById('orderSuccessModal');
  if (successModal) {
    successModal.classList.add('hidden');
    successModal.classList.remove('flex');
  }
};
