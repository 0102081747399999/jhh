// ==========================================================================
// قائمة الأطباق والوجبات (Menu Data)
// ==========================================================================

const MENU_ITEMS = [
  {
    id: 'item-1',
    title: 'صينية مشاوي ديوان الملكية',
    desc: 'مشكل كباب لحم غنم، ريش، أوصال وشيش طاووق مع الخبز المحمص والبيواز والصوصات الخاصة.',
    price: 240,
    oldPrice: 290,
    category: 'grills',
    rating: '4.9',
    reviews: '240+',
    time: '25-30 دقيقة',
    calories: '850 سعرة',
    tag: 'الأكثر طلباً',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfB_hCqbCIkilg39auY71bDiER4-y6tR975-artb3mmSGg4zJamSlqqi49BNLjnnpNWLhDuMGJ3gtt7RH3LK0cP7mW9HndWje0uCj38KtB5EHVm_l2fY8rDINexbwJb00fAog0iFmOEiL2sos4W67YoKY-hc6aKESITTvU9_se1CGgC6Y-G3VMiteXYtk1L-rPNf7DkISVhc81XlO0VUnAp3JnEDSailpgzys1TS9H'
  },
  {
    id: 'item-2',
    title: 'كباب حلبي بصلصة الكرز',
    desc: 'أسياخ كباب لحم العجل البلدي مع صوص الكرز الطبيعي الحامض الحلو والمكسرات المحمصة.',
    price: 185,
    category: 'grills',
    rating: '4.8',
    reviews: '110',
    time: '20 دقيقة',
    calories: '640 سعرة',
    tag: 'مميز الشيف',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYMCFL8RF67FNVmaj5rDAj-7RNlt9HSebAcgfL73668_P9L0PtpYtrapfPBFj9Jg0c3vStGOWuwY8YhP13gDQyT7r-Rn0WSKCFSQ7cuiGUuaoZ8pqxOzY6whGSHWqiX5S40nfmQmSepDLYETkQjca1KaNw_XpqwAYDEL_Ubnk-qV1PA2IsdGGVNtLbB7hjyyFjI9yzh5ZTUH5t-fRLJZZbIGZQsoNTi-1XfaRgjlWO'
  },
  {
    id: 'item-3',
    title: 'برجر اللحم المشوي على الفحم',
    desc: 'قطعة لحم بلدي ١٨٠ جم مشوية على الحطب مع جبن شيدر ذائب وصوص ديوان الحار وخبز بريوش طازج.',
    price: 115,
    category: 'sandwiches',
    rating: '4.7',
    reviews: '89',
    time: '15-20 دقيقة',
    calories: 'حار خفيف',
    tag: 'جديد',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBt_wTSASJXUWR3uEZySDSl8-noQ-caMrP2iNSMpPcZTtJ_k-llD-jPUJ3g06-A96Wiaw-0WzudNo2P8RsQaN4udLyHytnObzFjNNny5uPJEPZwdIIoaP2HJmsBYwyGur0fy7X9ibERsVYzFdm9mhVxBUAIyqMb8nitW02zS2-lJo0SgrRsn9RnW_RwcYpDMaMEg88Az9hzNLc8aBu6ip4-oknoRvJR5SynrczmbRIi'
  },
  {
    id: 'item-4',
    title: 'وجبة شاورما لحم عربي فاخرة',
    desc: 'شاورما لحم محمرة بخبز الصاج ومقطعة مع البطاطا المقلية المتبلة وصوص الثومية والمخلل المنزلي.',
    price: 95,
    category: 'sandwiches',
    rating: '4.9',
    reviews: '310',
    time: '15 دقيقة',
    calories: '710 سعرة',
    tag: 'الأكثر مبيعاً',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAODWdrI3bHvkLNYzF5aEM1agw92MlnpM65a0SbhCk6bMIIlc2YiPfgQFApYaKaQbWur7Kf5szJcYb0B2y-v06-vuerIS03l4S76uL4wRam1x-g7n8zNvsyYPPXtPvW5NMg1ZuHtarec8raTRRxiIwQzHbUECmdXzouiKHVXJLXuQCYCEXxTaBwH9iIHXf6hUHYs1nDkWXDBM0hWzgeVMnKJ4ZmkWa5ACdgGbYBYAkN'
  },
  {
    id: 'item-5',
    title: 'حمص باللحم والصنوبر البلدي',
    desc: 'حمص ناعم بزيت الزيتون البكر مع قطع لحم الغنم المحمرة والصنوبر الذهبي وحبات الرمان.',
    price: 65,
    category: 'appetizers',
    rating: '4.9',
    reviews: '175',
    time: '10 دقائق',
    calories: 'أصيل',
    tag: 'مقبلات ساخنة',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCFlmMrwYxyj5sT6QWVICuRs72nHp-qBQUGIZ94q39qp8wHX4SMYNWWWwY8APZfKZjqzqNrmvsEYgrKROnV-kWK1cb0Bi-6437QmP5AcvjaVGc5yL7udxcSzRo6HDbfazg8ADypzMNQmM4MbO_5dgBXs7Y6wXNkgo6YBHHpl-C1i8vixKUMMFdTRTwF72FPHIlKObIe5iUxGXE7J-otxyEK2OcSp7dwTvglwRCgrYUo'
  },
  {
    id: 'item-6',
    title: 'سلطة فتوش بالرمان والسماق',
    desc: 'خضروات موسمية طازجة مع خبز البيتا المقرمش بالسماق وصوص دبس الرمان الجبلي المنعش.',
    price: 45,
    category: 'appetizers',
    rating: '4.8',
    reviews: '94',
    time: '10 دقائق',
    calories: 'نباتي',
    tag: 'طازج يومياً',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAYN4kGjAnPy6NyDp-0wRPAKwoo0s_OX9pHIqmod1kvi2-uCDEFq5FNzZfMlLhs9ohtPnbahMaIMQnPW5Y7P8mKAUtZoy7aebUZFU_YmJczZFvnEqG7FfAgqQ8yZR7ffZznjmu5bq53UF6Px0wBZ8OzmKVR5HS51TGGGRzHc1nTnVuvHZF1DdPHGv1q-hgv-T1-r3TiqQPz3LKild7-MsAF4n9K4wAX_8JPhLhr4Mak'
  },
  {
    id: 'item-7',
    title: 'ليموناضة النعناع الباردة',
    desc: 'ليمون طازج معصور مع أوراق النعناع الأخضر والثلج المجروش وقليل من العسل الطبيعي.',
    price: 35,
    category: 'beverages',
    rating: '4.9',
    reviews: '140',
    time: '5 دقائق',
    calories: 'مثلج',
    tag: 'منعش',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAO54Iht783-nZK7rlYabut_dO2a6PFRSWd5OPk5iaz-J_97cenDSUpcpsam_-Aj6Y1pqsxjDyyuWytkAmwc3dcgr1uC2BmWuyVMFHPo5fAgauZ2GTMpBQY9sXT6oHX2RA5-w67CmNiwdZiem2Mg_f1X2LBcoXwNmb8SPKDBDBydARqlNTKGo9CiU5YuRHPE7FgKzmEi-is_fIAPHN8mN6r1MBMu69NCfA679pRTjQe'
  },
  {
    id: 'item-8',
    title: 'كنافة نابلسية خشنة بالجبن',
    desc: 'جبنة عكاوية تمط بطراوة مع خيوط الكنافة المقرمشة بالسمن البلدي وقطر ماء الزهر والفستق.',
    price: 55,
    category: 'desserts',
    rating: '5.0',
    reviews: '320',
    time: '12 دقيقة',
    calories: 'حلويات ديوان',
    tag: 'ساخنة وطازجة',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCR9sAOr-nNAeGQHdsPgnRhQmVaoMayNthAxHLwx0C1M0hyx-Rnw13gLynnmPqzofxEkDVAkkh7ACaVjILPoSF42Oa1bf0kBdz0HU2NT2dfmBmyY4tI0waWF5DZwaw34plYf3uKF7p3QhM-mODid76sRPFAmBa41qxB8paIi_f3kIYhWSX-5cELw70Egqor4SI32o6-kmPjgXUJ05Xb8Ap6t-aM0NgXZCsbf5LYX0LI'
  }
];

// تصدير للنافذة العامة
window.MENU_ITEMS = MENU_ITEMS;
