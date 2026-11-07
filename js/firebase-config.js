// ==========================================================================
// إعدادات وتوصيل فيربيز (Firebase Configuration & Initialization)
// ==========================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCHVoCiEpy071RX7JNhPY3YbSRL4jfhSEw",
  authDomain: "aaaa-52df1.firebaseapp.com",
  projectId: "aaaa-52df1",
  storageBucket: "aaaa-52df1.firebasestorage.app",
  messagingSenderId: "906194085591",
  appId: "1:906194085591:web:c148acc81e755009287292",
  measurementId: "G-XJLG4YC2LW"
};

// تهيئة تطبيق فيربيز
let app = null;
let db = null;
let auth = null;
let analytics = null;
let isFirebaseOnline = false;

try {
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
      app = firebase.initializeApp(firebaseConfig);
    } else {
      app = firebase.app();
    }
    
    // تهيئة الخدمات
    if (typeof firebase.firestore === 'function') {
      db = firebase.firestore();
      try {
        db.enablePersistence({ synchronizeTabs: true }).catch(() => {});
      } catch (e) {}
    }
    
    if (typeof firebase.auth === 'function') {
      auth = firebase.auth();
    }
    
    if (typeof firebase.analytics === 'function') {
      try {
        analytics = firebase.analytics();
      } catch (e) {}
    }
    
    isFirebaseOnline = true;
    console.log("🔥 تم ربط Firebase بنجاح: " + firebaseConfig.projectId);
  } else {
    console.warn("⚠️ لم يتم العثور على مكتبة Firebase، جاري العمل بالوضع المحلي.");
  }
} catch (error) {
  console.error("خطأ أثناء تهيئة Firebase:", error);
}

// كشف Firebase على مستوى النطاق العام (Window)
window.firebaseConfig = firebaseConfig;
window.firebaseApp = app;
window.db = db;
window.auth = auth;
window.analytics = analytics;
window.isFirebaseOnline = isFirebaseOnline;

// ==========================================================================
// دوال إدارة وقاعدة بيانات الطلبات (Firebase Service Helper)
// ==========================================================================

window.FirebaseService = {
  // حفظ طلب جديد في Firestore
  async createOrder(orderData) {
    if (db) {
      try {
        const payload = {
          ...orderData,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          createdLocal: new Date().toISOString()
        };
        const docRef = await db.collection('orders').add(payload);
        console.log("✅ تم حفظ الطلب بنجاح في Firebase Firestore:", docRef.id);
        
        // حفظ نسخة محلية احتياطية
        this.saveLocalBackup({ ...orderData, id: docRef.id });
        return { success: true, id: docRef.id, orderNumber: orderData.orderNumber };
      } catch (err) {
        console.warn("تعذر الحفظ في Firestore، حفظ محلياً كاحتياط:", err);
      }
    }
    
    // بديل محلي عند عدم توفر الاتصال أو تعطل الصلاحيات
    const localId = 'LOCAL_' + Date.now();
    this.saveLocalBackup({ ...orderData, id: localId });
    return { success: true, id: localId, orderNumber: orderData.orderNumber, localOnly: true };
  },

  // الاستماع المباشر لحالة طلب معين في الوقت الفعلي (Real-Time Tracking)
  listenToOrder(orderNumber, callback) {
    if (db) {
      try {
        return db.collection('orders')
          .where('orderNumber', '==', orderNumber)
          .onSnapshot((snapshot) => {
            if (!snapshot.empty) {
              const doc = snapshot.docs[0];
              callback({ id: doc.id, ...doc.data() });
            } else {
              // إذا لم يجده في استعلام Firestore، يبحث محلياً
              const local = this.getLocalOrderByNumber(orderNumber);
              callback(local);
            }
          }, (err) => {
            console.warn("Firestore listenToOrder fallback:", err);
            const local = this.getLocalOrderByNumber(orderNumber);
            callback(local);
          });
      } catch (e) {
        console.error("Snapshot error:", e);
      }
    }
    
    const local = this.getLocalOrderByNumber(orderNumber);
    callback(local);
    return () => {};
  },

  // جلب كافة الطلبات للوحة تحكم المطعم في الوقت الفعلي
  listenToAllOrders(callback) {
    if (db) {
      try {
        return db.collection('orders').onSnapshot((snapshot) => {
          const orders = [];
          snapshot.forEach(doc => {
            orders.push({ id: doc.id, ...doc.data() });
          });
          
          // ترتيب الطلبات من الأحدث للأقدم في الذاكرة لتجنب أي مشاكل فهارس
          orders.sort((a, b) => {
            const timeA = a.createdAt?.seconds ? a.createdAt.seconds * 1000 : (new Date(a.createdLocal || 0).getTime());
            const timeB = b.createdAt?.seconds ? b.createdAt.seconds * 1000 : (new Date(b.createdLocal || 0).getTime());
            return timeB - timeA;
          });

          // دمج الطلبات المحلية إن وُجدت
          const localOrders = this.getAllLocalOrders();
          localOrders.forEach(loc => {
            if (!orders.some(o => o.orderNumber === loc.orderNumber)) {
              orders.push(loc);
            }
          });

          callback(orders);
        }, (err) => {
          console.warn("Firestore listenToAllOrders error, using local:", err);
          callback(this.getAllLocalOrders());
        });
      } catch (e) {
        console.warn("Fallback to local orders:", e);
      }
    }
    callback(this.getAllLocalOrders());
    return () => {};
  },

  // تحديث حالة الطلب من لوحة تحكم الإدارة
  async updateOrderStatus(orderId, newStatus) {
    let updatedInFirestore = false;
    if (db && !orderId.startsWith('LOCAL_')) {
      try {
        await db.collection('orders').doc(orderId).update({
          status: newStatus,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        updatedInFirestore = true;
        console.log(`✅ تم تحديث الطلب في Firestore (${orderId}) إلى: ${newStatus}`);
      } catch (err) {
        console.warn("Firestore updateOrderStatus error, fallback to local:", err);
      }
    }

    // تحديث في النسخة الاحتياطية المحلية
    const all = this.getAllLocalOrders();
    const idx = all.findIndex(o => o.id === orderId || o.orderNumber === orderId);
    if (idx !== -1) {
      all[idx].status = newStatus;
      localStorage.setItem('diwan_orders_backup', JSON.stringify(all));
    }
    return true;
  },

  // التخزين المحلي الاحتياطي
  saveLocalBackup(orderData) {
    const list = this.getAllLocalOrders();
    const existingIdx = list.findIndex(o => o.orderNumber === orderData.orderNumber);
    const item = { ...orderData, createdLocal: orderData.createdLocal || new Date().toISOString() };
    if (existingIdx !== -1) {
      list[existingIdx] = item;
    } else {
      list.unshift(item);
    }
    localStorage.setItem('diwan_orders_backup', JSON.stringify(list));
  },

  getAllLocalOrders() {
    try {
      const data = localStorage.getItem('diwan_orders_backup');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  getLocalOrderByNumber(orderNumber) {
    const all = this.getAllLocalOrders();
    return all.find(o => o.orderNumber === orderNumber) || null;
  }
};
