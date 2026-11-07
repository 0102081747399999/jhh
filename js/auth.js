// ==========================================================================
// إدارة المصادقة والحساب الشخصي وسجل الطلبات (Firebase Auth & Profile)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initAuthUI();
  setupAuthForms();
});

function initAuthUI() {
  if (!window.auth) return;

  window.auth.onAuthStateChanged(user => {
    const authFormsContainer = document.getElementById('authFormsContainer');
    const profileContainer = document.getElementById('userProfileDashboard');

    if (user) {
      // إخفاء نماذج الدخول وإظهار لوحة حساب المستخدم
      if (authFormsContainer) authFormsContainer.classList.add('hidden');
      if (profileContainer) {
        profileContainer.classList.remove('hidden');
        renderUserProfile(user);
        loadUserOrdersHistory(user.uid, user.email);
      }
    } else {
      // إظهار نماذج الدخول
      if (authFormsContainer) authFormsContainer.classList.remove('hidden');
      if (profileContainer) profileContainer.classList.add('hidden');
    }
  });
}

// التبديل بين تبويبي تسجيل الدخول وإنشاء الحساب
window.switchAuthTab = function(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginTabBtn = document.getElementById('tabLoginBtn');
  const registerTabBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    loginTabBtn.className = 'flex-1 py-3 text-center font-bold text-primary border-b-2 border-primary';
    registerTabBtn.className = 'flex-1 py-3 text-center font-medium text-outline hover:text-on-surface';
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    registerTabBtn.className = 'flex-1 py-3 text-center font-bold text-primary border-b-2 border-primary';
    loginTabBtn.className = 'flex-1 py-3 text-center font-medium text-outline hover:text-on-surface';
  }
};

// تهيئة استمارات الدخول والتسجيل
function setupAuthForms() {
  // 1. تسجيل الدخول
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim();
      const password = document.getElementById('loginPassword').value.trim();
      const btn = document.getElementById('loginSubmitBtn');

      if (!email || !password) return;

      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">sync</span><span>جاري تسجيل الدخول...</span>`;

      try {
        if (window.auth) {
          await window.auth.signInWithEmailAndPassword(email, password);
          if (window.CartManager) window.CartManager.showToast('مرحباً بعودتك إلى ديوان الضيافة!', 'success');
        } else {
          simulateLocalLogin(email);
        }
      } catch (err) {
        console.error(err);
        handleAuthError(err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>دخول</span><span class="material-symbols-outlined text-[18px]">login</span>`;
      }
    });
  }

  // 2. إنشاء حساب جديد
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('regName').value.trim();
      const email = document.getElementById('regEmail').value.trim();
      const password = document.getElementById('regPassword').value.trim();
      const btn = document.getElementById('registerSubmitBtn');

      if (!name || !email || !password) return;

      if (password.length < 6) {
        if (window.CartManager) window.CartManager.showToast('كلمة المرور يجب ألا تقل عن 6 خانات', 'error');
        return;
      }

      btn.disabled = true;
      btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">sync</span><span>جاري إنشاء الحساب...</span>`;

      try {
        if (window.auth) {
          const cred = await window.auth.createUserWithEmailAndPassword(email, password);
          await cred.user.updateProfile({ displayName: name });
          if (window.CartManager) window.CartManager.showToast(`أهلاً وسهلاً بك يا ${name}! تم إنشاء حسابك بنجاح`, 'success');
        } else {
          simulateLocalLogin(email, name);
        }
      } catch (err) {
        console.error(err);
        handleAuthError(err);
      } finally {
        btn.disabled = false;
        btn.innerHTML = `<span>إنشاء الحساب</span><span class="material-symbols-outlined text-[18px]">person_add</span>`;
      }
    });
  }
}

// الدخول السريع بحساب تجريبي (Guest / Demo Account)
window.loginAsGuest = async function() {
  const btn = document.getElementById('guestLoginBtn');
  if (btn) btn.disabled = true;

  try {
    if (window.auth) {
      await window.auth.signInAnonymously();
      if (window.CartManager) window.CartManager.showToast('تم الدخول كزائر بنجاح!', 'info');
    } else {
      simulateLocalLogin('guest@diwan.sa', 'زائر تجريبي');
    }
  } catch (err) {
    console.warn("Anonymous sign in error, fallback:", err);
    simulateLocalLogin('guest@diwan.sa', 'ضيف ديوان التجريبي');
  } finally {
    if (btn) btn.disabled = false;
  }
};

// محاكاة محلية في حال عدم توفر اتصال Firebase Auth
function simulateLocalLogin(email, name = 'عميل مميز') {
  const mockUser = {
    uid: 'MOCK_' + Date.now(),
    email: email,
    displayName: name,
    photoURL: 'https://lh3.googleusercontent.com/aida/ALJJyrBk5YzyJyZisvRDvy1sTjnUtUroXWFT8RzgRuPctl1_OJ1XHwFoSuN9wYLUweevofcys_ohEFicyypn4zAxufIi7znRzqrMig_lh1qg9hQq1fE3PzjgblClqE-5rzjXUmPSWqApqMGdANhRlJ86NSdZHkqIG5tDh4m7ycCzl0Kp7R28TPLOkcEPqAG41-pcZY3flyAaxr8cNBl2XJn6ANJcXxdV7-hrOwxQkod8pAZf-w'
  };
  localStorage.setItem('diwan_mock_user', JSON.stringify(mockUser));
  if (window.CartManager) window.CartManager.showToast('تم تسجيل الدخول بنجاح!', 'success');
  location.reload();
}

