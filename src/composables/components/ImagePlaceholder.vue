<script setup lang="ts">
import { NodeViewWrapper, type NodeViewProps } from '@tiptap/vue-3';
import { ref } from 'vue';
import { Link, UploadCloud, ImageOff, Loader2 } from 'lucide-vue-next';
import { FileType } from '../utils';
import { useScreen } from '../useScreen';

const props = defineProps<NodeViewProps>();
const { editor } = props;
const { isMaxSm } = useScreen();

// 输入状态
const imageUrl = ref('');
const isUploading = ref(false);

function handleSubmit(e: Event) {
    e.preventDefault();
    // 通过 URL 插入图片
    if (imageUrl.value) {
        editor.chain().focus().setImage({ src: imageUrl.value }).run();
    }
}

async function openFileDialog() {
    isUploading.value = true;
    try {
        // 优先使用编辑器内置的 fileDrop 获取器
        const fileDrop = await editor.storage.fileDrop.localFileGetter(FileType.IMAGE);
        if (fileDrop) {
            editor.chain().focus().setImage({ src: fileDrop }).run();
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
    <NodeViewWrapper class="media-placeholder-container relative w-full min-w-0 group" contenteditable="false">

        <!-- Read-only State -->
        <div v-if="!editor.isEditable"
            :class="['flex flex-col items-center justify-center w-full rounded-xl border border-dashed border-[var(--vtip-placeholder-border)] bg-[var(--vtip-placeholder-bg)] text-[var(--vtip-placeholder-text)]', isMaxSm ? 'h-[300px]' : 'h-[150px]']">
            <ImageOff class="w-10 h-10 opacity-50 mb-3" stroke-width="1.5" />
            <span class="text-sm">No image selected</span>
        </div>

        <div v-else
            class="w-full min-w-0 max-w-full rounded-xl border border-dashed border-[var(--vtip-placeholder-border)] bg-[var(--vtip-placeholder-bg)] overflow-hidden relative">

            <div
                :class="['flex min-w-0 rounded-xl', isMaxSm ? 'flex-col w-full h-[300px] divide-y divide-[var(--vtip-placeholder-border)]' : 'flex-row w-full max-w-2xl h-[150px] divide-x divide-[var(--vtip-placeholder-border)]']">

                <!-- Uploading Overlay -->
                <div v-if="isUploading"
                    class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--vtip-placeholder-bg)]/80 backdrop-blur-sm rounded-xl">
                    <Loader2 class="w-10 h-10 text-[var(--vtip-code-function)] animate-spin mb-3" stroke-width="2" />
                    <span class="text-sm font-medium text-[var(--vtip-placeholder-text)]">
                        Uploading...
                    </span>
                </div>

                <!-- Left/Top: Upload -->
                <div
                    :class="['flex flex-col items-center justify-center p-6 relative min-w-0', isMaxSm ? 'flex-1' : 'flex-1 min-w-0']">
                    <button type="button"
                        :class="['vtip-btn flex flex-col gap-3 shrink-0', isMaxSm ? 'w-full h-full min-h-0' : 'w-full max-w-[200px] h-full min-h-0']"
                        :disabled="isUploading" @click="openFileDialog">
                        <UploadCloud class="w-8 h-8 opacity-80 shrink-0" stroke-width="1.5" />
                        <span>Upload Image</span>
                    </button>
                </div>

                <!-- Right/Bottom: Link -->
                <div
                    class="link-section flex-1 flex flex-col items-center justify-center min-w-0 overflow-hidden p-4 sm:p-6">
                    <form
                        class="link-form flex flex-col w-full min-w-0 max-w-full sm:max-w-[240px] gap-3 overflow-hidden"
                        @submit="handleSubmit">
                        <div
                            :class="['link-form__input flex items-center gap-2 min-h-[44px] px-3 rounded-lg border border-[var(--vtip-slash-menu-border)] bg-[var(--vtip-code-bg)] shadow-sm transition-[border-color,box-shadow]', isUploading ? 'opacity-50' : 'focus-within:border-[var(--vtip-code-function)] focus-within:ring-2 focus-within:ring-[var(--vtip-code-function)]/20']">
                            <Link class="w-4 h-4 text-[var(--vtip-placeholder-text)] shrink-0" />
                            <input v-model="imageUrl" :disabled="isUploading" placeholder="Paste URL..." required
                                type="url"
                                class="link-form__field flex-1 bg-transparent border-none outline-none text-sm text-[var(--vtip-slash-item-text)] placeholder-[var(--vtip-placeholder-text)] min-h-[28px]"
                                @keydown.stop />
                        </div>
                        <button type="submit"
                            class="vtip-btn vtip-btn--primary w-full min-h-[44px] py-2.5 flex-shrink-0"
                            :disabled="isUploading" title="Embed Image">
                            <Link class="w-4 h-4" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </NodeViewWrapper>
</template>

<style scoped>
/* Ensure smooth transitions */
.media-placeholder-container * {
    transition-property: color, background-color, border-color, opacity, transform, box-shadow;
    transition-duration: 200ms;
}

/* 链接区域：在 flex 内不撑开，表单可 100% 填满 */
.link-section {
    max-width: 100%;
}

/* 防止链接表单区域横向溢出：input 默认 min-width 会导致 flex 无法收缩 */
.link-form__input {
    min-width: 0;
}

.link-form__field {
    min-width: 0;
}
</style>
