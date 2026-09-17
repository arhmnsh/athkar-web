<script setup>
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { athkarData } from '../data/athkarData';
import { locale, t } from '../data/i18n';
import { currentMode, resolveAthkarByMode } from '../data/modeStore';

const route = useRoute();
const router = useRouter();

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    router.push('/');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const athkar = computed(() => {
  const id = Number(route.params.id);
  const matched = athkarData.find((item) => item.id === id) || null;
  if (!matched) {
    return null;
  }
  return resolveAthkarByMode(matched, currentMode.value);
});

</script>

<template>
  <section v-if="athkar" class="details-wrap">
    <div class="details-shell" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
      <button class="back-icon-btn" type="button" :aria-label="t('backToList')" @click="router.push('/')">
        <span aria-hidden="true">❮</span>
      </button>

      <section class="details-section">
        <h2 class="details-label">{{ t('arabicLabel') }}</h2>
        <p class="arabic-block notranslate" lang="ar" dir="rtl" translate="no">{{ athkar.athkar_ar_display }}</p>
      </section>

      <section class="details-section">
        <h3 class="details-label">{{ t('pronunciationLabel') }}</h3>
        <p class="latin-block">{{ athkar.athkar_transliteration_en_display }}</p>
      </section>

      <section class="details-section">
        <h3 class="details-label">{{ t('translationLabel') }}</h3>
        <p class="translation-block">{{ athkar.athkar_en_display }}</p>
      </section>

      <section class="details-section source">
        <h3 class="details-label">{{ t('sourceLabel') }}</h3>
        <p class="source-block">{{ athkar.reference_en }}</p>
      </section>
    </div>
  </section>
  <section v-else class="details-wrap">
    <div class="details-shell" :dir="locale === 'ar' ? 'rtl' : 'ltr'">
      <button class="back-icon-btn" type="button" :aria-label="t('backToList')" @click="router.push('/')">
        <span aria-hidden="true">❮</span>
      </button>
      <p>{{ t('notFound') }}</p>
    </div>
  </section>
</template>
