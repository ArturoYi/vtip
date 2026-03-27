<script setup lang="ts">
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/vue-3';
import { ref } from 'vue';
import { Link, UploadCloud, Music, Loader2 } from 'lucide-vue-next';
import { FileType } from '../utils';
import { useScreen } from '../useScreen';

const props = defineProps<NodeViewProps>();
const { editor } = props;
const { isMaxSm } = useScreen();
const canLocalUpload = editor.storage.fileDrop.supportsLocalUpload;

const audioUrl = ref('');
const isUploading = ref(false);

function handleSubmit(e: Event) {
  e.preventDefault();
  if (audioUrl.value) {
    editor.chain().focus().setAudio({ src: audioUrl.value }).run();
  }
}

async function openFileDialog() {
  isUploading.value = true;
  try {
    const fileDrop = await editor.storage.fileDrop.localFileGetter(FileType.AUDIO);
    if (fileDrop) {
      editor.chain().focus().setAudio({ src: fileDrop }).run();
      return;
    }
  } catch (error) {
    console.error(error);
  } finally {
    isUploading.value = false;
  }
}
</script>

<template>
  <NodeViewWrapper
    class="media-placeholder-container my-4 relative w-full min-w-0 group"
    contenteditable="false"
  >
    <!-- Read-only State -->
    <div
      v-if="!editor.isEditable"
      :class="[
        'media-placeholder-glass flex flex-col items-center justify-center w-full text-[var(--vtip-placeholder-text)]',
        isMaxSm ? 'h-[300px]' : 'h-[150px]'
      ]"
    >
      <Music class="w-10 h-10 opacity-55 mb-3 drop-shadow-sm" stroke-width="1.5" />
      <span class="text-sm font-medium tracking-tight">No audio selected</span>
    </div>

    <div v-else class="media-placeholder-glass w-full min-w-0 max-w-full">
      <div
        :class="[
          'media-placeholder-glass__inner flex min-w-0',
          isMaxSm ? 'flex-col w-full h-[300px]' : 'flex-row w-full max-w-2xl h-[150px]'
        ]"
      >
        <!-- Uploading Overlay -->
        <div
          v-if="isUploading"
          class="media-placeholder-glass__overlay absolute inset-0 z-10 flex flex-col items-center justify-center rounded-[inherit]"
        >
          <Loader2
            class="w-10 h-10 text-[var(--vtip-code-function)] animate-spin mb-3 drop-shadow-sm"
            stroke-width="2"
          />
          <span class="text-sm font-medium text-[var(--vtip-placeholder-text)]">
            Uploading...
          </span>
        </div>

        <!-- Left/Top: Upload -->
        <div
          v-if="canLocalUpload"
          :class="[
            'media-placeholder-glass__pane--upload flex flex-col items-center justify-center p-6 relative min-w-0',
            isMaxSm ? 'flex-1' : 'flex-1 min-w-0'
          ]"
        >
          <button
            type="button"
            :class="[
              'vtip-btn media-placeholder-glass__upload-btn flex flex-col gap-2.5 shrink-0 py-5',
              isMaxSm ? 'w-full h-full min-h-0' : 'w-full max-w-[200px] h-full min-h-0'
            ]"
            :disabled="isUploading"
            @click="openFileDialog"
          >
            <UploadCloud class="w-9 h-9 opacity-90 shrink-0 text-[var(--vtip-code-function)]" stroke-width="1.5" />
            <span class="text-xs font-semibold uppercase tracking-wider opacity-90">Upload Audio</span>
          </button>
        </div>

        <!-- Right/Bottom: Link -->
        <div
          class="link-section flex-1 flex flex-col items-center justify-center min-w-0 overflow-hidden p-4 sm:p-6"
        >
          <form
            class="link-form flex flex-col w-full min-w-0 max-w-full sm:max-w-[260px] gap-3 overflow-hidden"
            @submit="handleSubmit"
          >
            <div
              :class="[
                'link-form__input media-placeholder-glass__field flex items-center gap-2 min-h-[44px] px-3',
                isUploading ? 'media-placeholder-glass__field--disabled' : ''
              ]"
            >
              <Link class="w-4 h-4 text-[var(--vtip-placeholder-text)] shrink-0 opacity-80" />
              <input
                v-model="audioUrl"
                :disabled="isUploading"
                placeholder="Paste audio URL..."
                required
                type="url"
                class="link-form__field flex-1 bg-transparent border-none outline-none text-sm text-[var(--vtip-slash-item-text)] placeholder-[var(--vtip-placeholder-text)] min-h-[28px]"
                @keydown.stop
              />
            </div>
            <button
              type="submit"
              class="vtip-btn vtip-btn--primary media-placeholder-glass__primary w-full min-h-[44px] py-2.5 flex-shrink-0"
              :disabled="isUploading"
              title="Embed Audio"
            >
              <Link class="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  </NodeViewWrapper>
</template>

<style scoped>
.media-placeholder-container * {
  transition-property: color, background-color, border-color, opacity, transform, box-shadow;
  transition-duration: 200ms;
}

.link-section {
  max-width: 100%;
}

.link-form__input {
  min-width: 0;
}

.link-form__field {
  min-width: 0;
}
</style>
