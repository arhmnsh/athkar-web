import { ref } from 'vue';
import { markUsage } from './progressStore';

export const MORNING_MODE = 'morning';
export const EVENING_MODE = 'evening';

const MORNING_START_HOUR = 5;
const EVENING_START_HOUR = 12;

export const MODE_THEME = {
  [MORNING_MODE]: {
    appTop: '#203239',
    appBottom: '#2b4246',
    topbar: '#17272d',
    chrome: '#17272d',
    rowHue: [190, 182],
    rowSaturation: 24,
    rowLightness: [21, 25],
  },
  [EVENING_MODE]: {
    appTop: '#1b2a35',
    appBottom: '#263944',
    topbar: '#15232d',
    chrome: '#15232d',
    rowHue: [205, 214],
    rowSaturation: 24,
    rowLightness: [19, 23],
  },
};

export function inferModeFromTime(date = new Date()) {
  const hour = date.getHours();
  if (hour >= MORNING_START_HOUR && hour < EVENING_START_HOUR) {
    return MORNING_MODE;
  }
  return EVENING_MODE;
}

export const currentMode = ref(inferModeFromTime());

function ensureMetaTag(name) {
  const existing = document.querySelector(`meta[name="${name}"]`);
  if (existing) {
    return existing;
  }
  const created = document.createElement('meta');
  created.setAttribute('name', name);
  document.head.appendChild(created);
  return created;
}

function applyModeTheme(mode) {
  if (typeof document === 'undefined') {
    return;
  }
  const theme = MODE_THEME[mode] || MODE_THEME[MORNING_MODE];
  const root = document.documentElement;
  root.style.setProperty('--app-bg-top', theme.appTop);
  root.style.setProperty('--app-bg-bottom', theme.appBottom);
  root.style.setProperty('--topbar-bg', theme.topbar);

  const themeColorMeta = ensureMetaTag('theme-color');
  themeColorMeta.setAttribute('content', theme.chrome);

  const appleBarMeta = ensureMetaTag('apple-mobile-web-app-status-bar-style');
  appleBarMeta.setAttribute('content', 'default');
}

export function setMode(nextMode) {
  if (nextMode !== MORNING_MODE && nextMode !== EVENING_MODE) {
    return;
  }
  if (nextMode === currentMode.value) {
    return;
  }
  currentMode.value = nextMode;
  applyModeTheme(nextMode);
  markUsage();
}

export function resolveAthkarByMode(athkar, mode) {
  const useEveningVariant = mode === EVENING_MODE;
  return {
    ...athkar,
    athkar_ar_display:
      useEveningVariant && athkar.athkar_ar_evening
        ? athkar.athkar_ar_evening
        : athkar.athkar_ar,
    athkar_transliteration_en_display:
      useEveningVariant && athkar.athkar_transliteration_en_evening
        ? athkar.athkar_transliteration_en_evening
        : athkar.athkar_transliteration_en,
    athkar_en_display:
      useEveningVariant && athkar.athkar_en_evening
        ? athkar.athkar_en_evening
        : athkar.athkar_en,
  };
}

applyModeTheme(currentMode.value);
