import { ref } from 'vue';

// The Arabic passages remain Arabic-first. This module translates the surrounding app chrome and
// selects Arabic automatically when the device language is Arabic, matching the Ruqyah app.
// `?lang=ar` or `?lang=en` can be used to preview or share a specific interface language.
function detectLocale() {
  try {
    const override = new URLSearchParams(window.location.search).get('lang');
    if (override === 'ar' || override === 'en') {
      return override;
    }
  } catch {
    // ignore malformed URLs
  }

  try {
    const langs = navigator.languages && navigator.languages.length
      ? navigator.languages
      : [navigator.language || ''];
    if (langs.some((language) => String(language).toLowerCase().startsWith('ar'))) {
      return 'ar';
    }
  } catch {
    // ignore missing navigator
  }

  return 'en';
}

export function toArabicDigits(value) {
  return String(value).replace(/\d/g, (digit) => '٠١٢٣٤٥٦٧٨٩'[Number(digit)]);
}

export const locale = ref(typeof window === 'undefined' ? 'en' : detectLocale());

if (typeof document !== 'undefined') {
  document.documentElement.setAttribute('dir', 'rtl');
  document.documentElement.setAttribute('lang', locale.value);
}

const STRINGS = {
  en: {
    appName: 'Athkār',
    howToRead: 'How to use',
    settings: 'Settings',
    done: 'Done',

    fontSizeLabel: 'Text Size',
    fontSizeHelp: 'Adjust the size of the Arabic text. You can also pinch with two fingers anywhere on the list to scale it.',
    fontSizeSmall: 'Small',
    fontSizeMedium: 'Normal',
    fontSizeLarge: 'Large',
    fontSizeXLarge: 'Extra',
    fontSizeToast: (name) => `Text size: ${name}`,

    switchToMorning: 'Switch to morning athkar',
    switchToEvening: 'Switch to evening athkar',
    morningToast: 'Morning athkar',
    eveningToast: 'Evening athkar',
    resetCounters: 'Reset counters',
    resetConfirm: 'Reset all athkar counters?',
    openRuqyah: 'Open Ruqyah',
    byline: 'by AbdurRahaman Shah',

    tapHint: 'Tap anywhere on a passage to count one recitation.',
    tapHintSunnah: 'Still count on your fingers. The Prophet ﷺ counted tasbih on his right hand and told us the fingers will be asked to speak. (Abu Dawud 1501, 1502)',
    gotIt: 'Got it',

    backToList: 'Back to list',
    openDetailsFor: (n) => `Open details for athkar ${n}`,
    countLabel: (n, current, total) => `Athkar ${n} — ${current} of ${total} recited. Tap to count one more.`,
    arabicLabel: 'Arabic',
    pronunciationLabel: 'Pronunciation',
    translationLabel: 'Translation',
    sourceLabel: 'Source',
    notFound: 'That athkar was not found.',

    installTitleIos: 'Add Athkār to Home Screen',
    installTitleOther: 'Install Athkār App',
    installBodyIos: 'Open Share, then choose Add to Home Screen.',
    installBodyOther: 'Install for quicker access and an app-like experience.',
    install: 'Install',
    notNow: 'Not now',

    howToTitle: 'How to use Athkār',
    howToIntro: 'Morning and evening adhkar are a daily practice of remembrance, gratitude, and protection. Tap any passage to count one recitation. Suggested counts are a guide: you may continue beyond them, and the counter will keep updating while you count on your fingers.',
    benefitsTitle: 'Why read morning and evening adhkar?',
    benefitsIntro: 'Morning and evening adhkar strengthen faith, protection, and gratitude throughout the day.',
    reasons: [
      {
        title: 'Fulfill the command of Allah',
        body: 'Allah commanded remembrance in these two times, and the Prophet ﷺ guided the believers to this noble practice.',
      },
      {
        title: 'Join creation in glorifying Allah',
        body: 'Morning and evening are times when creation praises Allah, and the believer joins that worship consciously.',
      },
      {
        title: "Appreciate Allah's greatness at the best times",
        body: 'These transitions between night and day are signs of Allah’s power and perfect times for dhikr.',
      },
      {
        title: 'Reaffirm tawhid and servitude',
        body: 'Through adhkar, you renew your faith, dependence on Allah, and gratitude to Him every single day.',
      },
      {
        title: 'Acquire blessings in your day',
        body: 'Starting and ending your day with remembrance brings barakah in time, effort, and outcomes.',
      },
      {
        title: 'Earn immense rewards',
        body: 'Many authentic narrations mention major rewards for morning and evening adhkar, including protection and forgiveness.',
      },
      {
        title: 'Enjoy well-being in this life and the next',
        body: 'Consistent remembrance supports spiritual calm, resilience, and well-being in dunya and akhirah.',
      },
      {
        title: 'Gain peace and contentment',
        body: 'Dhikr softens the heart and helps handle stress, worry, and difficulty with stronger faith.',
      },
      {
        title: 'Journey to Allah in these two times',
        body: 'Morning and evening are stations of devotion where the believer renews intention and connection.',
      },
      {
        title: 'Protect yourself from harm',
        body: 'By Allah’s permission, these adhkar are among the strongest means of daily spiritual protection.',
      },
    ],
    hadith: '“Whoever recites Qul Huwallahu Ahad, Qul A‘udhu bi-Rabbil-Falaq and Qul A‘udhu bi-Rabbin-Nas three times in the morning and evening, they will suffice him against everything.”',
    hadithSource: 'Reported by Abu Dawud and al-Tirmidhi.',
    fingersTitle: 'Count on your fingers',
    fingersBody: 'The Prophet ﷺ told the women: “Hold fast to tasbih, tahlil and taqdis, and count them on your fingers, for they will be questioned and made to speak.” عَلَيْكُنَّ بِالتَّسْبِيحِ وَالتَّهْلِيلِ وَالتَّقْدِيسِ، وَاعْقِدْنَ بِالْأَنَامِلِ فَإِنَّهُنَّ مَسْؤُولَاتٌ مُسْتَنْطَقَاتٌ. Narrated by Yusayrah. Abu Dawud 1501, al-Tirmidhi 3583. Counting on the fingers is the better way as taught in this hadith, so use this app to track your place and still count each dhikr on your fingers.',
    continueLabel: 'Continue',
  },

  ar: {
    appName: 'الأذكار',
    howToRead: 'طريقة الاستخدام',
    settings: 'الإعدادات',
    done: 'تم',

    fontSizeLabel: 'حجم الخط',
    fontSizeHelp: 'تعديل حجم النص العربي. يمكنك أيضًا استخدام إيماءة التكبير أو التصغير بإصبعين لتغيير الحجم.',
    fontSizeSmall: 'صغير',
    fontSizeMedium: 'متوسط',
    fontSizeLarge: 'كبير',
    fontSizeXLarge: 'كبير جدًا',
    fontSizeToast: (name) => `حجم الخط: ${name}`,

    switchToMorning: 'التبديل إلى أذكار الصباح',
    switchToEvening: 'التبديل إلى أذكار المساء',
    morningToast: 'أذكار الصباح',
    eveningToast: 'أذكار المساء',
    resetCounters: 'إعادة ضبط العدّادات',
    resetConfirm: 'هل تريد إعادة ضبط جميع عدّادات الأذكار؟',
    openRuqyah: 'فتح تطبيق الرقية',
    byline: 'بقلم عبدالرحمن شاه',

    tapHint: 'اضغط في أي مكان على السطر لعدّ قراءة واحدة.',
    tapHintSunnah: 'ومع ذلك، عُدَّ على أصابعك. كان النبي ﷺ يعقد التسبيح بيده اليمنى، وأخبر أن الأصابع ستُسأل وتَنطق. (أبو داود ١٥٠١، ١٥٠٢)',
    gotIt: 'حسنًا',

    backToList: 'العودة إلى القائمة',
    openDetailsFor: (n) => `فتح تفاصيل الذكر ${toArabicDigits(n)}`,
    countLabel: (n, current, total) => `الذكر ${toArabicDigits(n)} — ${toArabicDigits(current)} من ${toArabicDigits(total)}. اضغط لإضافة مرة.`,
    arabicLabel: 'العربية',
    pronunciationLabel: 'النطق',
    translationLabel: 'الترجمة',
    sourceLabel: 'المصدر',
    notFound: 'تعذّر العثور على هذا الذكر.',

    installTitleIos: 'أضف الأذكار إلى الشاشة الرئيسية',
    installTitleOther: 'ثبّت تطبيق الأذكار',
    installBodyIos: 'افتح قائمة المشاركة، ثم اختر «إضافة إلى الشاشة الرئيسية».',
    installBodyOther: 'ثبّت التطبيق لوصول أسرع وتجربة أشبه بالتطبيقات.',
    install: 'تثبيت',
    notNow: 'ليس الآن',

    howToTitle: 'طريقة استخدام الأذكار',
    howToIntro: 'أذكار الصباح والمساء عبادة يومية من الذكر والشكر والتحصين. اضغط على أي سطر لعدّ قراءة واحدة. الأعداد المقترحة إرشادية؛ يمكنك الاستمرار بعد بلوغها وسيواصل العداد التحديث، مع بقاء العدّ على أصابعك.',
    benefitsTitle: 'لماذا نقرأ أذكار الصباح والمساء؟',
    benefitsIntro: 'تقوّي أذكار الصباح والمساء الإيمان والتحصين والشكر طوال اليوم.',
    reasons: [
      {
        title: 'امتثال أمر الله',
        body: 'أمر الله بذكره في هذين الوقتين، وهدى النبي ﷺ المؤمنين إلى هذه العبادة العظيمة.',
      },
      {
        title: 'مشاركة الخلق في تسبيح الله',
        body: 'الصباح والمساء وقتان تسبّح فيهما المخلوقات ربها، وينضم المؤمن إلى هذه العبادة بوعي.',
      },
      {
        title: 'استحضار عظمة الله في أفضل الأوقات',
        body: 'انتقال الليل إلى النهار والنهار إلى الليل من آيات قدرة الله، وهما وقتان مناسبان للذكر.',
      },
      {
        title: 'تجديد التوحيد والعبودية',
        body: 'تجدّد الأذكار إيمانك وتوكلك على الله وشكرك له كل يوم.',
      },
      {
        title: 'تحصيل البركة في يومك',
        body: 'بدء يومك وختامه بذكر الله يجلب البركة في الوقت والجهد والنتائج.',
      },
      {
        title: 'نيل الأجور العظيمة',
        body: 'وردت أحاديث صحيحة في الأجور الكبيرة لأذكار الصباح والمساء، ومنها الحفظ والمغفرة.',
      },
      {
        title: 'صلاح الدنيا والآخرة',
        body: 'المداومة على الذكر تعين على السكينة والثبات والعافية في الدنيا والآخرة.',
      },
      {
        title: 'اكتساب السكينة والرضا',
        body: 'يليّن الذكر القلب ويعين على مواجهة القلق والهمّ والصعوبات بإيمان أقوى.',
      },
      {
        title: 'السير إلى الله في هذين الوقتين',
        body: 'الصباح والمساء محطتان للعبادة يجدّد فيهما المؤمن نيته وصلته بالله.',
      },
      {
        title: 'التحصّن من الأذى',
        body: 'بإذن الله، هذه الأذكار من أقوى أسباب التحصين اليومي.',
      },
    ],
    hadith: '«من قرأ قُلْ هُوَ اللهُ أَحَدٌ، وقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، وقُلْ أَعُوذُ بِرَبِّ النَّاسِ حين يصبح وحين يمسي ثلاث مرات، كفته من كل شيء.»',
    hadithSource: 'رواه أبو داود والترمذي.',
    fingersTitle: 'العَدُّ على الأصابع',
    fingersBody: 'قال النبي ﷺ للنساء: «عليكنَّ بالتسبيح والتهليل والتقديس، واعقدنَ بالأنامل فإنهنَّ مسؤولاتٌ مستنطقاتٌ». رواه يسيرة. أبو داود ١٥٠١، والترمذي ٣٥٨٣. العَدُّ على الأصابع هو السنة الواردة، فاستخدم التطبيق لمتابعة موضعك مع الاستمرار في عدّ كل ذكر على أصابعك.',
    continueLabel: 'متابعة',
  },
};

export function t(key, ...args) {
  const entry = STRINGS[locale.value]?.[key] ?? STRINGS.en[key];
  return typeof entry === 'function' ? entry(...args) : entry;
}
