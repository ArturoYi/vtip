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
        class="media-placeholder relative my-4 flex w-full items-center justify-start gap-4 p-6"
        style="user-select: none;" :draggable="true" @click="open = true">
        <template v-if="!isUploading">
            <Image />
            <span>Insert an Image</span>
        </template>
        <template v-else>
            <Loader class="text-primary animate-spin" />
            <span>Uploading Image</span>
        </template>
        <div v-if="open" class="absolute left-1/2 top-full z-50 mt-2 w-96 -translate-x-1/2 rounded-lg bg-popover p-4">
            <div class="flex gap-2">
                <button type="button" class="px-3 py-1.5 rounded-md" :class="{ 'bg-muted': activeTab === 'local' }"
                    @click.stop="activeTab = 'local'">
                    Upload
                </button>
                <button type="button" class="px-3 py-1.5 rounded-md" :class="{ 'bg-muted': activeTab === 'url' }"
                    @click.stop="activeTab = 'url'">
                    Embed Link
                </button>
            </div>
            <div v-if="activeTab === 'local'" class="py-2">
                <button type="button" class="w-full" @click.stop="openFileDialog">
                    Upload an Image
                </button>
            </div>
            <div v-else class="py-2">
                <form class="flex flex-col gap-2" @submit="handleSubmit">
                    <input v-model="imageUrl" placeholder="Embed Image" required type="url" />
                    <button type="submit">Insert</button>
                </form>
            </div>
        </div>
    </NodeViewWrapper>
</template>
