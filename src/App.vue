<script setup lang="ts">
import { ref } from 'vue'
import { VtipEditor, VtipRenderer } from './index'

const content = ref('<p>Hello Vtip! 这是你的富文本编辑器。</p><h2>功能展示</h2><ul><li>支持数学公式：<span data-type="math_inline" data-latex="E=mc^2"></span></li><li>支持代码高亮</li><li>支持表格和媒体</li></ul>')

const handleUpload = async (file: File) => {
  console.log('正在上传文件:', file.name)
  // 模拟异步上传
  await new Promise(resolve => setTimeout(resolve, 1000))
  return URL.createObjectURL(file)
}
</script>

<template>
  <div class="demo-container">
    <header class="demo-header">
      <h1>Vtip Editor & Renderer Demo</h1>
    </header>

    <main class="demo-main">
      <section class="demo-section">
        <h3>1. 编辑器 (VtipEditor)</h3>
        <VtipEditor 
          v-model="content" 
          :upload-file="handleUpload"
          locale="zh"
        />
      </section>

      <section class="demo-section">
        <h3>2. 渲染器 (VtipRenderer - 只读预览)</h3>
        <div class="renderer-wrapper">
          <VtipRenderer :model-value="content" locale="zh" />
        </div>
      </section>

      <section class="demo-section debug-section">
        <h3>3. 原始数据 (Model Value)</h3>
        <pre>{{ content }}</pre>
      </section>
    </main>
  </div>
</template>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: #f9fafb;
}

.demo-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.demo-header {
  margin-bottom: 2rem;
  text-align: center;
}

.demo-main {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.demo-section h3 {
  margin-bottom: 1rem;
  color: #374151;
}

.renderer-wrapper {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.debug-section pre {
  background: #1f2937;
  color: #f3f4f6;
  padding: 1rem;
  border-radius: 8px;
  font-size: 13px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}

@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
  .demo-header h1, .demo-section h3 {
    color: #f3f4f6;
  }
  .renderer-wrapper {
    background: #111827;
    border-color: #374151;
  }
}
</style>
