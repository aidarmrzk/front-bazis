<script setup lang="ts">
import type { EditableNote } from '~/lib/types'
defineProps<{ draft: EditableNote }>()
defineEmits<{ text: [field: string, value: string]; blur: []; add: []; toggle: [id: string]; remove: [id: string] }>()
</script>

<template>
  <section class="editor-sheet" aria-label="Содержимое заметки">
    <label class="field-label" for="note-title">Название заметки</label>
    <input id="note-title" class="title-input" type="text" :value="draft.title" placeholder="Например, планы на неделю" maxlength="120" @input="$emit('text', 'title', ($event.target as HTMLInputElement).value)" @blur="$emit('blur')">
    <div class="section-heading"><h2>Список задач</h2><span class="muted">{{ draft.todos.filter(t => t.completed).length }} / {{ draft.todos.length }}</span></div>
    <ul class="todo-list">
      <TodoRow v-for="(todo, index) in draft.todos" :key="todo.id" :todo="todo" :index="index" @text="$emit('text', todo.id, $event)" @toggle="$emit('toggle', todo.id)" @remove="$emit('remove', todo.id)" @blur="$emit('blur')" />
    </ul>
    <p v-if="!draft.todos.length" class="muted">Добавьте первый пункт — или сохраните только название.</p>
    <button class="button secondary add-task" @click="$emit('add')"><span aria-hidden="true">＋</span> Добавить пункт</button>
  </section>
</template>
