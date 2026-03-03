<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useRouter } from 'vue-router';

import AthkarListItem from '../components/AthkarListItem.vue';
import ConfettiOverlay from '../components/ConfettiOverlay.vue';
import { athkarData } from '../data/athkarData';
import { currentMode, resolveAthkarByMode } from '../data/modeStore';
import {
  getProgress,
  getReadCount,
  incrementReadCount,
  progressVersion,
} from '../data/progressStore';

const router = useRouter();
const showConfetti = ref(false);
let confettiTimer = null;

const items = computed(() => {
  progressVersion.value;
  return athkarData.map((athkar) => ({
    ...resolveAthkarByMode(athkar, currentMode.value),
    currentCount: getReadCount(athkar.id, currentMode.value),
    progress: getProgress(athkar.id, athkar.read_count, currentMode.value),
  }));
});

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

onBeforeUnmount(() => {
  if (confettiTimer) {
    clearTimeout(confettiTimer);
  }
});

function handleIncrement(athkar) {
  incrementReadCount(athkar.id, athkar.read_count, currentMode.value);
}

function openDetails(athkar) {
  router.push({ name: 'athkar-details', params: { id: athkar.id } });
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
        @increment="handleIncrement(athkar)"
        @details="openDetails(athkar)"
      />
    </div>
    <ConfettiOverlay :visible="showConfetti" />
  </section>
</template>
