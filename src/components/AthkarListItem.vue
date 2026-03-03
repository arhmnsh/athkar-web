<script setup>
const props = defineProps({
  athkar: {
    type: Object,
    required: true,
  },
  currentCount: {
    type: Number,
    required: true,
  },
  progress: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['increment', 'details']);
</script>

<template>
  <article class="athkar-row">
    <div class="progress-fill" :style="{ width: `${progress}%` }" />
    <button class="body-hit" type="button" @click="emit('increment')">
      <p class="arabic">{{ athkar.athkar_ar }}</p>
      <p class="counter">{{ currentCount }} / {{ athkar.read_count }}</p>
    </button>
    <button
      class="details-hit"
      type="button"
      :aria-label="`Open details for athkar ${athkar.id}`"
      @click="emit('details')"
    >
      <span aria-hidden="true">›</span>
    </button>
  </article>
</template>
