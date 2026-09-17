<script setup>
import { onBeforeUnmount, onMounted } from 'vue';
import { locale, t } from '../data/i18n';

const props = defineProps({
  open: { type: Boolean, required: true },
});

const emit = defineEmits(['close']);

function handleKeyDown(e) {
  if (e.key === 'Escape' && props.open) {
    emit('close');
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <Transition name="overlay-fade">
    <div v-if="props.open" class="overlay-backdrop" @click.self="emit('close')">
      <article
        class="benefits-modal"
        :dir="locale === 'ar' ? 'rtl' : 'ltr'"
        role="dialog"
        aria-modal="true"
        :aria-label="t('howToTitle')"
      >
        <div class="benefits-content">
          <h2>{{ t('howToTitle') }}</h2>
          <p class="benefits-intro">{{ t('howToIntro') }}</p>
          <h3 class="benefits-sunnah-title">{{ t('benefitsTitle') }}</h3>
          <p class="benefits-intro">{{ t('benefitsIntro') }}</p>
          <ol>
            <li v-for="(reason, idx) in t('reasons')" :key="reason.title">
              <h3>{{ idx + 1 }}. {{ reason.title }}</h3>
              <p>{{ reason.body }}</p>
            </li>
          </ol>
          <p class="benefits-hadith">
            {{ t('hadith') }}
            <span>{{ t('hadithSource') }}</span>
          </p>
          <h3 class="benefits-sunnah-title">{{ t('fingersTitle') }}</h3>
          <p class="benefits-hadith">{{ t('fingersBody') }}</p>
        </div>
        <div class="benefits-actions">
          <button class="benefits-close" type="button" @click="emit('close')">{{ t('continueLabel') }}</button>
        </div>
      </article>
    </div>
  </Transition>
</template>
