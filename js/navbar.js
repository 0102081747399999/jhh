// ==========================================================================
// إدارة شريط التنقل والمستخدم الموحد (Shared Navbar & Auth State Observer)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavbarActiveLink();
  initAuthObserver();
  initHeaderSearch();
  initCartDrawerControls();
});

// 1. تحديد الرابط النشط حسب الصفحة الحالية
function initNavbarActiveLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('header nav a, .desktop-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('bg-primary-container', 'text-on-primary-container', 'font-bold', 'shadow-sm');
      link.classList.remove('text-on-surface-variant');
    }
  });
}

// 2. مراقبة حالة تسجيل الدخول عبر فيربيز وتحديث صورة وبيانات المستخدم بالهيدر
function initAuthObserver() {
  const userProfileContainer = document.getElementById('navbarUserProfile');
  if (!userProfileContainer) return;

  if (window.auth) {
    window.auth.onAuthStateChanged(user => {
      if (user) {
        // المستخدم مسجل دخوله
        const displayName = user.displayName || user.email ? (user.email.split('@')[0]) : 'عميلنا العزيز';
        const photoURL = user.photoURL || 'https://lh3.googleusercontent.com/aida/ALJJyrBk5YzyJyZisvRDvy1sTjnUtUroXWFT8RzgRuPctl1_OJ1XHwFoSuN9wYLUweevofcys_ohEFicyypn4zAxufIi7znRzqrMig_lh1qg9hQq1fE3PzjgblClqE-5rzjXUmPSWqApqMGdANhRlJ86NSdZHkqIG5tDh4m7ycCzl0Kp7R28TPLOkcEPqAG41-pcZY3flyAaxr8cNBl2XJn6ANJcXxdV7-hrOwxQkod8pAZf-w';

        userProfileContainer.innerHTML = `
          <div class="flex items-center gap-space-xs cursor-pointer group relative">
            <a href="auth.html" class="flex items-center gap-2 hover:opacity-85 transition-opacity">
              <img src="${photoURL}" alt="Profile" class="w-8 h-8 rounded-full object-cover ring-2 ring-primary">
              <span class="hidden sm:inline font-label-md text-label-md font-semibold text-on-surface">${displayName}</span>
            </a>
            <button onclick="logoutUser()" title="تسجيل الخروج" class="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-outline hover:text-error hover:bg-error-container/20 transition-all">
              <span class="material-symbols-outlined text-[16px]">logout</span>
            </button>
          </div>
        `;
      } else {
        // زائر غير مسجل
        userProfileContainer.innerHTML = `
          <a href="auth.html" class="flex items-center gap-space-xs px-space-sm py-1.5 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors">
            <span class="material-symbols-outlined text-[18px] text-primary">account_circle</span>
            <span class="hidden sm:inline font-semibold">دخول / حسابي</span>
          </a>
        `;
      }
    });
  }
}

// دالة تسجيل الخروج السريع
window.logoutUser = async function() {
  if (window.auth) {
    try {
      await window.auth.signOut();
      if (window.CartManager) window.CartManager.showToast('تم تسجيل الخروج بنجاح', 'info');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 500);
    } catch (e) {
      console.error(e);
    }
  }
};

// 3. البحث السريع في الهيدر
function initHeaderSearch() {
  const searchInput = document.querySelector('header input[type="search"]');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();
    
    // إذا كان في الصفحة الرئيسية نفعل الفلترة المباشرة
    if (typeof window.filterBySearch === 'function') {
      window.filterBySearch(query);
    }
  });

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      const currentPath = window.location.pathname.split('/').pop();
      if (currentPath !== 'index.html' && currentPath !== '') {
        window.location.href = `index.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}

// 4. التحكم في درج السلة (Drawer)
function initCartDrawerControls() {
  const openDrawerBtn = document.getElementById('headerCartBtn');
  if (openDrawerBtn) {
    openDrawerBtn.addEventListener('click', (e) => {
      // إذا كانت الصفحة cart.html، لا داعي لفتح الدرج
      const isCartPage = window.location.pathname.endsWith('cart.html');
      if (isCartPage) return;

      e.preventDefault();
      const drawer = document.getElementById('cartDrawer');
      const backdrop = document.getElementById('cartDrawerBackdrop');
      if (drawer && backdrop) {
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100');
        drawer.classList.remove('-translate-x-full');
        if (typeof window.renderCartDrawer === 'function') {
          window.renderCartDrawer();
        }
      } else {
        window.location.href = 'cart.html';
      }
    });
  }
}

// إغلاق درج السلة
window.closeCartDrawer = function() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (drawer && backdrop) {
    backdrop.classList.remove('opacity-100');
    backdrop.classList.add('opacity-0', 'pointer-events-none');
    drawer.classList.add('-translate-x-full');
  }
};
