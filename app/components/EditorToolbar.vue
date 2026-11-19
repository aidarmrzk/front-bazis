<script setup lang="ts">
defineProps<{ canUndo: boolean; canRedo: boolean }>()
defineEmits<{ undo: []; redo: [] }>()
</script>

<template>
  <div class="history-toolbar" aria-label="История изменений">
    <button class="button secondary" :disabled="!canUndo" title="Отменить изменение (Ctrl/Cmd+Z вне поля ввода)" @click="$emit('undo')">↶ Отменить</button>
    <button class="button secondary" :disabled="!canRedo" title="Повторить изменение (Ctrl/Cmd+Shift+Z вне поля ввода)" @click="$emit('redo')">↷ Повторить</button>
    <span class="muted history-hint">В полях ввода работает обычная отмена текста</span>
  </div>
</template>
