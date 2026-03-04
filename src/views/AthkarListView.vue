<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
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
  const confirmed = window.confirm('Reset all athkar counters?');
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
        @increment="handleIncrement(athkar)"
        @details="openDetails(athkar)"
      />
    </div>
    <footer class="list-footer">
      <button class="reset-btn" type="button" @click="resetCounters">Reset counters</button>
      <div class="byline-wrap">
        <a class="app-byline name" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">
          by AbdurRahaman Shah
        </a>
        <a class="app-byline site" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">
          arhmn.sh
        </a>
      </div>
    </footer>
    <ConfettiOverlay :visible="showConfetti" />
  </section>
</template>
