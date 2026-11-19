<script setup lang="ts">
import type { TodoItem } from '~/lib/types'
defineProps<{ todo: TodoItem; index: number }>()
defineEmits<{ text: [value: string]; toggle: []; remove: []; blur: [] }>()
</script>

<template>
  <li class="todo-row" :class="{ completed: todo.completed }">
    <input type="checkbox" :checked="todo.completed" :aria-label="`Выполнено: ${todo.text || `пункт ${index + 1}`}`" @change="$emit('toggle')">
    <input :id="`todo-${todo.id}`" type="text" :value="todo.text" maxlength="1000" :aria-label="`Текст пункта ${index + 1}`" placeholder="Что нужно сделать?" @input="$emit('text', ($event.target as HTMLInputElement).value)" @blur="$emit('blur')">
    <button class="icon-button text-danger" :aria-label="`Удалить пункт ${index + 1}`" @click="$emit('remove')">×</button>
  </li>
</template>
