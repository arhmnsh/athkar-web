<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AthkarListItem from '../components/AthkarListItem.vue';
import ConfettiOverlay from '../components/ConfettiOverlay.vue';
import { usePinchFontResize } from '../utils/pinchGesture';
import { athkarData } from '../data/athkarData';
import { currentMode, MODE_THEME, resolveAthkarByMode } from '../data/modeStore';
import { closeTapHint, onboarding } from '../data/onboardingStore';
import { locale, t } from '../data/i18n';
import {
  getProgress,
  getReadCount,
  incrementReadCount,
  progressVersion,
  resetAllCounts,
} from '../data/progressStore';

const router = useRouter();
const showConfetti = ref(false);
let confettiTimer = null;
const LIST_SCROLL_KEY = 'athkar-list-scroll-y';

function saveListScroll() {
  try {
    sessionStorage.setItem(LIST_SCROLL_KEY, String(window.scrollY || 0));
  } catch {
    // ignore storage failures
  }
}

function restoreListScroll() {
  try {
    const raw = sessionStorage.getItem(LIST_SCROLL_KEY);
    if (!raw) {
      return;
    }
    const y = Number(raw);
    if (!Number.isFinite(y) || y <= 0) {
      return;
    }
    requestAnimationFrame(() => {
      window.scrollTo({ top: y, behavior: 'auto' });
    });
  } catch {
    // ignore storage failures
  }
}

const items = computed(() => {
  progressVersion.value;
  return athkarData.map((athkar) => ({
    ...resolveAthkarByMode(athkar, currentMode.value),
    currentCount: getReadCount(athkar.id, currentMode.value),
    progress: getProgress(athkar.id, athkar.read_count, currentMode.value),
  }));
});

const theme = computed(() => MODE_THEME[currentMode.value]);

const allCompleted = computed(
  () => items.value.length > 0 && items.value.every((item) => item.currentCount >= item.read_count),
);

watch(allCompleted, (next, prev) => {
  if (!prev && next) {
    showConfetti.value = true;
    if (confettiTimer) {
      clearTimeout(confettiTimer);
    }
    confettiTimer = setTimeout(() => {
      showConfetti.value = false;
      confettiTimer = null;
    }, 3200);
  }
});

const fontToastVisible = ref(false);
const fontToastText = ref('');
let fontToastTimer = null;
let cleanupPinch = null;

function onFontChange(size) {
  const sizeMap = {
    small: t('fontSizeSmall'),
    medium: t('fontSizeMedium'),
    large: t('fontSizeLarge'),
    xlarge: t('fontSizeXLarge'),
  };
  fontToastText.value = t('fontSizeToast', sizeMap[size] || size);
  fontToastVisible.value = true;
  if (fontToastTimer) clearTimeout(fontToastTimer);
  fontToastTimer = setTimeout(() => {
    fontToastVisible.value = false;
    fontToastTimer = null;
  }, 1600);
}

onBeforeUnmount(() => {
  if (cleanupPinch) cleanupPinch();
  if (fontToastTimer) clearTimeout(fontToastTimer);
  saveListScroll();
  if (confettiTimer) {
    clearTimeout(confettiTimer);
  }
});

onMounted(() => {
  restoreListScroll();
  cleanupPinch = usePinchFontResize(window, onFontChange);
});

function handleIncrement(athkar) {
  const currentCount = getReadCount(athkar.id, currentMode.value);
  const willCompleteThisTap = currentCount < athkar.read_count && currentCount + 1 >= athkar.read_count;

  let anchorTop = null;
  let nextAthkarId = null;

  if (willCompleteThisTap) {
    const currentIndex = items.value.findIndex((item) => item.id === athkar.id);
    if (currentIndex >= 0 && currentIndex < items.value.length - 1) {
      nextAthkarId = items.value[currentIndex + 1].id;
      const currentRow = document.querySelector(`.athkar-row[data-athkar-id="${athkar.id}"]`);
      if (currentRow) {
        anchorTop = currentRow.getBoundingClientRect().top;
      }
    }
  }

  incrementReadCount(athkar.id, athkar.read_count, currentMode.value);

  if (willCompleteThisTap && anchorTop !== null && nextAthkarId !== null) {
    nextTick(() => {
      requestAnimationFrame(() => {
        const nextRow = document.querySelector(`.athkar-row[data-athkar-id="${nextAthkarId}"]`);
        if (!nextRow) {
          return;
        }
        const delta = nextRow.getBoundingClientRect().top - anchorTop;
        if (Math.abs(delta) < 1) {
          return;
        }
        window.scrollBy({ top: delta, behavior: 'smooth' });
        saveListScroll();
      });
    });
  }
}

function openDetails(athkar) {
  saveListScroll();
  router.push({ name: 'athkar-details', params: { id: athkar.id } });
}

function resetCounters() {
  const confirmed = window.confirm(t('resetConfirm'));
  if (!confirmed) {
    return;
  }
  resetAllCounts();
}

</script>

<template>
  <section>
    <div class="list-wrap">
      <AthkarListItem
        v-for="(athkar, index) in items"
        :key="athkar.id"
        :athkar="athkar"
        :index="index"
        :total="items.length"
        :current-count="athkar.currentCount"
        :progress="athkar.progress"
        :theme="theme"
        @increment="handleIncrement(athkar)"
        @details="openDetails(athkar)"
      />
    </div>
    <footer class="list-footer">
      <button class="reset-btn" type="button" @click="resetCounters">{{ t('resetCounters') }}</button>
      <a class="app-link-btn" href="https://ruqyah.arhmn.sh/">{{ t('openRuqyah') }}</a>
      <div class="byline-wrap">
        <a class="app-byline name" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">
          {{ t('byline') }}
        </a>
        <a class="app-byline site" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">
          arhmn.sh
        </a>
      </div>
    </footer>
    <ConfettiOverlay :visible="showConfetti" />

    <transition name="overlay-fade">
      <div
        v-if="onboarding.tapHintOpen"
        class="tap-hint-overlay"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
        @click="closeTapHint"
      >
        <div class="tap-hint-demo" aria-hidden="true">
          <div class="tap-row-shadow" />
          <div class="tap-finger">👆</div>
        </div>
        <p>{{ t('tapHint') }}</p>
        <p class="tap-hint-sunnah">{{ t('tapHintSunnah') }}</p>
        <button type="button" class="tap-hint-close">{{ t('gotIt') }}</button>
      </div>
    </transition>

    <transition name="mode-toast">
      <div v-if="fontToastVisible" class="mode-toast font-toast" role="status" aria-live="polite">
        {{ fontToastText }}
      </div>
    </transition>
  </section>
</template>