// عرض بيانات الملف الشخصي
function renderUserProfile(user) {
  const nameEl = document.getElementById('profileUserName');
  const emailEl = document.getElementById('profileUserEmail');
  const uidEl = document.getElementById('profileUserId');
  const avatarEl = document.getElementById('profileUserAvatar');

  const displayName = user.displayName || (user.email ? user.email.split('@')[0] : 'ضيف ديوان');
  if (nameEl) nameEl.innerText = displayName;
  if (emailEl) emailEl.innerText = user.email || 'تسجيل كزائر (بدون بريد)';
  if (uidEl) uidEl.innerText = user.uid.substring(0, 12) + '...';
  if (avatarEl && user.photoURL) avatarEl.src = user.photoURL;
}

// جلب سجل الطلبات السابقة للحساب
async function loadUserOrdersHistory(uid, email) {
  const historyContainer = document.getElementById('userOrdersHistoryList');
  if (!historyContainer) return;

  historyContainer.innerHTML = `
    <div class="py-8 text-center text-outline">
      <span class="material-symbols-outlined animate-spin text-[32px] text-primary">sync</span>
      <p class="mt-2 text-sm">جاري جلب سجل طلباتك من فيربيز...</p>
    </div>
  `;

  let orders = [];

  // 1. محاولة الجلب من Firebase Firestore
  if (window.db) {
    try {
      const q = window.db.collection('orders')
        .where('userId', '==', uid)
        .orderBy('createdAt', 'desc')
        .limit(10);
      
      const snap = await q.get();
      snap.forEach(doc => orders.push({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.warn("Firestore user orders error:", e);
    }
  }

  // إذا لم نجد في Firestore أو فشل، نبحث في التخزين الاحتياطي المحلي
  if (orders.length === 0) {
    const local = window.FirebaseService.getAllLocalOrders();
    orders = local.filter(o => o.userId === uid || (email && o.userEmail === email));
    if (orders.length === 0) orders = local.slice(0, 5); // إظهار الطلبات المتاحة للتجربة
  }

  if (orders.length === 0) {
    historyContainer.innerHTML = `
      <div class="py-10 text-center text-outline">
        <span class="material-symbols-outlined text-[48px] text-surface-container-highest">receipt_long</span>
        <p class="mt-2 font-bold text-on-surface-variant">لا توجد طلبات سابقة حتى الآن</p>
        <a href="index.html" class="inline-block mt-4 px-6 py-2 bg-primary text-on-primary rounded-full text-sm font-semibold">ابدأ طلبك الأول</a>
      </div>
    `;
    return;
  }

  historyContainer.innerHTML = '';
  orders.forEach(order => {
    const statusMap = {
      pending: { label: 'قيد المراجعة', color: 'bg-amber-100 text-amber-800' },
      cooking: { label: 'جاري التحضير', color: 'bg-blue-100 text-blue-800' },
      delivering: { label: 'في الطريق', color: 'bg-orange-100 text-orange-800' },
      completed: { label: 'مكتمل', color: 'bg-green-100 text-green-800' },
      cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-800' }
    };

    const st = statusMap[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };

    const card = document.createElement('div');
    card.className = 'p-4 bg-surface-container-low rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-surface-container-high/60';
    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-sm">
          #
        </div>
        <div class="flex flex-col">
          <span class="font-bold text-on-surface">${order.orderNumber}</span>
          <span class="text-xs text-outline">${order.items ? order.items.length : 1} أصناف • إجمالي: ${order.total} ج.م</span>
        </div>
      </div>

      <div class="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
        <span class="px-3 py-1 rounded-full text-xs font-bold ${st.color}">${st.label}</span>
        <a href="track.html?orderId=${order.orderNumber}" class="px-4 py-1.5 rounded-full bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-colors flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">my_location</span>
          <span>تتبع</span>
        </a>
      </div>
    `;
    historyContainer.appendChild(card);
  });
}

function handleAuthError(err) {
  let msg = 'حدث خطأ أثناء المصادقة، يرجى المحاولة لاحقاً';
  if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
    msg = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
  } else if (err.code === 'auth/email-already-in-use') {
    msg = 'هذا البريد الإلكتروني مسجل بالفعل';
  } else if (err.code === 'auth/weak-password') {
    msg = 'كلمة المرور ضعيفة جداً';
  } else if (err.code === 'auth/invalid-email') {
    msg = 'صيغة البريد الإلكتروني غير صالحة';
  }
  if (window.CartManager) window.CartManager.showToast(msg, 'error');
}
