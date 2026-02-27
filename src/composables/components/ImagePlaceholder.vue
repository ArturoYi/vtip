<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { ref } from 'vue';
import { Image, Link, UploadCloud, ImageOff, Loader2 } from 'lucide-vue-next';
import { FileType } from '../utils';
import MediaExtended from '../commands/MediaExtended.vue';
import { TabsRoot, TabsList, TabsTrigger, TabsContent, TabsIndicator } from 'reka-ui';
import { useScreen } from '../useScreen';

const props = defineProps<NodeViewProps>();
const { editor } = props;
const { isMaxSm } = useScreen();

// 输入状态
const imageUrl = ref('');
const isUploading = ref(true);

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
    <MediaExtended v-bind="props" v-slot="{ setMediaRef }">
        <div :ref="setMediaRef" class="media-placeholder-container relative w-full group" contenteditable="false">
            
            <!-- Read-only State -->
            <div v-if="!editor.isEditable" :class="['flex flex-col items-center justify-center w-full rounded-xl border border-dashed border-[var(--vtip-placeholder-border)] bg-[var(--vtip-placeholder-bg)] text-[var(--vtip-placeholder-text)]', isMaxSm ? 'h-[300px]' : 'h-[150px]']">
                <ImageOff class="w-10 h-10 opacity-50 mb-3" stroke-width="1.5" />
                <span class="text-sm">No image selected</span>
            </div>

            <div v-else :class="['flex w-full rounded-xl border border-dashed border-[var(--vtip-placeholder-border)] bg-[var(--vtip-placeholder-bg)] overflow-hidden relative', isMaxSm ? 'flex-col h-[300px] divide-y divide-[var(--vtip-placeholder-border)]' : 'flex-row h-[150px] divide-x divide-[var(--vtip-placeholder-border)]']">
                
                <!-- Uploading Overlay -->
                <div v-if="isUploading" class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[var(--vtip-placeholder-bg)]/80 backdrop-blur-sm rounded-xl">
                    <Loader2 class="w-10 h-10 text-[var(--vtip-code-function)] animate-spin mb-3" stroke-width="2" />
                    <span class="text-sm font-medium text-[var(--vtip-placeholder-text)]">
                        Uploading...
                    </span>
                </div>
                
                <!-- Left/Top: Upload -->
                <div class="flex-1 flex flex-col items-center justify-center p-6 relative">
                    <button type="button"
                        :disabled="isUploading"
                        :class="['flex flex-col items-center justify-center gap-3 w-full h-full outline-none group/btn', isUploading ? 'cursor-not-allowed opacity-50' : 'cursor-pointer']"
                        @click="openFileDialog">
                        <div class="relative flex items-center justify-center">
                            <UploadCloud class="w-8 h-8 text-[var(--vtip-placeholder-text)] opacity-80" stroke-width="1.5" />
                        </div>
                        <span class="text-sm font-medium text-[var(--vtip-placeholder-text)]">
                            Upload Image
                        </span>
                    </button>
                </div>

                <!-- Right/Bottom: Link -->
                <div class="flex-1 flex flex-col items-center justify-center p-6">
                    <form class="flex w-full max-w-[240px] items-center gap-2" @submit="handleSubmit">
                        <div :class="['flex-1 flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--vtip-slash-menu-border)] bg-[var(--vtip-code-bg)] shadow-sm', isUploading ? 'opacity-50' : 'focus-within:border-[var(--vtip-code-function)] focus-within:ring-1 focus-within:ring-[var(--vtip-code-function)]']">
                            <Link class="w-4 h-4 text-[var(--vtip-placeholder-text)] shrink-0" />
                            <input v-model="imageUrl" 
                                :disabled="isUploading"
                                placeholder="Paste URL..." 
                                required 
                                type="url"
                                class="flex-1 bg-transparent border-none outline-none text-sm text-[var(--vtip-slash-item-text)] placeholder-[var(--vtip-placeholder-text)] min-w-0" 
                                @keydown.stop />
                        </div>
                        <button type="submit"
                            :disabled="isUploading"
                            :class="['p-2 bg-[var(--vtip-code-function)] text-white rounded-lg shadow-sm flex-shrink-0', isUploading ? 'opacity-50 cursor-not-allowed' : 'active:scale-[0.95] cursor-pointer']"
                            title="Embed Image">
                            <Link class="w-4 h-4" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    </MediaExtended>
</template>

<style scoped>
/* Ensure smooth transitions */
.media-placeholder-container * {
    transition-property: color, background-color, border-color, opacity, transform, box-shadow;
    transition-duration: 200ms;
}
</style>
