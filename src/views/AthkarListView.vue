<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
  saveListScroll();
  if (confettiTimer) {
    clearTimeout(confettiTimer);
  }
});

onMounted(() => {
  restoreListScroll();
});

function handleIncrement(athkar) {
  incrementReadCount(athkar.id, athkar.read_count, currentMode.value);
}

function openDetails(athkar) {
  saveListScroll();
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
