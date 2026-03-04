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
const showBenefitsModal = ref(false);
const showTapHintOverlay = ref(false);
let confettiTimer = null;
const LIST_SCROLL_KEY = 'athkar-list-scroll-y';
const BENEFITS_SEEN_KEY = 'athkar-benefits-seen-v1';
const TAP_HINT_SEEN_KEY = 'athkar-taphint-seen-v1';

const benefits = [
  {
    title: 'Fulfill the command of Allah',
    body: 'Allah commanded remembrance in these two times, and the Prophet ﷺ guided the believers to this noble practice.',
  },
  {
    title: 'Join creation in glorifying Allah',
    body: 'Morning and evening are times when creation praises Allah, and the believer joins that worship consciously.',
  },
  {
    title: "Appreciate Allah's greatness at the best times",
    body: 'These transitions between night and day are signs of Allah’s power and perfect times for dhikr.',
  },
  {
    title: 'Reaffirm tawhid and servitude',
    body: 'Through adhkar, you renew your faith, dependence on Allah, and gratitude to Him every single day.',
  },
  {
    title: 'Acquire blessings in your day',
    body: 'Starting and ending your day with remembrance brings barakah in time, effort, and outcomes.',
  },
  {
    title: 'Earn immense rewards',
    body: 'Many authentic narrations mention major rewards for morning/evening adhkar, including protection and forgiveness.',
  },
  {
    title: 'Enjoy well-being in this life and the next',
    body: 'Consistent remembrance supports spiritual calm, resilience, and well-being in dunya and akhirah.',
  },
  {
    title: 'Gain peace and contentment',
    body: 'Dhikr softens the heart and helps handle stress, worry, and difficulty with stronger faith.',
  },
  {
    title: 'Journey to Allah in these two times',
    body: 'Morning and evening are stations of devotion where the believer renews intention and connection.',
  },
  {
    title: 'Protect yourself from harm',
    body: 'By Allah’s permission, these adhkar are among the strongest means of daily spiritual protection.',
  },
];

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
  try {
    const hasSeenBenefits = localStorage.getItem(BENEFITS_SEEN_KEY) === '1';
    const hasSeenHint = localStorage.getItem(TAP_HINT_SEEN_KEY) === '1';
    showBenefitsModal.value = !hasSeenBenefits;
    showTapHintOverlay.value = hasSeenBenefits && !hasSeenHint;
  } catch {
    showBenefitsModal.value = true;
    showTapHintOverlay.value = false;
  }
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

function closeBenefitsModal() {
  showBenefitsModal.value = false;
  try {
    localStorage.setItem(BENEFITS_SEEN_KEY, '1');
  } catch {
    // ignore storage failures
  }
  try {
    const hasSeenHint = localStorage.getItem(TAP_HINT_SEEN_KEY) === '1';
    showTapHintOverlay.value = !hasSeenHint;
  } catch {
    showTapHintOverlay.value = true;
  }
}

function dismissTapHint() {
  showTapHintOverlay.value = false;
  try {
    localStorage.setItem(TAP_HINT_SEEN_KEY, '1');
  } catch {
    // ignore storage failures
  }
}

function openBenefitsModal() {
  showBenefitsModal.value = true;
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
      <button class="why-athkar-btn" type="button" @click="openBenefitsModal">Why read athkar?</button>
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

    <transition name="overlay-fade">
      <div v-if="showBenefitsModal" class="overlay-backdrop" @click.self="closeBenefitsModal">
        <article class="benefits-modal" role="dialog" aria-modal="true" aria-label="Benefits of athkar">
          <h2>10 reasons to read morning and evening adhkar</h2>
          <p class="benefits-intro">
            Morning and evening adhkar strengthen faith, protection, and gratitude throughout the day.
          </p>
          <ol>
            <li v-for="(reason, idx) in benefits" :key="reason.title">
              <h3>{{ idx + 1 }}. {{ reason.title }}</h3>
              <p>{{ reason.body }}</p>
            </li>
          </ol>
          <p class="benefits-hadith">
            “Whoever recites Qul Huwallahu Ahad, Qul A'udhu bi-Rabbil-Falaq and Qul A'udhu bi-Rabbin-Nas
            three times in the morning and evening, they will suffice him against everything.”
            <span>Reported by Abu Dawud and al-Tirmidhi.</span>
          </p>
          <button class="benefits-close" type="button" @click="closeBenefitsModal">Continue</button>
        </article>
      </div>
    </transition>

    <transition name="overlay-fade">
      <div v-if="showTapHintOverlay && !showBenefitsModal" class="tap-hint-overlay" @click="dismissTapHint">
        <div class="tap-hint-demo" aria-hidden="true">
          <div class="tap-row-shadow" />
          <div class="tap-finger">👆</div>
        </div>
        <p>Tap a row to increment its count.</p>
        <button type="button" class="tap-hint-close">Got it</button>
      </div>
    </transition>
  </section>
</template>
