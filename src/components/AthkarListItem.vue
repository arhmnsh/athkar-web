<script setup>
import { computed } from 'vue';

const props = defineProps({
  athkar: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
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

const rowStyle = computed(() => {
  const steps = Math.max(props.total - 1, 1);
  const ratio = props.index / steps;
  const hue = Math.round(2 + ratio * 22);
  const topLight = Math.round(51 + ratio * 2);
  const bottomLight = Math.round(46 + ratio * 2);
  return {
    '--row-top': `hsl(${hue}, 73%, ${topLight}%)`,
    '--row-bottom': `hsl(${hue + 1}, 69%, ${bottomLight}%)`,
  };
});

const isComplete = computed(() => props.progress >= 100);
</script>

<template>
  <article
    class="athkar-row"
    :class="{ 'is-complete': isComplete }"
    :style="rowStyle"
    :data-athkar-id="athkar.id"
  >
    <div class="progress-fill" :style="{ width: `${progress}%` }" />
    <aside class="side-rail">
      <button
        class="details-hit"
        type="button"
        :aria-label="`Open details for athkar ${athkar.id}`"
        @click="emit('details')"
      >
        <span aria-hidden="true">❮</span>
      </button>
      <p class="side-counter">{{ currentCount }} / {{ athkar.read_count }}</p>
    </aside>
    <button class="body-hit" type="button" @click="emit('increment')">
      <p class="arabic">{{ athkar.athkar_ar_display }}</p>
    </button>
  </article>
</template>
