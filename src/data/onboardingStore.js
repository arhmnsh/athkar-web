import { reactive } from 'vue';

const BENEFITS_SEEN_KEY = 'athkar-benefits-seen-v1';
const TAP_HINT_SEEN_KEY = 'athkar-taphint-seen-v1';

function seen(key) {
  try {
    return localStorage.getItem(key) === '1';
  } catch {
    return false;
  }
}

function markSeen(key) {
  try {
    localStorage.setItem(key, '1');
  } catch {
    // ignore storage failures
  }
}

export const onboarding = reactive({
  howToOpen: false,
  tapHintOpen: false,
});

export function startOnboarding() {
  if (!seen(BENEFITS_SEEN_KEY)) {
    onboarding.howToOpen = true;
  } else if (!seen(TAP_HINT_SEEN_KEY)) {
    onboarding.tapHintOpen = true;
  }
}

export function openHowTo() {
  onboarding.howToOpen = true;
}

export function closeHowTo() {
  const firstRun = !seen(BENEFITS_SEEN_KEY);
  markSeen(BENEFITS_SEEN_KEY);
  onboarding.howToOpen = false;

  if (firstRun && !seen(TAP_HINT_SEEN_KEY)) {
    onboarding.tapHintOpen = true;
  }
}

export function closeTapHint() {
  markSeen(TAP_HINT_SEEN_KEY);
  onboarding.tapHintOpen = false;
}
