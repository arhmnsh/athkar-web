<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import HowToSheet from './components/HowToSheet.vue';
import InstallPrompt from './components/InstallPrompt.vue';
import ModeToggle from './components/ModeToggle.vue';
import { closeHowTo, onboarding, openHowTo, startOnboarding } from './data/onboardingStore';
import { locale, t } from './data/i18n';

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
  startOnboarding();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(
  () => [onboarding.howToOpen, onboarding.tapHintOpen],
  ([howToOpen, tapHintOpen]) => {
    window.dispatchEvent(new CustomEvent('athkar:onboarding-state', {
      detail: { active: howToOpen || tapHintOpen },
    }));
  },
  { immediate: true },
);
</script>

<template>
  <div class="app-shell" :class="{ 'is-header-hidden': isHeaderHidden }">
    <header class="app-topbar">
      <div class="topbar-left">
        <h1 class="app-title notranslate" :lang="locale" translate="no">{{ t('appName') }}</h1>
      </div>
      <div class="topbar-right">
        <button
          class="icon-btn guide-btn"
          type="button"
          :aria-label="t('howToRead')"
          :title="t('howToRead')"
          aria-haspopup="dialog"
          :aria-expanded="onboarding.howToOpen"
          @click="openHowTo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9a2.5 2.5 0 1 1 4.4 1.6c-.9 1.1-2 1.5-2 3" />
            <path d="M12 17.1v.1" />
          </svg>
        </button>
        <ModeToggle />
      </div>
    </header>
    <main>
      <RouterView v-slot="{ Component, route: activeRoute }">
        <Transition :name="routeTransition" mode="out-in">
          <component :is="Component" :key="activeRoute.fullPath" />
        </Transition>
      </RouterView>
    </main>
    <HowToSheet :open="onboarding.howToOpen" @close="closeHowTo" />
    <InstallPrompt />
  </div>
</template>
