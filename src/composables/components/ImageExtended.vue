<script lang="ts" setup>
import type { NodeViewProps } from '@tiptap/vue-3';
import MediaExtended from '../commands/MediaExtended.vue';

const props = defineProps<NodeViewProps>();
</script>
<template>
  <MediaExtended v-bind="props" v-slot="{ setMediaRef }">
    <!-- 使用通用媒体外壳包裹图片节点 -->
    <!-- 将媒体 DOM 引用传回外壳，用于计算尺寸 -->
    <img
      :ref="setMediaRef"
      :src="props.node.attrs.src"
      :alt="props.node.attrs.alt"
      :title="props.node.attrs.title"
    />
  </MediaExtended>
</template>
