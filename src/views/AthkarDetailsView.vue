<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import { athkarData } from '../data/athkarData';
import { getProgress, getReadCount } from '../data/progressStore';

const route = useRoute();
const router = useRouter();

const athkar = computed(() => {
  const id = Number(route.params.id);
  return athkarData.find((item) => item.id === id) || null;
});

const currentCount = computed(() => {
  if (!athkar.value) {
    return 0;
  }
  return getReadCount(athkar.value.id);
});

const progress = computed(() => {
  if (!athkar.value) {
    return 0;
  }
  return getProgress(athkar.value.id, athkar.value.read_count);
});
</script>

<template>
  <section v-if="athkar" class="details-wrap">
    <button class="back-btn" type="button" @click="router.push('/')">Back to list</button>

    <div class="details-progress">
      <div class="details-progress-fill" :style="{ width: `${progress}%` }" />
      <span>{{ currentCount }} / {{ athkar.read_count }} complete</span>
    </div>

    <article class="details-card">
      <h2>Arabic</h2>
      <p class="arabic-block">{{ athkar.athkar_ar }}</p>

      <template v-if="athkar.athkar_ar_evening">
        <h3>Arabic (Evening)</h3>
        <p class="arabic-block">{{ athkar.athkar_ar_evening }}</p>
      </template>

      <h3>Pronunciation</h3>
      <p>{{ athkar.athkar_transliteration_en }}</p>

      <template v-if="athkar.athkar_transliteration_en_evening">
        <h3>Pronunciation (Evening)</h3>
        <p>{{ athkar.athkar_transliteration_en_evening }}</p>
      </template>

      <h3>Translation</h3>
      <p>{{ athkar.athkar_en }}</p>

      <template v-if="athkar.athkar_en_evening">
        <h3>Translation (Evening)</h3>
        <p>{{ athkar.athkar_en_evening }}</p>
      </template>

      <h3>Source</h3>
      <p>{{ athkar.reference_en }}</p>
    </article>
  </section>
  <section v-else class="details-wrap">
    <button class="back-btn" type="button" @click="router.push('/')">Back to list</button>
    <p>That athkar was not found.</p>
  </section>
</template>
