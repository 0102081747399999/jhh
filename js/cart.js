// ==========================================================================
// إدارة سلة المشتريات المركزية (Shared Shopping Cart Manager)
// ==========================================================================

const CartManager = {
  storageKey: 'diwan_cart',
  couponKey: 'diwan_coupon',
  deliveryFee: 20,
  defaultDiscountRate: 0.20,

  // جلب عناصر السلة الحالية
  getCart() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  },

  // حفظ السلة وتحديث الواجهة في جميع الصفحات
  saveCart(cart) {
    localStorage.setItem(this.storageKey, JSON.stringify(cart));
    this.updateBadges();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart } }));
  },

  // إضافة صنف للسلة
  addItem(item, btnElement = null) {
    const cart = this.getCart();
    const existing = cart.find(i => i.id === item.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: item.id,
        title: item.title,
        price: Number(item.price),
        image: item.image || item.img || '',
        category: item.category || 'general',
        quantity: 1
      });
    }

    this.saveCart(cart);
    this.showToast(`تمت إضافة "${item.title}" إلى السلة`, 'success');

    // أنيميشن زر الإضافة
    if (btnElement) {
      const originalHTML = btnElement.innerHTML;
      btnElement.innerHTML = `<span class="material-symbols-outlined text-[18px]">check</span><span>تمت الإضافة!</span>`;
      btnElement.classList.add('bg-tertiary', 'text-on-tertiary');
      setTimeout(() => {
        btnElement.innerHTML = originalHTML;
        btnElement.classList.remove('bg-tertiary', 'text-on-tertiary');
      }, 1200);
    }
  },

  // تعديل كمية صنف
  updateQuantity(id, delta) {
    let cart = this.getCart();
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id !== id);
      this.showToast(`تم حذف الصنف من السلة`, 'info');
    }
    this.saveCart(cart);
  },

  // إزالة صنف
  removeItem(id) {
    let cart = this.getCart();
    cart = cart.filter(i => i.id !== id);
    this.saveCart(cart);
    this.showToast(`تم حذف الصنف من السلة`, 'info');
  },

  // تفريغ السلة بالكامل
  clearCart() {
    localStorage.removeItem(this.storageKey);
    this.updateBadges();
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { cart: [] } }));
  },

  // حساب إجمالي الكميات
  getTotalCount() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // حساب المجموع الفرعي
  getSubtotal() {
    const cart = this.getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  // كود الخصم
  getCoupon() {
    return localStorage.getItem(this.couponKey) || 'NAKHA20'; // الكوبون الافتراضي المفعّل
  },

  setCoupon(code) {
    localStorage.setItem(this.couponKey, code.toUpperCase());
    this.saveCart(this.getCart());
  },

  getDiscount() {
    const subtotal = this.getSubtotal();
    const coupon = this.getCoupon();
    if (coupon === 'NAKHA20' && subtotal > 0) {
      return Math.round(subtotal * this.defaultDiscountRate);
    }
    return 0;
  },

  // الإجمالي النهائي
  getFinalTotal() {
    const subtotal = this.getSubtotal();
    if (subtotal === 0) return 0;
    const discount = this.getDiscount();
    return subtotal - discount + this.deliveryFee;
  },

  // تحديث الشارات في الهيدر والقوائم تلقائياً
  updateBadges() {
    const totalCount = this.getTotalCount();
    const finalTotal = this.getFinalTotal();

    // عناصر العداد في الهيدر
    document.querySelectorAll('.cart-badge-count').forEach(el => {
      el.textContent = totalCount;
      if (totalCount > 0) {
        el.classList.remove('hidden');
      }
    });

    // عناصر السعر في الهيدر
    document.querySelectorAll('.cart-header-total').forEach(el => {
      el.textContent = `${finalTotal} ج.م`;
    });

    // الشريط السفلي للجوال إن وجد
    const floatingBar = document.getElementById('floatingCartBar');
    const floatingBadge = document.getElementById('floatingCartBadge');
    const floatingTotal = document.getElementById('floatingCartTotal');
    if (floatingBar && floatingBadge && floatingTotal) {
      floatingBadge.textContent = totalCount;
      floatingTotal.textContent = `${finalTotal} ج.م`;
      if (totalCount > 0) {
        floatingBar.classList.remove('translate-y-24');
      } else {
        floatingBar.classList.add('translate-y-24');
      }
    }
  },

  // إظهار إشعارات Toast تفاعلية
  showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
    toast.innerHTML = `
      <span class="material-symbols-outlined text-[20px]">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }
};

// تشغيل التحديث فور تحميل أي صفحة
document.addEventListener('DOMContentLoaded', () => {
  CartManager.updateBadges();
});

// تعليق CartManager في window
window.CartManager = CartManager;
