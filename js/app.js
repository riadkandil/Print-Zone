'use strict';
/* ════════════════════════════════════════════════════════════════════
   ⚙️ FIREBASE CONFIG — إعدادات فايربيز
   To make the website online (shared between all devices), paste your
   Firebase config object below, replacing `null`.
   لجعل الموقع متصلاً بالإنترنت (مشترك بين كل الأجهزة)، الصق إعدادات
   Firebase بالأسفل بدلاً من `null`.
   Example / مثال:
   const FIREBASE_CONFIG = {
     apiKey: "AIza....",
     authDomain: "print-zone.firebaseapp.com",
     projectId: "print-zone",
     storageBucket: "print-zone.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   (You can also paste it from inside the app: Admin → Settings →
    Database connection — no code editing needed.)
   ════════════════════════════════════════════════════════════════════ */
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyD61YUt3vqmWnBVtmcMcgzjDMaboXeDZG8",
  authDomain: "print-zone-35a7a.firebaseapp.com",
  projectId: "print-zone-35a7a",
  storageBucket: "print-zone-35a7a.firebasestorage.app",
  messagingSenderId: "365695169107",
  appId: "1:365695169107:web:159c4f1ad6283c38928ca6"
};

/* Default passwords (hashes are created on first run; change them from
   Admin → Settings). Employee: 1234 — Admin: mkmass45 */
const DEFAULT_EMP_PW = '1234';
const DEFAULT_ADMIN_PW = 'mkmass45';

/* ==================== HELPERS ==================== */
const $ = id => document.getElementById(id);
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); };
function refreshIcons() { if (window.lucide) lucide.createIcons(); }

function toast(msg, err) {
  const t = $('toast');
  t.textContent = msg;
  t.className = 'toast' + (err ? ' error' : '') + ' show';
  clearTimeout(t._tm);
  t._tm = setTimeout(() => t.classList.remove('show'), 2300);
}

