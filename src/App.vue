<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import ModeToggle from './components/ModeToggle.vue';

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
        <h1 class="app-title">Athkār</h1>
      </div>
      <ModeToggle />
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
