<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import AthkarListItem from '../components/AthkarListItem.vue';
import { athkarData } from '../data/athkarData';
import { getProgress, getReadCount, incrementReadCount } from '../data/progressStore';

const router = useRouter();
const refreshToken = ref(0);

const items = computed(() => {
  refreshToken.value;
  return athkarData.map((athkar) => ({
    ...athkar,
    currentCount: getReadCount(athkar.id),
    progress: getProgress(athkar.id, athkar.read_count),
  }));
});

function handleIncrement(athkar) {
  incrementReadCount(athkar.id, athkar.read_count);
  refreshToken.value += 1;
}

function openDetails(athkar) {
  router.push({ name: 'athkar-details', params: { id: athkar.id } });
}
</script>

<template>
  <section class="list-wrap">
    <AthkarListItem
      v-for="athkar in items"
      :key="athkar.id"
      :athkar="athkar"
      :current-count="athkar.currentCount"
      :progress="athkar.progress"
      @increment="handleIncrement(athkar)"
      @details="openDetails(athkar)"
    />
  </section>
</template>