/* Pure-JS SHA-256 (fallback when crypto.subtle is unavailable, e.g. file://) */
function sha256Sync(ascii) {
  function rightRotate(v, a){ return (v >>> a) | (v << (32 - a)); }
  let maxWord = Math.pow(2, 32), result = '';
  const words = [], asciiBitLength = ascii.length * 8;
  let hash = sha256Sync.h = sha256Sync.h || [], k = sha256Sync.k = sha256Sync.k || [];
  let primeCounter = k.length;
  const isComposite = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (let i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (Math.pow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }
  ascii += '\x80';
  while (ascii.length % 64 - 56) ascii += '\x00';
  for (let i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    if (j >> 8) return; // ASCII only path; non-ASCII handled by caller encoding
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words.length] = ((asciiBitLength / maxWord) | 0);
  words[words.length] = (asciiBitLength);
  for (let j = 0; j < words.length;) {
    const w = words.slice(j, j += 16), oldHash = hash;
    hash = hash.slice(0, 8);
    for (let i = 0; i < 64; i++) {
      const w15 = w[i - 15], w2 = w[i - 2];
      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6])) + k[i]
        + (w[i] = (i < 16) ? w[i] : (w[i - 16] + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3)) + w[i - 7] + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))) | 0);
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22)) + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
    }
    for (let i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }
  for (let i = 0; i < 8; i++) {
    for (let j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

async function hashPw(pw) {
  const data = 'pz::' + pw;
  try {
    if (crypto && crypto.subtle) {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(data));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (e) { /* fall through */ }
  // encode to ASCII-safe string first
  const ascii = unescape(encodeURIComponent(data));
  return sha256Sync(ascii);
}

/* ==================== I18N ==================== */
const I18N = {
  en: {
    'app.tag': 'Printing Store Transaction Recorder',
    'login.employee': 'Employee', 'login.employeeSub': 'Record transactions',
    'login.admin': 'Admin', 'login.adminSub': 'Dashboard, export & settings',
    'login.password': 'Password', 'login.enter': 'Sign in',
    'login.wrong': 'Incorrect password', 'login.enterPw': 'Enter the password',
    'mode.local': '⚠️ Local mode — data stays on this device. Admin can connect Firebase from Settings.',
    'mode.online': '✓ Online — data is shared across all devices',
    'nav.new': 'New', 'nav.history': 'History', 'nav.machines': 'Machines',
    'nav.dashboard': 'Dashboard', 'nav.settings': 'Settings',
    'status.online': 'Online', 'status.offline': 'Offline — will sync', 'status.local': 'Local',
    'role.employee': 'Employee', 'role.admin': 'Admin',
    'logout.title': 'Sign out',
    'newtx.title': 'New Transaction', 'newtx.client': 'Client name', 'newtx.optional': 'Optional',
    'newtx.date': 'Date *', 'newtx.notes': 'Extra notes', 'newtx.notesPh': 'Any extra details...',
    'newtx.defaultClient': 'Client',
    'price.mode': 'Price mode', 'price.perItem': 'Per item', 'price.final': 'Final price',
    'price.unit': 'Price (per item)', 'price.total': 'Total price',
    'svc.section': 'Service type', 'op.section': 'Operation', 'color.section': 'Color',
    'face.section': 'Sides', 'finish.section': 'Finish',
    'eng.title': 'Engineering details', 'eng.length': 'Length (meters)', 'eng.note': 'Note (optional)',
    'eng.notePh': 'e.g. floor plan...', 'eng.m': 'm',
    'qty': 'Quantity', 'desc': 'Description', 'descPh': 'Service details',
    'add': '+ Add', 'cancel': 'Cancel',
    'custom.header': 'Unlisted service', 'custom.name': 'Service name', 'custom.ph': 'Type the service',
    'inv.title': 'Current Invoice', 'inv.clear': 'Clear all',
    'inv.empty': 'No items — pick a service to start', 'inv.total': 'Total', 'inv.final': 'Final price',
    'save.tx': 'Save Transaction', 'toast.saved': 'Transaction saved ✓', 'toast.added': 'Added',
    'toast.deleted': 'Deleted', 'toast.dateReq': 'Date is required', 'toast.loginOk': 'Signed in ✓',
    'hist.title': 'Transaction History', 'hist.search': 'Search by client or date...',
    'filter.all': 'All', 'filter.today': 'Today', 'filter.week': 'Week', 'filter.month': 'Month',
    'hist.empty': 'No transactions yet', 'hist.noresults': 'No results',
    'hist.pieces': 'pcs', 'hist.items': 'items', 'hist.delete': 'Delete',
    'hist.periodTotal': 'Total for shown period', 'hist.delDenied': 'Employees can only delete a transaction within 10 minutes of saving it',
    'confirm.delTx': 'Delete this transaction?', 'confirm.delTxSub': 'This cannot be undone.',
    'confirm.delete': 'Delete', 'confirm.cancel': 'Cancel',
    'mach.title': 'Machine Counters', 'mach.counter': 'Machine counter', 'mach.last': 'Last reading:',
    'mach.new': 'New reading', 'mach.date': 'Date', 'mach.save': 'Save',
    'toast.readingSaved': 'Reading saved ✓', 'toast.needBoth': 'Enter the reading and date',
    'mach.empty': 'No machines yet — admin can add machines from Settings',
    'dash.title': 'Dashboard', 'dash.tx': 'Transactions', 'dash.rev': 'Revenue', 'dash.pieces': 'Pieces',
    'dash.clients': 'Clients', 'dash.today': 'Today', 'dash.month': 'This month',
    'dash.topSvc': 'Top services', 'dash.topPaper': 'Top paper types',
    'dash.eng': 'Total engineering meters', 'dash.last7': 'Last 7 days revenue', 'dash.nodata': 'No data',
    'set.title': 'Settings & Export',
    'exp.title': 'Export to Excel', 'exp.from': 'From', 'exp.to': 'To',
    'exp.btn': 'Download Excel', 'exp.csvBtn': 'Download CSV', 'toast.expNone': 'No data in this period', 'toast.expDone': 'Exported ✓',
    'backup.title': 'Data Backup', 'backup.desc': 'Export all data as a JSON file for safekeeping, or restore from a previous backup.',
    'backup.export': 'Export Backup (.json)', 'backup.import': 'Restore from Backup',
    'toast.backupDone': 'Backup downloaded ✓', 'toast.restoreDone': 'Restored {n} records ✓', 'toast.restoreErr': 'Invalid backup file',
    'pw.title': 'Passwords', 'pw.emp': 'New employee password', 'pw.admin': 'New admin password',
    'pw.current': 'Current admin password', 'pw.change': 'Change',
    'toast.pwChanged': 'Password changed ✓', 'toast.pwWrong': 'Current admin password is incorrect',
    'toast.pwShort': 'Password must be at least 4 characters',
    'machset.title': 'Manage machines', 'machset.add': '+ Add machine', 'machset.name': 'Machine name',
    'machset.delConfirm': 'Delete this machine?', 'machset.delConfirmSub': 'All its readings will be deleted too.',
    'toast.machSaved': 'Machines updated ✓',
    'loading.connecting': 'Connecting…',
    'err.scripts': 'Firebase config found, but the Firebase libraries could not load — check the internet connection and reload the page.',
    'err.auth': 'Firebase refused the connection: Anonymous sign-in is not enabled. In the Firebase console: Build → Authentication → Get started → Sign-in method → enable “Anonymous” → Save, then reload.',
    'err.rules': 'Firebase refused the connection: the security rules block access. In Firestore → Rules tab → paste the rules from the setup guide → Publish, then reload.',
    'err.notfound': 'The Firestore database does not exist yet. In the Firebase console: Build → Firestore Database → Create database, then reload.',
    'err.generic': 'Connection error',
    'xh.no': '#', 'xh.date': 'Date', 'xh.client': 'Client', 'xh.by': 'Recorded by', 'xh.notes': 'Notes',
    'xh.svc': 'Service', 'xh.detail': 'Detail', 'xh.color': 'Color', 'xh.sides': 'Sides',
    'xh.finish': 'Finish', 'xh.engLen': 'Eng. length (m)', 'xh.engNote': 'Eng. note',
    'xh.qty': 'Qty', 'xh.price': 'Unit price', 'xh.final': 'Final price?', 'xh.total': 'Total',
    'xh.grand': 'GRAND TOTAL', 'yes': 'Yes', 'no': 'No',
    'sheet.tx': 'Transactions', 'sheet.sum': 'Summary', 'sheet.mach': 'Machines',
    'sum.period': 'Period', 'sum.generated': 'Generated on', 'sum.rev': 'Total revenue',
    'sum.tx': 'Number of transactions', 'sum.pieces': 'Total pieces', 'sum.clients': 'Unique clients',
    'sum.eng': 'Total engineering meters', 'sum.bySvc': 'Breakdown by service',
    'sum.svcCol': 'Service', 'sum.qtyCol': 'Pieces', 'sum.revCol': 'Revenue',
    'xh.machine': 'Machine', 'xh.reading': 'Reading', 'xh.diff': 'Difference',
    'cur': 'EGP',
  },
  ar: {
    'app.tag': 'تسجيل معاملات مركز الطباعة',
    'login.employee': 'موظف', 'login.employeeSub': 'تسجيل المعاملات',
    'login.admin': 'المدير', 'login.adminSub': 'لوحة المعلومات والتصدير والإعدادات',
    'login.password': 'كلمة المرور', 'login.enter': 'دخول',
    'login.wrong': 'كلمة المرور غير صحيحة', 'login.enterPw': 'أدخل كلمة المرور',
    'mode.local': '⚠️ وضع محلي — البيانات على هذا الجهاز فقط. يمكن للمدير ربط Firebase من الإعدادات.',
    'mode.online': '✓ متصل — البيانات مشتركة بين كل الأجهزة',
    'nav.new': 'جديد', 'nav.history': 'السجل', 'nav.machines': 'الماكينات',
    'nav.dashboard': 'لوحة المعلومات', 'nav.settings': 'الإعدادات',
    'status.online': 'متصل', 'status.offline': 'غير متصل — ستتم المزامنة', 'status.local': 'محلي',
    'role.employee': 'موظف', 'role.admin': 'المدير',
    'logout.title': 'خروج',
    'newtx.title': 'معاملة جديدة', 'newtx.client': 'اسم العميل', 'newtx.optional': 'اختياري',
    'newtx.date': 'التاريخ *', 'newtx.notes': 'ملاحظات إضافية', 'newtx.notesPh': 'أي تفاصيل إضافية...',
    'newtx.defaultClient': 'عميل',
    'price.mode': 'وضع السعر', 'price.perItem': 'لكل قطعة', 'price.final': 'سعر نهائي',
    'price.unit': 'السعر (لكل قطعة)', 'price.total': 'السعر الإجمالي',
    'svc.section': 'نوع الخدمة', 'op.section': 'العملية', 'color.section': 'اللون',
    'face.section': 'الوجوه', 'finish.section': 'الإنهاء',
    'eng.title': 'بيانات الهندسي', 'eng.length': 'الطول (متر)', 'eng.note': 'ملاحظة (اختياري)',
    'eng.notePh': 'مثلاً: مخطط أرضي...', 'eng.m': 'متر',
    'qty': 'الكمية', 'desc': 'الوصف', 'descPh': 'تفصيل الخدمة',
    'add': '+ إضافة', 'cancel': 'إلغاء',
    'custom.header': 'خدمة غير مدرجة', 'custom.name': 'اسم الخدمة', 'custom.ph': 'اكتب الخدمة',
    'inv.title': 'الفاتورة الحالية', 'inv.clear': 'مسح الكل',
    'inv.empty': 'لا توجد عناصر — اختر خدمة للبدء', 'inv.total': 'الإجمالي', 'inv.final': 'سعر نهائي',
    'save.tx': 'حفظ المعاملة', 'toast.saved': 'تم حفظ المعاملة ✓', 'toast.added': 'تمت الإضافة',
    'toast.deleted': 'تم الحذف', 'toast.dateReq': 'التاريخ مطلوب', 'toast.loginOk': 'تم الدخول ✓',
    'hist.title': 'سجل المعاملات', 'hist.search': 'ابحث بالعميل أو التاريخ...',
    'filter.all': 'الكل', 'filter.today': 'اليوم', 'filter.week': 'الأسبوع', 'filter.month': 'الشهر',
    'hist.empty': 'لا توجد معاملات مسجلة', 'hist.noresults': 'لا توجد نتائج',
    'hist.pieces': 'قطعة', 'hist.items': 'خدمة', 'hist.delete': 'حذف',
    'hist.periodTotal': 'إجمالي الفترة المعروضة', 'hist.delDenied': 'يمكن للموظف حذف المعاملة خلال 10 دقائق فقط من حفظها',
    'confirm.delTx': 'حذف هذه المعاملة؟', 'confirm.delTxSub': 'لا يمكن التراجع عن الحذف.',
    'confirm.delete': 'حذف', 'confirm.cancel': 'إلغاء',
    'mach.title': 'عدادات الماكينات', 'mach.counter': 'عداد الماكينة', 'mach.last': 'آخر قراءة:',
    'mach.new': 'القراءة الجديدة', 'mach.date': 'التاريخ', 'mach.save': 'حفظ',
    'toast.readingSaved': 'تم حفظ القراءة ✓', 'toast.needBoth': 'أدخل القراءة والتاريخ',
    'mach.empty': 'لا توجد ماكينات — يمكن للمدير إضافتها من الإعدادات',
    'dash.title': 'لوحة المعلومات', 'dash.tx': 'المعاملات', 'dash.rev': 'الإيرادات', 'dash.pieces': 'القطع',
    'dash.clients': 'العملاء', 'dash.today': 'اليوم', 'dash.month': 'هذا الشهر',
    'dash.topSvc': 'أكثر الخدمات استخداماً', 'dash.topPaper': 'أكثر أنواع الورق استخداماً',
    'dash.eng': 'إجمالي أطوال الهندسي', 'dash.last7': 'إيرادات آخر 7 أيام', 'dash.nodata': 'لا توجد بيانات',
    'set.title': 'الإعدادات والتصدير',
    'exp.title': 'التصدير إلى Excel', 'exp.from': 'من', 'exp.to': 'إلى',
    'exp.btn': 'تنزيل ملف Excel', 'exp.csvBtn': 'تنزيل ملف CSV', 'toast.expNone': 'لا توجد بيانات في هذه الفترة', 'toast.expDone': 'تم التصدير ✓',
    'backup.title': 'نسخ احتياطي للبيانات', 'backup.desc': 'صدّر كل البيانات كملف JSON للحفاظ عليها، أو استعد من نسخة سابقة.',
    'backup.export': 'تصدير نسخة احتياطية (.json)', 'backup.import': 'استعادة من نسخة احتياطية',
    'toast.backupDone': 'تم تنزيل النسخة الاحتياطية ✓', 'toast.restoreDone': 'تمت الاستعادة ({n} سجل) ✓', 'toast.restoreErr': 'ملف النسخة الاحتياطية غير صالح',
    'pw.title': 'كلمات المرور', 'pw.emp': 'كلمة مرور الموظفين الجديدة', 'pw.admin': 'كلمة مرور المدير الجديدة',
    'pw.current': 'كلمة مرور المدير الحالية', 'pw.change': 'تغيير',
    'toast.pwChanged': 'تم تغيير كلمة المرور ✓', 'toast.pwWrong': 'كلمة مرور المدير الحالية غير صحيحة',
    'toast.pwShort': 'كلمة المرور 4 أحرف على الأقل',
    'machset.title': 'إدارة الماكينات', 'machset.add': '+ إضافة ماكينة', 'machset.name': 'اسم الماكينة',
    'machset.delConfirm': 'حذف هذه الماكينة؟', 'machset.delConfirmSub': 'سيتم حذف كل قراءاتها أيضاً.',
    'toast.machSaved': 'تم تحديث الماكينات ✓',
    'loading.connecting': 'جاري الاتصال…',
    'err.scripts': 'تم العثور على إعدادات Firebase لكن تعذر تحميل مكتبات Firebase — تأكد من الاتصال بالإنترنت وأعد تحميل الصفحة.',
    'err.auth': 'رفض Firebase الاتصال: تسجيل الدخول المجهول (Anonymous) غير مفعّل. من لوحة Firebase: Build ← Authentication ← Get started ← Sign-in method ← فعّل «Anonymous» ← Save، ثم أعد التحميل.',
    'err.rules': 'رفض Firebase الاتصال: قواعد الأمان تمنع الوصول. من Firestore ← تبويب Rules ← الصق القواعد من دليل الإعداد ← Publish، ثم أعد التحميل.',
    'err.notfound': 'قاعدة بيانات Firestore غير منشأة بعد. من لوحة Firebase: Build ← Firestore Database ← Create database، ثم أعد التحميل.',
    'err.generic': 'خطأ في الاتصال',
    'xh.no': 'رقم', 'xh.date': 'التاريخ', 'xh.client': 'العميل', 'xh.by': 'سجّلها', 'xh.notes': 'الملاحظات',
    'xh.svc': 'الخدمة', 'xh.detail': 'التفصيل', 'xh.color': 'اللون', 'xh.sides': 'الأوجه',
    'xh.finish': 'الإنهاء', 'xh.engLen': 'طول هندسي (متر)', 'xh.engNote': 'ملاحظة هندسية',
    'xh.qty': 'الكمية', 'xh.price': 'سعر الوحدة', 'xh.final': 'سعر نهائي؟', 'xh.total': 'الإجمالي',
    'xh.grand': 'الإجمالي الكلي', 'yes': 'نعم', 'no': 'لا',
    'sheet.tx': 'المعاملات', 'sheet.sum': 'الملخص', 'sheet.mach': 'الماكينات',
    'sum.period': 'الفترة', 'sum.generated': 'تاريخ الإنشاء', 'sum.rev': 'إجمالي الإيرادات',
    'sum.tx': 'عدد المعاملات', 'sum.pieces': 'إجمالي القطع', 'sum.clients': 'عدد العملاء',
    'sum.eng': 'إجمالي أطوال الهندسي', 'sum.bySvc': 'تفصيل حسب الخدمة',
    'sum.svcCol': 'الخدمة', 'sum.qtyCol': 'القطع', 'sum.revCol': 'الإيرادات',
    'xh.machine': 'الماكينة', 'xh.reading': 'القراءة', 'xh.diff': 'الفرق',
    'cur': 'ج.م',
  }
};

/* Localized labels for data values (stored as language-neutral keys) */
const SVC_LABELS = {
  A4: { en: 'A4', ar: 'A4' }, A3: { en: 'A3', ar: 'A3' }, A5: { en: 'A5', ar: 'A5' },
  eng: { en: 'Engineering', ar: 'هندسي' },
  books: { en: 'Stationery', ar: 'كتابية' },
  office: { en: 'Office Supplies', ar: 'أدوات مكتبية' },
  pads: { en: 'Pads', ar: 'تكعيب' },
  wrap: { en: 'Lamination', ar: 'تغليف' },
};
const VAL_LABELS = {
  print: { en: 'Print', ar: 'طباعة' }, scan: { en: 'Scan', ar: 'سكان' }, copy: { en: 'Photocopy', ar: 'تصوير' },
  black: { en: 'Black', ar: 'اسود' }, color: { en: 'Color', ar: 'الوان' },
  one: { en: 'One side', ar: 'وجه واحد' }, two: { en: 'Two sides', ar: 'وجهين' },
  normal: { en: 'Normal', ar: 'عادي' }, glossy: { en: 'Glossy', ar: 'جلوسي' },
};

let lang = localStorage.getItem('pz_lang') || 'ar';

function t(key) { return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key; }
function svcLabel(k) { return SVC_LABELS[k] ? SVC_LABELS[k][lang] : k; }
function valLabel(k) { if (!k || k === '—') return '—'; return VAL_LABELS[k] ? VAL_LABELS[k][lang] : k; }
function fmtMoney(n) { return (Math.round(n * 100) / 100).toLocaleString(lang === 'ar' ? 'en-EG' : 'en-EG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' ' + t('cur'); }
function fmtDate(d) { try { return new Date(d + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return d; } }

function applyI18n() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  document.title = lang === 'ar' ? 'Print Zone — مركز الطباعة' : 'Print Zone — Printing Center';
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-svc-label]').forEach(el => { el.textContent = svcLabel(el.dataset.svcLabel); });
  document.querySelectorAll('[data-op-label]').forEach(el => { el.textContent = valLabel(el.dataset.opLabel); });
  document.querySelectorAll('[data-val-label]').forEach(el => { el.textContent = valLabel(el.dataset.valLabel); });
  const langBtnTxt = lang === 'ar' ? 'EN' : 'ع';
  $('langToggle').textContent = langBtnTxt;
  $('langToggleLogin').textContent = langBtnTxt;
  $('btnLogout').title = t('logout.title');
  updatePriceModeLabels();
  updateConnPill();
  updateLoginModeNote();
  if (state.role) {
    $('rolePill').textContent = t(state.role === 'admin' ? 'role.admin' : 'role.employee');
    renderInvoice();
    renderHistory();
    renderMachines();
    if (state.role === 'admin') { renderDashboard(); renderMachSettings(); }
  }
}

function toggleLang() {
  lang = lang === 'ar' ? 'en' : 'ar';
  localStorage.setItem('pz_lang', lang);
  applyI18n();
}

/* ==================== THEME ==================== */
if (localStorage.getItem('pz_theme') === 'dark') document.documentElement.classList.add('dark');
function toggleTheme() {
  document.documentElement.classList.toggle('dark');
  localStorage.setItem('pz_theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

/* ==================== STATE ==================== */
const state = {
  role: null,             // 'employee' | 'admin'
  transactions: [],
  machines: [],           // [{id, name, order, records:[{value,date,at}]}]
  settings: null,         // {empHash, adminHash}
  online: false,          // firebase mode
  invoice: [],
  isFinalPrice: false,
  selSvc: null, selOp: null, selColor: null, selFace: null, selFinish: null,
  historyFilter: 'all',
  deviceId: null,
  initError: null,        // {key, raw} when Firebase init failed
};

state.deviceId = localStorage.getItem('pz_device') || (Date.now().toString(36) + Math.random().toString(36).slice(2, 8));
localStorage.setItem('pz_device', state.deviceId);

const DEFAULT_MACHINES = [
  { id: 'xerox_b1', name: 'زيروكس اسود', order: 1, records: [] },
  { id: 'xerox_b2', name: 'زيروكس اسود 2', order: 2, records: [] },
  { id: 'xerox_c', name: 'زيروكس الوان', order: 3, records: [] },
  { id: 'oc_eng', name: 'OC هندسى', order: 4, records: [] },
  { id: 'hp', name: 'HP', order: 5, records: [] },
];
/* ==================== STORAGE LAYER ==================== */
let db = null;

function getFbConfig() {
  if (FIREBASE_CONFIG && FIREBASE_CONFIG.projectId) return FIREBASE_CONFIG;
  try {
    const c = JSON.parse(localStorage.getItem('pz_fbconfig') || 'null');
    if (c && c.projectId) return c;
  } catch (e) {}
  return null;
}

const LocalStore = {
  async init() {
    state.transactions = JSON.parse(localStorage.getItem('pz_tx') || '[]');
    let mc = JSON.parse(localStorage.getItem('pz_mc') || 'null');
    if (!mc) { mc = DEFAULT_MACHINES; localStorage.setItem('pz_mc', JSON.stringify(mc)); }
    state.machines = mc;
    let s = JSON.parse(localStorage.getItem('pz_settings') || 'null');
    if (!s) {
      s = { empHash: await hashPw(DEFAULT_EMP_PW), adminHash: await hashPw(DEFAULT_ADMIN_PW) };
      localStorage.setItem('pz_settings', JSON.stringify(s));
    }
    state.settings = s;
  },
  async addTx(tx) {
    tx.id = 'L' + Date.now() + Math.random().toString(36).slice(2, 6);
    state.transactions.unshift(tx);
    localStorage.setItem('pz_tx', JSON.stringify(state.transactions));
    refreshAfterData();
  },
  async delTx(id) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    localStorage.setItem('pz_tx', JSON.stringify(state.transactions));
    refreshAfterData();
  },
  async saveMachines(machines) {
    state.machines = machines;
    localStorage.setItem('pz_mc', JSON.stringify(machines));
    refreshAfterData();
  },
  async saveSettings(s) {
    state.settings = s;
    localStorage.setItem('pz_settings', JSON.stringify(s));
  },
};

const FireStore = {
  async init() {
    const cfg = getFbConfig();
    firebase.initializeApp(cfg);
    db = firebase.firestore();
    try { await db.enablePersistence({ synchronizeTabs: true }); } catch (e) { /* multi-tab or unsupported — fine */ }
    await firebase.auth().signInAnonymously();
    state.online = true;

    // settings (seed defaults on first run)
    const sRef = db.collection('settings').doc('config');
    const sSnap = await sRef.get();
    if (!sSnap.exists) {
      const seed = { empHash: await hashPw(DEFAULT_EMP_PW), adminHash: await hashPw(DEFAULT_ADMIN_PW) };
      await sRef.set(seed);
      state.settings = seed;
    } else {
      state.settings = sSnap.data();
    }
    sRef.onSnapshot(snap => { if (snap.exists) state.settings = snap.data(); });

    // machines (seed defaults on first run)
    const mSnap = await db.collection('machines').get();
    if (mSnap.empty) {
      const batch = db.batch();
      DEFAULT_MACHINES.forEach(m => batch.set(db.collection('machines').doc(m.id), m));
      await batch.commit();
    }
    db.collection('machines').onSnapshot(snap => {
      state.machines = snap.docs.map(d => ({ ...d.data(), id: d.id })).sort((a, b) => (a.order || 0) - (b.order || 0));
      refreshAfterData();
    });

    // transactions — live, newest first
    db.collection('transactions').orderBy('createdAt', 'desc').limit(5000).onSnapshot(snap => {
      state.transactions = snap.docs.map(d => ({ ...d.data(), id: d.id }));
      refreshAfterData();
    });
  },
  async addTx(tx) { await db.collection('transactions').add(tx); },
  async delTx(id) { await db.collection('transactions').doc(id).delete(); },
  async saveMachines(machines) {
    const batch = db.batch();
    const existing = new Set(state.machines.map(m => m.id));
    machines.forEach(m => {
      const id = m.id || ('m' + Date.now() + Math.random().toString(36).slice(2, 5));
      batch.set(db.collection('machines').doc(id), { name: m.name, order: m.order, records: m.records || [] });
      existing.delete(id);
    });
    existing.forEach(id => batch.delete(db.collection('machines').doc(id)));
    await batch.commit();
  },
  async saveSettings(s) { await db.collection('settings').doc('config').set(s); },
};

let store = LocalStore;

function refreshAfterData() {
  if (!state.role) return;
  renderHistory();
  renderMachines();
  if (state.role === 'admin') { renderDashboard(); renderMachSettings(); }
}

/* ==================== CONNECTION PILL ==================== */
function updateConnPill() {
  const pill = $('connPill');
  if (!state.online) {
    pill.className = 'conn-pill local';
    $('connTxt').textContent = t('status.local');
  } else if (navigator.onLine) {
    pill.className = 'conn-pill online';
    $('connTxt').textContent = t('status.online');
  } else {
    pill.className = 'conn-pill offline';
    $('connTxt').textContent = t('status.offline');
  }
}
window.addEventListener('online', updateConnPill);
window.addEventListener('offline', updateConnPill);

function initErrorText() {
  if (!state.initError) return '';
  const raw = state.initError.raw ? ' [' + state.initError.raw + ']' : '';
  return t(state.initError.key) + raw;
}
function updateLoginModeNote() {
  const note = $('loginModeNote');
  if (state.online) { note.className = 'login-mode-note mode-online'; note.textContent = t('mode.online'); }
  else if (state.initError) { note.className = 'login-mode-note mode-err'; note.textContent = '⛔ ' + initErrorText(); }
  else { note.className = 'login-mode-note mode-local'; note.textContent = t('mode.local'); }
}

/* ==================== LOGIN / ROLES ==================== */
let pendingRole = null;

function selectRole(role) {
  pendingRole = role;
  $('roleEmployee').classList.toggle('selected', role === 'employee');
  $('roleAdmin').classList.toggle('selected', role === 'admin');
  $('loginPwArea').classList.add('visible');
  $('loginError').textContent = '';
  $('loginPw').value = '';
  $('loginPw').focus();
}
$('roleEmployee').addEventListener('click', () => selectRole('employee'));
$('roleAdmin').addEventListener('click', () => selectRole('admin'));

async function tryLogin() {
  const pw = $('loginPw').value;
  if (!pw) { $('loginError').textContent = t('login.enterPw'); return; }
  if (!pendingRole) return;
  const h = await hashPw(pw);
  const target = pendingRole === 'admin' ? state.settings.adminHash : state.settings.empHash;
  if (h === target) {
    enterApp(pendingRole);
  } else {
    $('loginError').textContent = t('login.wrong');
    $('loginPw').value = '';
  }
}
$('btnLogin').addEventListener('click', tryLogin);
$('loginPw').addEventListener('keydown', e => { if (e.key === 'Enter') tryLogin(); });

function enterApp(role) {
  state.role = role;
  if (role === 'employee') localStorage.setItem('pz_session', 'employee');
  else sessionStorage.setItem('pz_session_admin', '1');
  $('loginView').style.display = 'none';
  $('appView').classList.add('active');
  $('rolePill').textContent = t(role === 'admin' ? 'role.admin' : 'role.employee');
  document.querySelectorAll('.admin-only').forEach(el => { el.style.display = role === 'admin' ? '' : 'none'; });
  $('periodTotalBar').classList.toggle('visible', role === 'admin');
  navigateTo('pageNew');
  $('txDate').value = todayStr();
  setExportDefaults();
  refreshAfterData();
  updateConnPill();
  toast(t('toast.loginOk'));
}

function logout() {
  localStorage.removeItem('pz_session');
  sessionStorage.removeItem('pz_session_admin');
  location.reload();
}
$('btnLogout').addEventListener('click', logout);

/* ==================== NAVIGATION ==================== */
function navigateTo(pageId) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-page="${pageId}"]`);
  if (navBtn) navBtn.classList.add('active');
  $(pageId).classList.add('active');
  window.scrollTo(0, 0);
}
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = btn.dataset.page;
    if ((target === 'pageDashboard' || target === 'pageSettings') && state.role !== 'admin') return;
    navigateTo(target);
    if (target === 'pageHistory') renderHistory();
    if (target === 'pageMachines') renderMachines();
    if (target === 'pageDashboard') renderDashboard();
    if (target === 'pageSettings') renderMachSettings();
  });
});

/* ==================== CONFIRM MODAL ==================== */
let confirmCb = null;
function askConfirm(title, sub, cb) {
  $('confirmTitle').textContent = title;
  $('confirmSub').textContent = sub;
  $('confirmYes').textContent = t('confirm.delete');
  $('confirmNo').textContent = t('confirm.cancel');
  confirmCb = cb;
  $('confirmOverlay').classList.add('visible');
}
$('confirmYes').addEventListener('click', () => { $('confirmOverlay').classList.remove('visible'); if (confirmCb) confirmCb(); confirmCb = null; });
$('confirmNo').addEventListener('click', () => { $('confirmOverlay').classList.remove('visible'); confirmCb = null; });
$('confirmOverlay').addEventListener('click', e => { if (e.target === $('confirmOverlay')) { $('confirmOverlay').classList.remove('visible'); confirmCb = null; } });
/* ==================== PRICE MODE ==================== */
const PAPER_TYPES = ['A4', 'A3', 'A5', 'eng'];
const SIMPLE_TYPES = ['books', 'office', 'pads', 'wrap'];

function updatePriceModeLabels() {
  const txt = state.isFinalPrice ? t('price.total') : t('price.unit');
  $('subPriceLabel').textContent = txt;
  $('simplePriceLabel').textContent = txt;
  $('customPriceLabel').textContent = txt;
}
function updatePriceMode(final) {
  state.isFinalPrice = final;
  $('btnFinalPrice').classList.toggle('active', final);
  $('btnPerItem').classList.toggle('active', !final);
  updatePriceModeLabels();
}
$('btnPerItem').addEventListener('click', () => updatePriceMode(false));
$('btnFinalPrice').addEventListener('click', () => updatePriceMode(true));

/* ==================== SERVICE GRID ==================== */
$('serviceGrid').addEventListener('click', e => {
  const btn = e.target.closest('.svc-btn');
  if (!btn) return;
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  state.selSvc = btn.dataset.svc;
  state.selOp = null; state.selColor = null; state.selFace = null; state.selFinish = null;

  document.querySelectorAll('#subPanel .chip').forEach(c => c.classList.remove('sel', 'sel-green', 'sel-orange'));
  $('subQty').value = 0; $('subPrice').value = '0.00';
  $('engLength').value = ''; $('engNote').value = '';

  if (PAPER_TYPES.includes(state.selSvc)) {
    $('subPanel').classList.add('visible');
    $('simplePanel').classList.remove('visible');
    $('engFields').classList.toggle('visible', state.selSvc === 'eng');
    $('colorRow').style.display = 'none';
    $('faceRow').style.display = 'none';
    $('finishRow').style.display = 'none';
    updateSubBtn();
  } else {
    $('subPanel').classList.remove('visible');
    $('simplePanel').classList.add('visible');
    $('simpleDesc').value = ''; $('simpleQty').value = 1; $('simplePrice').value = '0.00';
    updateSimpleBtn();
  }
});

/* ==================== SUB OPTION CHIPS ==================== */
$('opChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip'); if (!chip) return;
  $('opChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel'));
  chip.classList.add('sel');
  state.selOp = chip.dataset.op;
  state.selColor = null; state.selFace = null; state.selFinish = null;
  if (state.selOp === 'scan') {
    $('colorRow').style.display = 'none';
    $('faceRow').style.display = 'none';
    $('finishRow').style.display = 'none';
    state.selColor = '—'; state.selFace = '—'; state.selFinish = '—';
  } else {
    $('colorRow').style.display = '';
    $('faceRow').style.display = 'none';
    $('finishRow').style.display = 'none';
    $('colorChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel', 'sel-orange'));
  }
  updateSubBtn();
});

$('colorChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip'); if (!chip) return;
  $('colorChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel', 'sel-orange'));
  chip.classList.add('sel-orange');
  state.selColor = chip.dataset.color;
  state.selFace = null; state.selFinish = null;
  $('faceRow').style.display = '';
  $('finishRow').style.display = 'none';
  $('faceChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel', 'sel-green'));
  updateSubBtn();
});

$('faceChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip'); if (!chip) return;
  $('faceChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel', 'sel-green'));
  chip.classList.add('sel-green');
  state.selFace = chip.dataset.face;
  if (state.selOp === 'print' || state.selOp === 'copy') {
    $('finishRow').style.display = '';
    $('finishChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel', 'sel-green'));
    $('finishChips').querySelector('[data-finish="normal"]').classList.add('sel-green');
    state.selFinish = 'normal';
  } else {
    state.selFinish = '—';
  }
  updateSubBtn();
});

$('finishChips').addEventListener('click', e => {
  const chip = e.target.closest('.chip'); if (!chip) return;
  $('finishChips').querySelectorAll('.chip').forEach(c => c.classList.remove('sel', 'sel-green'));
  chip.classList.add('sel-green');
  state.selFinish = chip.dataset.finish;
  updateSubBtn();
});

$('subQty').addEventListener('input', updateSubBtn);
$('subPrice').addEventListener('input', updateSubBtn);
$('engLength').addEventListener('input', updateSubBtn);

function updateSubBtn() {
  const q = parseInt($('subQty').value) || 0;
  const p = parseFloat($('subPrice').value) || 0;
  const engOk = state.selSvc !== 'eng' || (parseFloat($('engLength').value) > 0);
  $('btnAddSub').disabled = !(state.selOp && q > 0 && p > 0 && engOk);
}

function resetSubPanel() {
  state.selOp = null; state.selColor = null; state.selFace = null; state.selFinish = null;
  document.querySelectorAll('#subPanel .chip').forEach(c => c.classList.remove('sel', 'sel-orange', 'sel-green'));
  $('colorRow').style.display = 'none';
  $('faceRow').style.display = 'none';
  $('finishRow').style.display = 'none';
  $('subQty').value = 0; $('subPrice').value = '0.00';
  $('engLength').value = ''; $('engNote').value = '';
  updateSubBtn();
}

$('btnAddSub').addEventListener('click', () => {
  const q = parseInt($('subQty').value) || 0;
  const p = parseFloat($('subPrice').value) || 0;
  const engLength = state.selSvc === 'eng' ? (parseFloat($('engLength').value) || 0) : null;
  const engNote = state.selSvc === 'eng' ? $('engNote').value.trim() : null;
  state.invoice.push({
    id: Date.now() + Math.random(), svc: state.selSvc, op: state.selOp,
    color: state.selColor || '—', face: state.selFace || '—', finish: state.selFinish || '—',
    desc: null, qty: q, price: p, total: state.isFinalPrice ? p : q * p,
    engLength, engNote, type: 'paper', isFinal: state.isFinalPrice
  });
  renderInvoice();
  toast(t('toast.added'));
  resetSubPanel();
});

$('btnCancelSub').addEventListener('click', () => {
  $('subPanel').classList.remove('visible');
  $('engFields').classList.remove('visible');
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  state.selSvc = null;
});

/* ==================== SIMPLE SERVICE ==================== */
$('simpleQty').addEventListener('input', updateSimpleBtn);
$('simplePrice').addEventListener('input', updateSimpleBtn);
function updateSimpleBtn() {
  const q = parseInt($('simpleQty').value) || 0;
  const p = parseFloat($('simplePrice').value) || 0;
  $('btnAddSimple').disabled = !(q > 0 && p > 0);
}
$('btnAddSimple').addEventListener('click', () => {
  const q = parseInt($('simpleQty').value) || 0;
  const p = parseFloat($('simplePrice').value) || 0;
  const d = $('simpleDesc').value.trim() || null;
  state.invoice.push({
    id: Date.now() + Math.random(), svc: state.selSvc, op: null,
    color: '—', face: '—', finish: '—', desc: d,
    engLength: null, engNote: null, qty: q, price: p,
    total: state.isFinalPrice ? p : q * p, type: 'simple', isFinal: state.isFinalPrice
  });
  renderInvoice();
  toast(t('toast.added'));
  $('simplePanel').classList.remove('visible');
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  state.selSvc = null;
});
$('btnCancelSimple').addEventListener('click', () => {
  $('simplePanel').classList.remove('visible');
  document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
  state.selSvc = null;
});

/* ==================== CUSTOM SERVICE ==================== */
$('customSvc').addEventListener('click', function (e) {
  if (!this.classList.contains('expanded')) { this.classList.add('expanded'); $('customName').focus(); }
});
['customQty', 'customPrice', 'customName'].forEach(id => $(id).addEventListener('input', updateCustomBtn));
function updateCustomBtn() {
  const q = parseInt($('customQty').value) || 0;
  const p = parseFloat($('customPrice').value) || 0;
  const n = $('customName').value.trim();
  $('btnAddCustom').disabled = !(n && q > 0 && p > 0);
}
$('btnAddCustom').addEventListener('click', () => {
  const q = parseInt($('customQty').value) || 0;
  const p = parseFloat($('customPrice').value) || 0;
  const n = $('customName').value.trim();
  state.invoice.push({
    id: Date.now() + Math.random(), svc: 'custom', op: null,
    color: '—', face: '—', finish: '—', desc: n,
    engLength: null, engNote: null, qty: q, price: p,
    total: state.isFinalPrice ? p : q * p, type: 'custom', isFinal: state.isFinalPrice
  });
  renderInvoice();
  toast(t('toast.added'));
  $('customName').value = ''; $('customQty').value = 1; $('customPrice').value = '0.00';
  $('customSvc').classList.remove('expanded');
  updateCustomBtn();
});

/* ==================== INVOICE ==================== */
function itemMainLabel(it) {
  if (it.type === 'custom') return it.desc;
  if (it.type === 'simple') return it.desc ? (svcLabel(it.svc) + ' — ' + it.desc) : svcLabel(it.svc);
  return null;
}
function renderInvoice() {
  const body = $('invoiceBody');
  if (!state.invoice.length) {
    body.innerHTML = `<div class="inv-empty">${t('inv.empty')}</div>`;
  } else {
    body.innerHTML = state.invoice.map(it => {
      const colorCls = it.color === 'color' ? 'tag-color' : it.color === 'black' ? 'tag-black' : '';
      const hasEng = it.engLength && it.engLength > 0;
      let tags = '';
      if (it.type === 'paper') {
        tags += `<span class="tag tag-paper">${svcLabel(it.svc)}</span>`;
        tags += `<span class="tag tag-op">${valLabel(it.op)}</span>`;
        if (it.color !== '—') tags += `<span class="tag ${colorCls}">${valLabel(it.color)}</span>`;
        if (it.face !== '—') tags += `<span class="tag tag-face">${valLabel(it.face)}</span>`;
        if (it.finish !== '—' && it.finish !== 'normal') tags += `<span class="tag tag-finish">${valLabel(it.finish)}</span>`;
      } else {
        tags += `<span class="tag ${it.type === 'custom' ? 'tag-custom' : 'tag-op'}">${escapeHtml(itemMainLabel(it))}</span>`;
      }
      if (it.isFinal) tags += `<span class="tag tag-final">${t('inv.final')}</span>`;
      return `<div class="inv-item">
        <div class="inv-item-top">
          <div class="inv-item-info">${tags}</div>
          <span class="inv-item-qty">×${it.qty}</span>
          <span class="inv-item-total">${it.total.toFixed(2)}</span>
          <button class="btn-del-item" data-id="${it.id}">✕</button>
        </div>
        ${hasEng ? `<div class="inv-item-eng"><span><i data-lucide="ruler"></i> ${it.engLength} ${t('eng.m')}</span>${it.engNote ? `<span style="color:var(--text-muted)">— ${escapeHtml(it.engNote)}</span>` : ''}</div>` : ''}
      </div>`;
    }).join('');
  }
  $('invTotal').textContent = fmtMoney(state.invoice.reduce((s, it) => s + it.total, 0));
  $('btnSaveTx').disabled = !state.invoice.length;
  refreshIcons();
}
function escapeHtml(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

$('invoiceBody').addEventListener('click', e => {
  const btn = e.target.closest('.btn-del-item'); if (!btn) return;
  state.invoice = state.invoice.filter(it => String(it.id) !== btn.dataset.id);
  renderInvoice();
});
$('btnClearInv').addEventListener('click', () => { state.invoice = []; renderInvoice(); });

/* ==================== SAVE TRANSACTION ==================== */
$('btnSaveTx').addEventListener('click', async () => {
  if (!state.invoice.length) return;
  const date = $('txDate').value;
  if (!date) { toast(t('toast.dateReq'), true); return; }
  $('btnSaveTx').disabled = true;
  const tx = {
    client: $('clientName').value.trim() || t('newtx.defaultClient'),
    date,
    notes: $('txNotes').value.trim(),
    items: state.invoice.map(({ id, ...rest }) => rest),
    total: state.invoice.reduce((s, it) => s + it.total, 0),
    pieces: state.invoice.reduce((s, it) => s + it.qty, 0),
    engMeters: state.invoice.reduce((s, it) => s + (it.engLength || 0), 0),
    createdAt: new Date().toISOString(),
    createdBy: state.role,
    deviceId: state.deviceId,
  };
  try {
    await store.addTx(tx);
    toast(t('toast.saved'));
    state.invoice = [];
    renderInvoice();
    $('clientName').value = ''; $('txNotes').value = ''; $('txDate').value = todayStr();
    document.querySelectorAll('.svc-btn').forEach(b => b.classList.remove('selected'));
    $('subPanel').classList.remove('visible');
    $('engFields').classList.remove('visible');
    $('simplePanel').classList.remove('visible');
    $('customSvc').classList.remove('expanded');
    state.selSvc = null;
  } catch (err) {
    console.error(err);
    toast((lang === 'ar' ? 'خطأ في الحفظ: ' : 'Save error: ') + err.message, true);
    $('btnSaveTx').disabled = false;
  }
});

/* ==================== HISTORY ==================== */
$('historyFilters').addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip'); if (!chip) return;
  document.querySelectorAll('#historyFilters .filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  state.historyFilter = chip.dataset.filter;
  renderHistory();
});
$('searchHistory').addEventListener('input', () => renderHistory());

function getFilteredHistory() {
  const search = $('searchHistory').value.trim().toLowerCase();
  const now = new Date();
  return state.transactions.filter(tx => {
    if (search && !(tx.client || '').toLowerCase().includes(search) && !(tx.date || '').includes(search)) return false;
    if (state.historyFilter === 'today') return tx.date === todayStr();
    if (state.historyFilter === 'week') return (now - new Date(tx.date + 'T00:00:00')) / 86400000 <= 7;
    if (state.historyFilter === 'month') { const d = new Date(tx.date + 'T00:00:00'); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }
    return true;
  });
}

function canDeleteTx(tx) {
  if (state.role === 'admin') return true;
  const age = Date.now() - new Date(tx.createdAt || 0).getTime();
  return age < 10 * 60 * 1000;
}

function renderHistory() {
  if (!$('pageHistory')) return;
  const filtered = getFilteredHistory();
  const list = $('historyList');
  if (state.role === 'admin') {
    $('periodTotalVal').textContent = fmtMoney(filtered.reduce((s, t2) => s + (t2.total || 0), 0));
  }
  if (!filtered.length) {
    list.innerHTML = `<div class="empty-big"><div class="empty-icon"><i data-lucide="inbox"></i></div><p>${state.transactions.length ? t('hist.noresults') : t('hist.empty')}</p></div>`;
    refreshIcons();
    return;
  }
  list.innerHTML = filtered.map(tx => {
    const tagSet = [...new Set((tx.items || []).map(it => {
      if (it.type === 'custom') return `<span class="tag tag-custom">${escapeHtml(it.desc)}</span>`;
      if (it.svc === 'eng') return `<span class="tag tag-eng">${svcLabel('eng')}</span>`;
      if (it.type === 'paper') return `<span class="tag tag-paper">${svcLabel(it.svc)}</span>`;
      return `<span class="tag tag-op">${svcLabel(it.svc)}</span>`;
    }))].slice(0, 6).join('');
    const engTotal = (tx.items || []).filter(it => it.engLength > 0).reduce((s, it) => s + it.engLength, 0);
    const byBadge = tx.createdBy ? `<span class="by-badge">${t(tx.createdBy === 'admin' ? 'role.admin' : 'role.employee')}</span>` : '';
    const delBtn = canDeleteTx(tx) ? `<button class="btn-delete-transaction" data-id="${tx.id}">${t('hist.delete')}</button>` : '';
    return `<div class="history-card">
      <div class="history-card-head">
        <span class="client">${escapeHtml(tx.client)}${byBadge}</span>
        <span class="date">${fmtDate(tx.date)}</span>
      </div>
      ${tx.notes ? `<div class="notes">${escapeHtml(tx.notes)}</div>` : ''}
      <div class="history-card-tags">${tagSet}</div>
      ${engTotal > 0 ? `<div style="font-size:.72rem;color:var(--teal);margin-bottom:4px;font-weight:700"><i data-lucide="ruler"></i> ${engTotal.toFixed(2)} ${t('eng.m')}</div>` : ''}
      <div class="history-card-bottom">
        <span class="items-count">${tx.pieces} ${t('hist.pieces')} · ${(tx.items || []).length} ${t('hist.items')}</span>
        <span class="total">${fmtMoney(tx.total || 0)}</span>
      </div>
      ${delBtn}
    </div>`;
  }).join('');

  list.querySelectorAll('.btn-delete-transaction').forEach(btn => {
    btn.addEventListener('click', () => {
      const tx = state.transactions.find(t2 => String(t2.id) === btn.dataset.id);
      if (!tx) return;
      if (!canDeleteTx(tx)) { toast(t('hist.delDenied'), true); return; }
      askConfirm(t('confirm.delTx'), t('confirm.delTxSub'), async () => {
        await store.delTx(tx.id);
        toast(t('toast.deleted'));
        renderHistory();
      });
    });
  });
  refreshIcons();
}

/* ==================== MACHINES ==================== */
function renderMachines() {
  if (!$('machinesList')) return;
  const list = $('machinesList');
  if (!state.machines.length) {
    list.innerHTML = `<div class="empty-big"><div class="empty-icon"><i data-lucide="settings-2"></i></div><p>${t('mach.empty')}</p></div>`;
    refreshIcons();
    return;
  }
  list.innerHTML = state.machines.map(m => {
    const recs = m.records || [];
    const last = recs.length ? recs[recs.length - 1] : null;
    return `<div class="machine-card">
      <div class="machine-name">${escapeHtml(m.name)}</div>
      <div class="machine-type">${t('mach.counter')}</div>
      ${last ? `<div class="machine-last">${t('mach.last')} <strong>${Number(last.value).toLocaleString('en')}</strong> — ${fmtDate(last.date)}</div>` : ''}
      <div class="counter-row">
        <div class="counter-field">
          <label>${t('mach.new')}</label>
          <input type="number" id="mc_${m.id}" min="0" placeholder="0">
        </div>
        <div class="counter-field" style="flex:.55">
          <label>${t('mach.date')}</label>
          <input type="date" id="mcdate_${m.id}" value="${todayStr()}">
        </div>
        <button class="btn-save-counter" data-key="${m.id}">${t('mach.save')}</button>
      </div>
      ${recs.length ? `<div class="counter-history">${recs.slice(-5).reverse().map((r, i, arr) => {
        const prev = i < arr.length - 1 ? arr[i + 1].value : r.value;
        const diff = r.value - prev;
        return `<div class="counter-entry">
          <span class="ce-date">${fmtDate(r.date)}</span>
          <span class="ce-val">${Number(r.value).toLocaleString('en')}</span>
          <span class="ce-diff">${i < arr.length - 1 ? '+' + diff.toLocaleString('en') : ''}</span>
        </div>`;
      }).join('')}</div>` : ''}
    </div>`;
  }).join('');

  list.querySelectorAll('.btn-save-counter').forEach(btn => {
    btn.addEventListener('click', async () => {
      const key = btn.dataset.key;
      const val = parseInt($(`mc_${key}`).value);
      const date = $(`mcdate_${key}`).value;
      if (!val || !date) { toast(t('toast.needBoth'), true); return; }
      const machines = state.machines.map(m => m.id === key ? { ...m, records: [...(m.records || []), { value: val, date, at: new Date().toISOString() }] } : m);
      await store.saveMachines(machines);
      if (!state.online) renderMachines();
      toast(t('toast.readingSaved'));
    });
  });
}
/* ==================== DASHBOARD (admin) ==================== */
function itemStatKey(it) {
  if (it.type === 'custom') return it.desc;
  if (it.type === 'simple') return svcLabel(it.svc);
  return valLabel(it.op);
}
function renderDashboard() {
  if (state.role !== 'admin') return;
  const txs = state.transactions;
  $('dTotalTx').textContent = txs.length.toLocaleString('en');
  $('dTotalRev').textContent = Math.round(txs.reduce((s, t2) => s + (t2.total || 0), 0)).toLocaleString('en');
  $('dTotalPieces').textContent = txs.reduce((s, t2) => s + (t2.pieces || 0), 0).toLocaleString('en');
  $('dTotalClients').textContent = new Set(txs.map(t2 => t2.client)).size.toLocaleString('en');
  const today = todayStr();
  $('dTodayRev').textContent = Math.round(txs.filter(t2 => t2.date === today).reduce((s, t2) => s + (t2.total || 0), 0)).toLocaleString('en');
  const now = new Date();
  $('dMonthRev').textContent = Math.round(txs.filter(t2 => { const d = new Date((t2.date || '') + 'T00:00:00'); return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(); }).reduce((s, t2) => s + (t2.total || 0), 0)).toLocaleString('en');
  $('dashEng').textContent = txs.reduce((s, t2) => s + (t2.engMeters || 0), 0).toFixed(2) + ' ' + t('eng.m');

  // top services
  const svcCount = {};
  txs.forEach(t2 => (t2.items || []).forEach(it => {
    const key = itemStatKey(it);
    if (!key) return;
    svcCount[key] = (svcCount[key] || 0) + (it.qty || 0);
  }));
  renderBars('dashServices', svcCount, ['var(--primary)']);

  // top papers
  const paperCount = {};
  txs.forEach(t2 => (t2.items || []).forEach(it => {
    if (it.type === 'paper') paperCount[svcLabel(it.svc)] = (paperCount[svcLabel(it.svc)] || 0) + (it.qty || 0);
  }));
  renderBars('dashPapers', paperCount, ['var(--primary)', '#0369a1', 'var(--teal)', 'var(--orange)', 'var(--green)']);

  // last 7 days revenue
  const days = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    days[k] = 0;
  }
  txs.forEach(t2 => { if (t2.date in days) days[t2.date] += (t2.total || 0); });
  const dayEntries = Object.entries(days);
  const dayMax = Math.max(...dayEntries.map(e => e[1]), 1);
  $('dashLast7').innerHTML = dayEntries.map(([d, v]) => {
    const pct = Math.max((v / dayMax * 100), 2).toFixed(0);
    const label = new Date(d + 'T00:00:00').toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short', day: 'numeric' });
    return `<div class="bar-row"><span class="bar-label">${label}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:var(--teal)">${Math.round(v).toLocaleString('en')}</div></div></div>`;
  }).join('');
}
function renderBars(elId, counts, colors) {
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = sorted.length ? sorted[0][1] : 1;
  $(elId).innerHTML = sorted.map(([name, val], i) => {
    const pct = Math.max((val / max * 100), 4).toFixed(0);
    return `<div class="bar-row"><span class="bar-label">${escapeHtml(name)}</span>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;background:${colors[i % colors.length]}">${val.toLocaleString('en')}</div></div></div>`;
  }).join('') || `<div class="dash-empty">${t('dash.nodata')}</div>`;
}

/* ==================== SETTINGS: EXPORT ==================== */
function setExportDefaults() {
  const now = new Date();
  $('expFrom').value = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-01';
  $('expTo').value = todayStr();
}
$('expQuick').addEventListener('click', e => {
  const chip = e.target.closest('.filter-chip'); if (!chip) return;
  document.querySelectorAll('#expQuick .filter-chip').forEach(c => c.classList.remove('active'));
  chip.classList.add('active');
  const r = chip.dataset.range;
  const now = new Date();
  if (r === 'today') { $('expFrom').value = todayStr(); $('expTo').value = todayStr(); }
  else if (r === 'month') { setExportDefaults(); }
  else { $('expFrom').value = ''; $('expTo').value = todayStr(); }
});

$('btnExportXlsx').addEventListener('click', () => {
  const from = $('expFrom').value;
  const to = $('expTo').value;
  const txs = state.transactions.filter(tx => (!from || tx.date >= from) && (!to || tx.date <= to))
    .slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (!txs.length) { toast(t('toast.expNone'), true); return; }

  const wb = XLSX.utils.book_new();
  if (lang === 'ar') wb.Workbook = { Views: [{ RTL: true }] };

  /* Sheet 1: transactions (one row per item) */
  const rows = [];
  txs.forEach((tx, ti) => {
    (tx.items || []).forEach(it => {
      rows.push({
        [t('xh.no')]: ti + 1,
        [t('xh.date')]: tx.date,
        [t('xh.client')]: tx.client,
        [t('xh.by')]: tx.createdBy ? t(tx.createdBy === 'admin' ? 'role.admin' : 'role.employee') : '',
        [t('xh.notes')]: tx.notes || '',
        [t('xh.svc')]: it.type === 'custom' ? (lang === 'ar' ? 'خدمة أخرى' : 'Custom') : svcLabel(it.svc),
        [t('xh.detail')]: it.type === 'paper' ? valLabel(it.op) : (it.desc || ''),
        [t('xh.color')]: it.color === '—' ? '' : valLabel(it.color),
        [t('xh.sides')]: it.face === '—' ? '' : valLabel(it.face),
        [t('xh.finish')]: it.finish === '—' ? '' : valLabel(it.finish),
        [t('xh.engLen')]: it.engLength || '',
        [t('xh.engNote')]: it.engNote || '',
        [t('xh.qty')]: it.qty,
        [t('xh.price')]: Number(it.price),
        [t('xh.final')]: it.isFinal ? t('yes') : t('no'),
        [t('xh.total')]: Number(it.total),
      });
    });
  });
  const grandTotal = txs.reduce((s, t2) => s + (t2.total || 0), 0);
  const grandPieces = txs.reduce((s, t2) => s + (t2.pieces || 0), 0);
  rows.push({});
  rows.push({ [t('xh.notes')]: t('xh.grand'), [t('xh.qty')]: grandPieces, [t('xh.total')]: Math.round(grandTotal * 100) / 100 });
  const ws1 = XLSX.utils.json_to_sheet(rows);
  ws1['!cols'] = [{ wch: 5 }, { wch: 11 }, { wch: 18 }, { wch: 10 }, { wch: 22 }, { wch: 14 }, { wch: 14 }, { wch: 9 }, { wch: 11 }, { wch: 9 }, { wch: 13 }, { wch: 16 }, { wch: 8 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, ws1, t('sheet.tx'));

  /* Sheet 2: summary */
  const svcAgg = {};
  txs.forEach(t2 => (t2.items || []).forEach(it => {
    const key = it.type === 'custom' ? (it.desc || '') : svcLabel(it.svc);
    if (!svcAgg[key]) svcAgg[key] = { qty: 0, rev: 0 };
    svcAgg[key].qty += (it.qty || 0);
    svcAgg[key].rev += (it.total || 0);
  }));
  const sumRows = [
    [t('sum.period'), (from || '…') + ' → ' + (to || '…')],
    [t('sum.generated'), new Date().toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')],
    [],
    [t('sum.rev'), Math.round(grandTotal * 100) / 100 + ' ' + t('cur')],
    [t('sum.tx'), txs.length],
    [t('sum.pieces'), grandPieces],
    [t('sum.clients'), new Set(txs.map(t2 => t2.client)).size],
    [t('sum.eng'), Math.round(txs.reduce((s, t2) => s + (t2.engMeters || 0), 0) * 100) / 100 + ' ' + t('eng.m')],
    [],
    [t('sum.bySvc')],
    [t('sum.svcCol'), t('sum.qtyCol'), t('sum.revCol')],
    ...Object.entries(svcAgg).sort((a, b) => b[1].rev - a[1].rev).map(([k, v]) => [k, v.qty, Math.round(v.rev * 100) / 100]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(sumRows);
  ws2['!cols'] = [{ wch: 28 }, { wch: 22 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, ws2, t('sheet.sum'));

  /* Sheet 3: machines */
  const machRows = [];
  state.machines.forEach(m => {
    (m.records || []).forEach((r, i, arr) => {
      if (from && r.date < from) return;
      if (to && r.date > to) return;
      machRows.push({
        [t('xh.machine')]: m.name,
        [t('xh.date')]: r.date,
        [t('xh.reading')]: r.value,
        [t('xh.diff')]: i > 0 ? r.value - arr[i - 1].value : '',
      });
    });
  });
  if (machRows.length) {
    const ws3 = XLSX.utils.json_to_sheet(machRows);
    ws3['!cols'] = [{ wch: 20 }, { wch: 11 }, { wch: 12 }, { wch: 10 }];
    XLSX.utils.book_append_sheet(wb, ws3, t('sheet.mach'));
  }

  XLSX.writeFile(wb, `PrintZone_${(from || 'all')}_${(to || todayStr())}.xlsx`);
  toast(t('toast.expDone'));
});

$('btnExportCsv').addEventListener('click', () => {
  const from = $('expFrom').value;
  const to = $('expTo').value;
  const txs = state.transactions.filter(tx => (!from || tx.date >= from) && (!to || tx.date <= to))
    .slice().sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  if (!txs.length) { toast(t('toast.expNone'), true); return; }

  const esc = v => { const s = String(v == null ? '' : v); return s.includes(',') || s.includes('"') || s.includes('\n') ? '"' + s.replace(/"/g, '""') + '"' : s; };
  const headers = [t('xh.no'),t('xh.date'),t('xh.client'),t('xh.by'),t('xh.notes'),t('xh.svc'),t('xh.detail'),t('xh.color'),t('xh.sides'),t('xh.finish'),t('xh.engLen'),t('xh.engNote'),t('xh.qty'),t('xh.price'),t('xh.final'),t('xh.total')];
  const rows = [headers.map(esc).join(',')];
  txs.forEach((tx, ti) => {
    (tx.items || []).forEach(it => {
      rows.push([
        ti+1, tx.date, tx.client,
        tx.createdBy ? t(tx.createdBy === 'admin' ? 'role.admin' : 'role.employee') : '',
        tx.notes || '',
        it.type === 'custom' ? (lang === 'ar' ? 'خدمة أخرى' : 'Custom') : svcLabel(it.svc),
        it.type === 'paper' ? valLabel(it.op) : (it.desc || ''),
        it.color === '—' ? '' : valLabel(it.color),
        it.face === '—' ? '' : valLabel(it.face),
        it.finish === '—' ? '' : valLabel(it.finish),
        it.engLength || '', it.engNote || '',
        it.qty, it.price, it.isFinal ? t('yes') : t('no'), it.total
      ].map(esc).join(','));
    });
  });
  const blob = new Blob(['﻿' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `PrintZone_${(from || 'all')}_${(to || todayStr())}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast(t('toast.expDone'));
});

$('btnBackupJson').addEventListener('click', () => {
  const data = { version: 1, exportedAt: new Date().toISOString(), transactions: state.transactions, machines: state.machines };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `printzone-backup-${todayStr()}.json`; a.click();
  URL.revokeObjectURL(url);
  toast(t('toast.backupDone'));
});

$('fileRestoreJson').addEventListener('change', async e => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (!Array.isArray(data.transactions)) throw new Error();
    const existingIds = new Set(state.transactions.map(tx => tx.id));
    const newTxs = data.transactions.filter(tx => tx.id && !existingIds.has(tx.id));
    if (state.online && db) {
      for (let i = 0; i < newTxs.length; i += 499) {
        const batch = db.batch();
        newTxs.slice(i, i + 499).forEach(tx => batch.set(db.collection('transactions').doc(String(tx.id)), tx));
        await batch.commit();
      }
    } else {
      const merged = [...newTxs, ...state.transactions];
      state.transactions = merged;
      localStorage.setItem('pz_tx', JSON.stringify(merged));
      refreshAfterData();
    }
    if (Array.isArray(data.machines) && data.machines.length && !state.online) {
      await store.saveMachines(data.machines);
    }
    toast(t('toast.restoreDone').replace('{n}', newTxs.length));
  } catch { toast(t('toast.restoreErr'), true); }
  e.target.value = '';
});

/* ==================== SETTINGS: PASSWORDS ==================== */
$('btnChangeEmpPw').addEventListener('click', async () => {
  const v = $('newEmpPw').value;
  if (!v || v.length < 4) { toast(t('toast.pwShort'), true); return; }
  const s = { ...state.settings, empHash: await hashPw(v) };
  await store.saveSettings(s);
  state.settings = s;
  $('newEmpPw').value = '';
  toast(t('toast.pwChanged'));
});
$('btnChangeAdminPw').addEventListener('click', async () => {
  const cur = $('curAdminPw').value;
  const v = $('newAdminPw').value;
  if (await hashPw(cur) !== state.settings.adminHash) { toast(t('toast.pwWrong'), true); return; }
  if (!v || v.length < 4) { toast(t('toast.pwShort'), true); return; }
  const s = { ...state.settings, adminHash: await hashPw(v) };
  await store.saveSettings(s);
  state.settings = s;
  $('curAdminPw').value = ''; $('newAdminPw').value = '';
  toast(t('toast.pwChanged'));
});

/* ==================== SETTINGS: MACHINES ==================== */
function renderMachSettings() {
  if (state.role !== 'admin') return;
  const wrap = $('machSetList');
  wrap.innerHTML = state.machines.map(m => `
    <div class="mach-set-row" data-id="${m.id}">
      <input type="text" value="${escapeHtml(m.name)}" data-mach-name="${m.id}">
      <button class="btn-secondary" data-mach-save="${m.id}"><i data-lucide="save"></i></button>
      <button class="btn-danger" data-mach-del="${m.id}"><i data-lucide="trash-2"></i></button>
    </div>`).join('');

  wrap.querySelectorAll('[data-mach-save]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.machSave;
      const name = wrap.querySelector(`[data-mach-name="${id}"]`).value.trim();
      if (!name) return;
      const machines = state.machines.map(m => m.id === id ? { ...m, name } : m);
      await store.saveMachines(machines);
      if (!state.online) { renderMachSettings(); renderMachines(); }
      toast(t('toast.machSaved'));
    });
  });
  wrap.querySelectorAll('[data-mach-del]').forEach(btn => {
    btn.addEventListener('click', () => {
      askConfirm(t('machset.delConfirm'), t('machset.delConfirmSub'), async () => {
        const machines = state.machines.filter(m => m.id !== btn.dataset.machDel);
        await store.saveMachines(machines);
        if (!state.online) { renderMachSettings(); renderMachines(); }
        toast(t('toast.machSaved'));
      });
    });
  });
  refreshIcons();
}
$('btnAddMachine').addEventListener('click', async () => {
  const name = prompt(t('machset.name'));
  if (!name || !name.trim()) return;
  const machines = [...state.machines, { id: 'm' + Date.now(), name: name.trim(), order: state.machines.length + 1, records: [] }];
  await store.saveMachines(machines);
  if (!state.online) { renderMachSettings(); renderMachines(); }
  toast(t('toast.machSaved'));
});

/* ==================== EVENT WIRES ==================== */
$('langToggle').addEventListener('click', toggleLang);
$('langToggleLogin').addEventListener('click', toggleLang);
$('themeToggle').addEventListener('click', toggleTheme);
$('themeToggleLogin').addEventListener('click', toggleTheme);

/* ==================== BOOT ==================== */
function classifyInitError(err) {
  const s = ((err && err.code) || '') + ' ' + ((err && err.message) || '');
  if (/operation-not-allowed|admin-restricted-operation|configuration-not-found|sign_in_provider|identitytoolkit/i.test(s)) return { key: 'err.auth', raw: err.code || '' };
  if (/permission-denied|insufficient permissions/i.test(s)) return { key: 'err.rules', raw: '' };
  if (/not-found|does not exist|NOT_FOUND/i.test(s)) return { key: 'err.notfound', raw: '' };
  return { key: 'err.generic', raw: (err && (err.code || err.message)) || '' };
}

function hideLoading(showLoginAfter) {
  const lv = $('loadingView');
  lv.classList.add('hidden');
  setTimeout(() => {
    lv.style.display = 'none';
    if (showLoginAfter) $('loginView').style.display = '';
  }, 350);
}

(async function boot() {
  const bootStart = Date.now();
  applyI18n();
  refreshIcons();
  $('txDate').value = todayStr();
  $('loadingStatus').textContent = t('loading.connecting');
  try {
    if (getFbConfig()) {
      if (typeof firebase === 'undefined') throw { code: 'scripts', message: 'firebase scripts not loaded' };
      store = FireStore;
      await store.init();
    } else {
      store = LocalStore;
      await store.init();
    }
  } catch (err) {
    console.error('Firebase init failed, falling back to local:', err);
    state.initError = (err && err.code === 'scripts') ? { key: 'err.scripts', raw: '' } : classifyInitError(err);
    state.online = false;
    store = LocalStore;
    await store.init();
    toast((lang === 'ar' ? 'تعذر الاتصال — وضع محلي مؤقتاً' : 'Connection failed — local mode for now'), true);
  }
  applyI18n();
  // keep the splash visible briefly so it doesn't flash
  const elapsed = Date.now() - bootStart;
  if (elapsed < 600) await new Promise(r => setTimeout(r, 600 - elapsed));
  // restore session
  let restored = false;
  if (sessionStorage.getItem('pz_session_admin') === '1') { enterApp('admin'); restored = true; }
  else if (localStorage.getItem('pz_session') === 'employee') { enterApp('employee'); restored = true; }
  hideLoading(!restored);
  refreshIcons();
})();