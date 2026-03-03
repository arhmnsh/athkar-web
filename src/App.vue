<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ModeToggle from './components/ModeToggle.vue';
import { resetAllCounts } from './data/progressStore';

const isHeaderHidden = ref(false);
const route = useRoute();
const routeTransition = ref('route-forward');
let lastScrollY = 0;

function handleScroll() {
  const currentY = window.scrollY || 0;
  const delta = currentY - lastScrollY;

  if (currentY < 24) {
    isHeaderHidden.value = false;
  } else if (delta > 6) {
    isHeaderHidden.value = true;
  } else if (delta < -6) {
    isHeaderHidden.value = false;
  }

  lastScrollY = currentY;
}

function resetCounters() {
  const confirmed = window.confirm('Reset all athkar counters?');
  if (!confirmed) {
    return;
  }
  resetAllCounts();
}

watch(
  () => route.name,
  (next) => {
    routeTransition.value = next === 'athkar-details' ? 'route-forward' : 'route-back';
  },
  { immediate: true },
);

onMounted(() => {
  lastScrollY = window.scrollY || 0;
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <div class="app-shell" :class="{ 'is-header-hidden': isHeaderHidden }">
    <header class="app-topbar">
      <div class="topbar-left">
        <ModeToggle />
        <button class="reset-btn" type="button" @click="resetCounters">Reset</button>
      </div>
      <div class="app-brand">
        <h1>Athkār</h1>
        <a class="app-byline" href="https://arhmn.sh" target="_blank" rel="noopener noreferrer">
          by AbdurRahaman Shah &nbsp; arhmn.sh
        </a>
      </div>
    </header>
    <main>
      <RouterView v-slot="{ Component, route: activeRoute }">
        <Transition :name="routeTransition" mode="out-in">
          <component :is="Component" :key="activeRoute.fullPath" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>
