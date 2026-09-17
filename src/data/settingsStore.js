import { reactive, watch } from 'vue';

// Preferences that survive reloads. For now that is only how large the Arabic passages are drawn;
// the mode (morning/evening) lives in modeStore because it also changes which athkar are shown.
export const FONT_SIZE_SMALL = 'small';
export const FONT_SIZE_MEDIUM = 'medium';
export const FONT_SIZE_LARGE = 'large';
export const FONT_SIZE_XLARGE = 'xlarge';

export const FONT_SIZES = [FONT_SIZE_SMALL, FONT_SIZE_MEDIUM, FONT_SIZE_LARGE, FONT_SIZE_XLARGE];

const STORAGE_KEY = 'athkar-settings-v1';
const DEFAULTS = { fontSize: FONT_SIZE_MEDIUM };

// The size is applied as an attribute on <html> rather than a class on the app root so that the
// --arabic-font-size token resolves for anything rendered outside the shell (sheets, overlays).
function applyFontSizeToDom(size) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-font-size', size);
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const fontSize = FONT_SIZES.includes(parsed?.fontSize) ? parsed.fontSize : DEFAULTS.fontSize;
    applyFontSizeToDom(fontSize);
    return { fontSize };
  } catch {
    applyFontSizeToDom(DEFAULTS.fontSize);
    return { ...DEFAULTS };
  }
}

export const settings = reactive(load());

watch(
  () => ({ fontSize: settings.fontSize }),
  (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch {
      // ignore storage failures
    }
    applyFontSizeToDom(value.fontSize);
  },
);

export function setFontSize(size) {
  if (FONT_SIZES.includes(size)) {
    settings.fontSize = size;
    applyFontSizeToDom(size);
  }
}

// Used by the pinch gesture: step one size up (+1) or down (-1) and clamp at the ends, returning
// whichever size is now in effect so the caller can name it in a toast.
export function cycleFontSize(direction) {
  const currentIndex = FONT_SIZES.indexOf(settings.fontSize);
  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), FONT_SIZES.length - 1);
  if (nextIndex !== currentIndex) {
    setFontSize(FONT_SIZES[nextIndex]);
    return FONT_SIZES[nextIndex];
  }
  return settings.fontSize;
}
