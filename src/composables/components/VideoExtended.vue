<script lang="ts" setup>
import type { NodeViewProps } from '@tiptap/vue-3';
import MediaExtended from '../commands/MediaExtended.vue';

const props = defineProps<NodeViewProps>();
</script>
<template>
  <MediaExtended v-bind="props" v-slot="{ setMediaRef }">
    <video
      :ref="setMediaRef"
      :src="props.node.attrs.src"
      :title="props.node.attrs.title"
      controls
      class="w-full max-w-full"
    />
  </MediaExtended>
</template>
