<script setup>
import { computed } from 'vue';

import { locale, t, toArabicDigits } from '../data/i18n';

const props = defineProps({
  athkar: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  currentCount: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
  theme: {
    type: Object,
    required: true,
  },
  audioActive: {
    type: Boolean,
    default: false,
  },
  audioPlaying: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['increment', 'details', 'audio']);

const rowStyle = computed(() => {
  const steps = Math.max(props.total - 1, 1);
  const ratio = props.index / steps;
  const [hueFrom, hueTo] = props.theme.rowHue;
  const [lightFrom, lightTo] = props.theme.rowLightness;
  const hue = Math.round(hueFrom + (hueTo - hueFrom) * ratio);
  const light = lightFrom + (lightTo - lightFrom) * ratio;
  const sat = props.theme.rowSaturation;
  return {
    '--row-top': `hsl(${hue}, ${sat}%, ${(light + 2).toFixed(1)}%)`,
    '--row-bottom': `hsl(${hue + 2}, ${sat - 3}%, ${(light - 2).toFixed(1)}%)`,
  };
});

const isComplete = computed(() => props.progress >= 100);
</script>

<template>
  <article
    class="athkar-row"
    :class="{ 'is-complete': isComplete }"
    :style="rowStyle"
    :data-athkar-id="athkar.id"
  >
    <div class="progress-fill" :style="{ width: `${progress}%` }" />
    <aside class="side-rail">
      <div class="side-actions">
        <button
          class="audio-row-btn"
          :class="{ 'is-active': audioActive, 'is-playing': audioPlaying }"
          type="button"
          :aria-label="audioPlaying ? t('pauseAudio') : t('playAudio')"
          :aria-pressed="audioActive"
          @click="emit('audio')"
        >
          <svg v-if="audioPlaying" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
          </svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true">
            <path d="m8 5 11 7-11 7V5Z" />
          </svg>
        </button>
        <button
          class="details-hit"
          type="button"
          :aria-label="t('openDetailsFor', athkar.id + 1)"
          @click="emit('details')"
        >
          <svg class="details-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="details-icon-ring" cx="12" cy="12" r="8.5" />
            <path d="M12 11v5" />
            <circle class="details-icon-dot" cx="12" cy="8" r="1.1" />
          </svg>
        </button>
      </div>
      <p class="side-counter" aria-hidden="true">{{ locale === 'ar' ? `${toArabicDigits(currentCount)} / ${toArabicDigits(athkar.read_count)}` : `${currentCount} / ${athkar.read_count}` }}</p>
    </aside>
    <button
      class="body-hit"
      type="button"
      :aria-label="t('countLabel', athkar.id + 1, currentCount, athkar.read_count)"
      @click="emit('increment')"
    >
      <p class="arabic notranslate" lang="ar" dir="rtl" translate="no">{{ athkar.athkar_ar_display }}</p>
    </button>
  </article>
</template>
