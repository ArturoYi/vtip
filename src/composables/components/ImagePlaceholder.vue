<script setup lang="ts">
import type { NodeViewProps } from '@tiptap/vue-3';
import { NodeViewWrapper } from '@tiptap/vue-3';
import { ref } from 'vue';
import { Image, Loader } from 'lucide-vue-next';
import { FileType } from '../utils';

const { editor } = defineProps<NodeViewProps>();

// 弹层状态与输入状态
const open = ref(false);
const imageUrl = ref('');
const isUploading = ref(false);
const activeTab = ref<'local' | 'url'>('local');

function handleSubmit(e: Event) {
    e.preventDefault();
    open.value = false;
    // 通过 URL 插入图片
    editor.chain().focus().setImage({ src: imageUrl.value }).run();
}

async function openFileDialog() {
    isUploading.value = true;
    try {
        // 优先使用编辑器内置的 fileDrop 获取器
        const fileDrop = await editor.storage.fileDrop.localFileGetter(FileType.IMAGE);
        if (fileDrop) {
            editor.chain().focus().setImage({ src: fileDrop }).run();
            open.value = false;
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
    <NodeViewWrapper as="div" contenteditable="false"
        class="media-placeholder" :draggable="true" @click="open = true">
        <template v-if="!isUploading">
            <Image />
            <span>Insert an Image</span>
        </template>
        <template v-else>
            <Loader class="text-primary animate-spin" />
            <span>Uploading Image</span>
        </template>
        <div v-if="open" class="absolute left-1/2 top-full z-50 mt-2 w-96 -translate-x-1/2 rounded-lg bg-popover p-4 border border-border shadow-lg">
            <div class="flex gap-2 mb-4">
                <button type="button" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors" :class="activeTab === 'local' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
                    @click.stop="activeTab = 'local'">
                    Upload
                </button>
                <button type="button" class="px-3 py-1.5 rounded-md text-sm font-medium transition-colors" :class="activeTab === 'url' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'"
                    @click.stop="activeTab = 'url'">
                    Embed Link
                </button>
            </div>
            <div v-if="activeTab === 'local'" class="py-2">
                <button type="button" class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors" @click.stop="openFileDialog">
                    <Loader v-if="isUploading" class="w-4 h-4 animate-spin" />
                    {{ isUploading ? 'Uploading...' : 'Upload an Image' }}
                </button>
            </div>
            <div v-else class="py-2">
                <form class="flex flex-col gap-3" @submit="handleSubmit">
                    <input v-model="imageUrl" placeholder="Paste image URL here..." required type="url" 
                        class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" />
                    <button type="submit" class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                        Insert Image
                    </button>
                </form>
            </div>
        </div>
    </NodeViewWrapper>
</template>

<style scoped>
.media-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 2rem;
    border: 2px dashed var(--vtip-placeholder-border);
    border-radius: 0.5rem;
    background-color: var(--vtip-placeholder-bg);
    color: var(--vtip-placeholder-text);
    cursor: pointer;
    transition: all 0.2s ease;
    position: relative;
    margin: 1rem 0;
}

.media-placeholder:hover {
    border-color: var(--vtip-placeholder-text);
    background-color: var(--vtip-placeholder-bg);
    opacity: 0.8;
}

.media-placeholder :deep(svg) {
    width: 1.5rem;
    height: 1.5rem;
}
</style>
