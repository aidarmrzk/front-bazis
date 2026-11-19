<script setup lang="ts">
import type { Note } from '~/lib/types'
const props = defineProps<{ note: Note }>()
defineEmits<{ remove: [id: string] }>()
const completed = computed(() => props.note.todos.filter(t => t.completed).length)
const progress = computed(() => props.note.todos.length ? completed.value / props.note.todos.length * 100 : 0)
const updated = computed(() => new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'short' }).format(new Date(props.note.updatedAt)))
</script>

<template>
  <article class="note-card">
    <div class="card-meta"><span>{{ updated }}</span><span>{{ completed }} из {{ note.todos.length }} выполнено</span></div>
    <h2><NuxtLink :to="`/notes/${note.id}`">{{ note.title }}</NuxtLink></h2>
    <div class="progress" aria-hidden="true"><span :style="{ width: `${progress}%` }" /></div>
    <ul class="preview-list">
      <li v-for="todo in note.todos.slice(0, 3)" :key="todo.id" :class="{ completed: todo.completed }">
        <span class="preview-check" aria-hidden="true">{{ todo.completed ? '✓' : '' }}</span>
        <span>{{ todo.text }}</span><span class="sr-only">{{ todo.completed ? 'Выполнено' : 'Не выполнено' }}</span>
      </li>
    </ul>
    <p v-if="!note.todos.length" class="muted">Пока без задач</p>
    <p v-if="note.todos.length > 3" class="muted">Ещё {{ note.todos.length - 3 }} в заметке</p>
    <footer class="card-actions">
      <NuxtLink class="button secondary" :to="`/notes/${note.id}`">Изменить</NuxtLink>
      <button class="button text-danger" :aria-label="`Удалить заметку «${note.title}»`" @click="$emit('remove', note.id)">Удалить</button>
    </footer>
  </article>
</template>
