<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { athkarData } from '../data/athkarData';
import { currentMode, resolveAthkarByMode } from '../data/modeStore';
import { getProgress, getReadCount, progressVersion } from '../data/progressStore';

const route = useRoute();
const router = useRouter();

const athkar = computed(() => {
  const id = Number(route.params.id);
  const matched = athkarData.find((item) => item.id === id) || null;
  if (!matched) {
    return null;
  }
  return resolveAthkarByMode(matched, currentMode.value);
});

const currentCount = computed(() => {
  progressVersion.value;
  if (!athkar.value) {
    return 0;
  }
  return getReadCount(athkar.value.id, currentMode.value);
});

const progress = computed(() => {
  progressVersion.value;
  if (!athkar.value) {
    return 0;
  }
  return getProgress(athkar.value.id, athkar.value.read_count, currentMode.value);
});
</script>

<template>
  <section v-if="athkar" class="details-wrap">
    <div class="details-shell">
      <button class="back-btn" type="button" @click="router.push('/')">Back to list</button>

      <div class="details-progress">
        <div class="details-progress-fill" :style="{ width: `${progress}%` }" />
        <span>{{ currentCount }} / {{ athkar.read_count }} complete</span>
      </div>

      <article class="details-card">
        <section class="details-section">
          <h2 class="details-label">Arabic</h2>
          <p class="arabic-block">{{ athkar.athkar_ar_display }}</p>
        </section>

        <section class="details-section">
          <h3 class="details-label">Pronunciation</h3>
          <p class="latin-block">{{ athkar.athkar_transliteration_en_display }}</p>
        </section>

        <section class="details-section">
          <h3 class="details-label">Translation</h3>
          <p class="translation-block">{{ athkar.athkar_en_display }}</p>
        </section>

        <section class="details-section source">
          <h3 class="details-label">Source</h3>
          <p class="source-block">{{ athkar.reference_en }}</p>
        </section>
      </article>
    </div>
  </section>
  <section v-else class="details-wrap">
    <div class="details-shell">
      <button class="back-btn" type="button" @click="router.push('/')">Back to list</button>
      <p>That athkar was not found.</p>
    </div>
  </section>
</template>
