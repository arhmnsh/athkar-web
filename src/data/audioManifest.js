export const AUDIO_RECITER = 'Mishary Rashid Alafasy';
export const AUDIO_SOURCE_LABEL = 'Mishary Alafasy · offline audio';

export const LOCAL_AUDIO_BASE = '/audio';
const LOCAL_QURAN_BASE = `${LOCAL_AUDIO_BASE}/quran`;
const LOCAL_ATHKAR_BASE = `${LOCAL_AUDIO_BASE}/athkar`;
const REMOTE_QURAN_BASE = 'https://everyayah.com/data/Alafasy_128kbps';
const REMOTE_ATHKAR_BASE = 'https://archive.org/download/azkar-al-sabah-1425';
const REMOTE_RUQYAH_BASE = 'https://archive.org/download/ruqia-alafasy';

const QURAN_AUDIO = Object.freeze({
  1: { surah: 112, from: 1, to: 4 },
  2: { surah: 113, from: 1, to: 5 },
  3: { surah: 114, from: 1, to: 6 },
});

// These files are the corresponding Mishary Alafasy tracks from the public morning-athkar
// collection. The item ids follow athkarData.js, so the player never has to infer a track from
// visible text.
const ATHKAR_AUDIO = Object.freeze({
  0: { file: '1.mp3', label_en: 'Āyat al-Kursī', label_ar: 'آية الكرسي' },
  4: { file: '18.mp3', label_en: 'Tahlīl', label_ar: 'التهليل' },
  5: { file: '19.mp3', label_en: 'Tasbīḥ of creation', label_ar: 'تسبيح بعدد الخلق' },
  6: { file: '22.mp3', label_en: 'Salawāt', label_ar: 'الصلاة على النبي' },
  7: { file: '3.mp3', label_en: 'Entering the morning', label_ar: 'أصبحنا وأصبح الملك لله' },
  8: { file: '4.mp3', label_en: 'By You we enter the morning', label_ar: 'اللهم بك أصبحنا' },
  9: { file: '5.mp3', label_en: 'Sayyid al-Istighfār', label_ar: 'سيد الاستغفار' },
  10: { file: '6.mp3', label_en: 'Witnessing Allah’s oneness', label_ar: 'الإشهاد بالتوحيد' },
  11: { file: '7.mp3', label_en: 'Every blessing is from You', label_ar: 'ما أصبح بي من نعمة' },
  12: { file: '8.mp3', label_en: 'Wellbeing in body and senses', label_ar: 'العافية في البدن والحواس' },
  13: { file: '9.mp3', label_en: 'Hasbi Allah', label_ar: 'حسبي الله' },
  14: { file: '10.mp3', label_en: 'Forgiveness and wellbeing', label_ar: 'العفو والعافية' },
  15: { file: '11.mp3', label_en: 'Knower of the unseen', label_ar: 'عالم الغيب والشهادة' },
  16: { file: '12.mp3', label_en: 'In the name of Allah', label_ar: 'بسم الله الذي لا يضر' },
  17: { file: '13.mp3', label_en: 'Content with Allah', label_ar: 'رضيت بالله ربًا' },
  18: { file: '14.mp3', label_en: 'Yā Ḥayyu Yā Qayyūm', label_ar: 'يا حي يا قيوم' },
  19: { file: '15.mp3', label_en: 'The good of this day', label_ar: 'خير هذا اليوم' },
  20: { file: '16.mp3', label_en: 'The natural religion of Islam', label_ar: 'فطرة الإسلام' },
  21: { file: '17.mp3', label_en: 'Tasbīḥ', label_ar: 'سبحان الله وبحمده' },
  22: { file: '20.mp3', label_en: 'Beneficial knowledge', label_ar: 'علمًا نافعًا' },
  23: { file: '21.mp3', label_en: 'Seeking forgiveness', label_ar: 'الاستغفار' },
  24: { file: '24.mp3', label_en: 'Allah’s perfect words', label_ar: 'كلمات الله التامات' },
});

function padded(value) {
  return String(value).padStart(3, '0');
}

function quranTracks(passage, base) {
  if (!passage) return [];
  return Array.from({ length: passage.to - passage.from + 1 }, (_, offset) => {
    const ayah = passage.from + offset;
    return `${base}/${padded(passage.surah)}${padded(ayah)}.mp3`;
  });
}

export function audioTracksForItem(item) {
  const quran = QURAN_AUDIO[item?.id];
  if (quran) return quranTracks(quran, LOCAL_QURAN_BASE);

  const audio = ATHKAR_AUDIO[item?.id];
  if (!audio) return [];
  return [`${LOCAL_ATHKAR_BASE}/${audio.file}`];
}

export function audioRepetitionsPerTrackForItem() {
  // One complete track or Quran passage is one recitation. The audio store repeats it until the
  // item’s suggested count has been reached.
  return 1;
}

export function audioLabelForItem(item, language = 'en') {
  const quranLabels = {
    1: { en: 'Al-Ikhlāṣ', ar: 'سورة الإخلاص' },
    2: { en: 'Al-Falaq', ar: 'سورة الفلق' },
    3: { en: 'An-Nās', ar: 'سورة الناس' },
  };
  const label = quranLabels[item?.id] || ATHKAR_AUDIO[item?.id];
  return language === 'ar'
    ? label?.ar || label?.label_ar || label?.label_en || `Athkar ${Number(item?.id || 0) + 1}`
    : label?.en || label?.label_en || label?.label_ar || `Athkar ${Number(item?.id || 0) + 1}`;
}

export function audioDownloadEntriesForItem(item) {
  const quran = QURAN_AUDIO[item?.id];
  if (quran) {
    const local = quranTracks(quran, LOCAL_QURAN_BASE);
    const remote = quranTracks(quran, REMOTE_QURAN_BASE);
    return local.map((localPath, index) => ({ local: localPath, remote: remote[index] }));
  }

  const audio = ATHKAR_AUDIO[item?.id];
  if (!audio) return [];
  const remoteBase = item.id === 24 ? REMOTE_RUQYAH_BASE : REMOTE_ATHKAR_BASE;
  const remoteFile = item.id === 24 ? 'al-ruqia-5.mp3' : `8-azkar-al-sabah-1425-${audio.file}`;
  return [{
    local: `${LOCAL_ATHKAR_BASE}/${audio.file}`,
    remote: `${remoteBase}/${remoteFile}`,
  }];
}
