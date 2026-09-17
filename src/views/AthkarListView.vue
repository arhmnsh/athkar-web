<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AudioPlayerBar from '../components/AudioPlayerBar.vue';
import AthkarListItem from '../components/AthkarListItem.vue';
import ConfettiOverlay from '../components/ConfettiOverlay.vue';
import { usePinchFontResize } from '../utils/pinchGesture';
import { athkarData } from '../data/athkarData';
import { audioRepetitionsPerTrackForItem, audioLabelForItem, audioTracksForItem } from '../data/audioManifest';
import {
  activeAudioItemId,
  audioCurrentTarget,
  audioHasActiveItem,
  audioIsPlaying,
  audioProgress,
  audioState,
  audioStatus,
  nextAudio,
  pauseAudio,
  playPlaylist,
  playSingle,
  previousAudio,
  restartAudio,
  resumeAudio,
  setAudioSpeed,
  stopAudio,
  syncAudioRepetition,
} from '../data/audioStore';
import { currentMode, MODE_THEME, resolveAthkarByMode } from '../data/modeStore';
import { closeTapHint, onboarding } from '../data/onboardingStore';
import { locale, t, toArabicDigits } from '../data/i18n';
import {
  getProgress,
  getReadCount,
  incrementReadCount,
  progressVersion,
  resetAllCounts,
} from '../data/progressStore';

const router = useRouter();
const showConfetti = ref(false);
const audioPanelOpen = ref(false);
let confettiTimer = null;
const LIST_SCROLL_KEY = 'athkar-list-scroll-y';
const LAST_INTERACTED_KEY = 'athkar-last-interacted-id';

function saveLastInteracted(id) {
  try {
    if (id === null) sessionStorage.removeItem(LAST_INTERACTED_KEY);
    else sessionStorage.setItem(LAST_INTERACTED_KEY, String(id));
  } catch {
    // ignore storage failures
  }
}

function loadLastInteracted() {
  try {
    const value = sessionStorage.getItem(LAST_INTERACTED_KEY);
    return value !== null && value !== '' ? Number(value) : null;
  } catch {
    return null;
  }
}

const lastInteractedItemId = ref(loadLastInteracted());

function setLastInteracted(id) {
  lastInteractedItemId.value = id;
  saveLastInteracted(id);
}

function getFirstIncompleteIndex() {
  const index = items.value.findIndex((item) => item.currentCount < item.read_count);
  return index >= 0 ? index : 0;
}

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

const audioItems = computed(() => items.value.map((item) => ({
  ...item,
  count_display: item.read_count,
  name_en: audioLabelForItem(item, 'en'),
  name_ar: audioLabelForItem(item, 'ar'),
  audioTracks: audioTracksForItem(item),
  audioRepetitions: audioRepetitionsPerTrackForItem(item),
})));
const activeAudioItem = computed(() => audioItems.value.find((item) => item.id === activeAudioItemId.value) || null);

const theme = computed(() => MODE_THEME[currentMode.value]);

const totalRecitations = computed(() => items.value.reduce(
  (total, item) => total + (Number(item.read_count) || 0),
  0,
));
const completedRecitations = computed(() => items.value.reduce(
  (total, item) => total + Math.min(Math.max(item.currentCount, 0), Number(item.read_count) || 0),
  0,
));
const overallProgress = computed(() => (
  totalRecitations.value
    ? (completedRecitations.value / totalRecitations.value) * 100
    : 0
));

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

