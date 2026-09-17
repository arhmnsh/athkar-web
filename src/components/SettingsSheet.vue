<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';

import { locale, t } from '../data/i18n';
import {
  FONT_SIZE_LARGE,
  FONT_SIZE_MEDIUM,
  FONT_SIZE_SMALL,
  FONT_SIZE_XLARGE,
  setFontSize,
  settings,
} from '../data/settingsStore';

const props = defineProps({
  open: { type: Boolean, required: true },
});

const emit = defineEmits(['close']);

const fontSizes = computed(() => [
  { value: FONT_SIZE_SMALL, label: t('fontSizeSmall'), help: 'A-' },
  { value: FONT_SIZE_MEDIUM, label: t('fontSizeMedium'), help: 'A' },
  { value: FONT_SIZE_LARGE, label: t('fontSizeLarge'), help: 'A+' },
  { value: FONT_SIZE_XLARGE, label: t('fontSizeXLarge'), help: 'A++' },
]);

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Transition name="sheet-slide">
    <div v-if="props.open" class="sheet-backdrop" @click.self="emit('close')">
      <section
        class="sheet"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
        role="dialog"
        aria-modal="true"
        :aria-label="t('settings')"
      >
        <div class="sheet-handle" aria-hidden="true" />
        <div class="sheet-head">
          <h2>{{ t('settings') }}</h2>
          <button class="sheet-close" type="button" @click="emit('close')">{{ t('done') }}</button>
        </div>

        <div class="setting">
          <p class="setting-label">{{ t('fontSizeLabel') }}</p>
          <p class="setting-help">{{ t('fontSizeHelp') }}</p>
          <div class="segmented" role="group" :aria-label="t('fontSizeLabel')">
            <button
              v-for="option in fontSizes"
              :key="option.value"
              type="button"
              :aria-pressed="settings.fontSize === option.value"
              @click="setFontSize(option.value)"
            >
              {{ option.label }}
              <small>{{ option.help }}</small>
            </button>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>