watch(currentMode, () => {
  audioPanelOpen.value = false;
  stopAudio();
  setLastInteracted(null);
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
  audioPanelOpen.value = false;
  pauseAudio();
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
      setLastInteracted(nextAthkarId);
      const currentRow = document.querySelector(`.athkar-row[data-athkar-id="${athkar.id}"]`);
      if (currentRow) {
        anchorTop = currentRow.getBoundingClientRect().top;
      }
    } else {
      setLastInteracted(athkar.id);
    }
  } else {
    setLastInteracted(athkar.id);
  }

  incrementReadCount(athkar.id, athkar.read_count, currentMode.value);
  syncAudioRepetition();

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
  const current = getReadCount(athkar.id, currentMode.value);
  if (current >= athkar.read_count) {
    const currentIndex = items.value.findIndex((item) => item.id === athkar.id);
    if (currentIndex >= 0 && currentIndex < items.value.length - 1) {
      setLastInteracted(items.value[currentIndex + 1].id);
    } else {
      setLastInteracted(athkar.id);
    }
  } else {
    setLastInteracted(athkar.id);
  }
  router.push({ name: 'athkar-details', params: { id: athkar.id } });
}

function resetCounters() {
  const confirmed = window.confirm(t('resetConfirm'));
  if (!confirmed) {
    return;
  }
  resetAllCounts();
  stopAudio();
  setLastInteracted(null);
}

function openAudioPanel() {
  audioPanelOpen.value = true;

  if (lastInteractedItemId.value !== null) {
    const targetId = lastInteractedItemId.value;
    setLastInteracted(null);
    const index = audioItems.value.findIndex((entry) => entry.id === targetId);
    if (index >= 0) {
      playPlaylist(audioItems.value, index);
      return;
    }
  }

  if (audioHasActiveItem.value) {
    if (audioIsPlaying.value) {
      return;
    }
    if (audioStatus.value === 'complete') {
      playPlaylist(audioItems.value, getFirstIncompleteIndex());
      return;
    }
    audioState.singleMode = false;
    restartAudio({ autoplay: true });
    return;
  }

  playPlaylist(audioItems.value, getFirstIncompleteIndex());
}

function closeAudioPanel() {
  audioPanelOpen.value = false;
  pauseAudio();
  if (audioHasActiveItem.value) {
    audioState.segmentIndex = 0;
    audioState.currentTime = 0;
  }
  setLastInteracted(null);
}

function handleAudioToggle() {
  if (audioIsPlaying.value) {
    pauseAudio();
    return;
  }

  if (audioStatus.value === 'complete') {
    playPlaylist(audioItems.value, getFirstIncompleteIndex());
    return;
  }

  if (audioHasActiveItem.value) {
    resumeAudio();
    return;
  }

  playPlaylist(audioItems.value, getFirstIncompleteIndex());
}

function playItemAudio(athkar) {
  const index = audioItems.value.findIndex((entry) => entry.id === athkar.id);
  if (index < 0) return;

  audioPanelOpen.value = true;

  if (activeAudioItemId.value === athkar.id && audioIsPlaying.value) {
    pauseAudio();
    return;
  }

  if (activeAudioItemId.value === athkar.id && audioStatus.value === 'paused') {
    resumeAudio();
    return;
  }

  playSingle(audioItems.value, index);
}

</script>

<template>
  <section>
    <div class="overall-progress-edge" role="progressbar" :aria-label="t('progressLabel')" aria-valuemin="0" aria-valuemax="100" :aria-valuenow="overallProgress">
      <i :style="{ width: `${overallProgress}%` }" />
      <span aria-live="polite">{{ locale === 'ar' ? `${toArabicDigits(completedRecitations)} / ${toArabicDigits(totalRecitations)}` : `${completedRecitations} / ${totalRecitations}` }}</span>
    </div>
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
        :audio-active="activeAudioItemId === athkar.id"
        :audio-playing="activeAudioItemId === athkar.id && audioIsPlaying"
        @increment="handleIncrement(athkar)"
        @details="openDetails(athkar)"
        @audio="playItemAudio(athkar)"
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
    <AudioPlayerBar
      :item="activeAudioItem || audioItems[0]"
      :expanded="audioPanelOpen"
      :repeat="audioState.repetitionIndex + 1"
      :target="audioCurrentTarget"
      :status="audioStatus"
      :speed="audioState.speed"
      :progress="audioProgress"
      @open="openAudioPanel"
      @close="closeAudioPanel"
      @toggle="handleAudioToggle"
      @previous="previousAudio"
      @next="nextAudio"
      @speed="setAudioSpeed"
    />
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
