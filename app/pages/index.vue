<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
const store = useNotesStore()
const { dialog, ask, answer } = useConfirmation()
useHead({ title: 'Все заметки — Базис' })
async function remove(id: string) {
  if (await ask('Удалить заметку?', 'Заметка и её задачи будут удалены без возможности восстановления.', 'Удалить', true)) {
    if (store.deleteNote(id)) store.toastMessage = 'Заметка удалена'
  }
}
</script>

<template>
  <main id="main-content" tabindex="-1">
    <header class="page-heading">
      <div><h1>Все заметки</h1><p>Планы, идеи и задачи — в одном месте.</p></div>
      <NuxtLink to="/notes/new" class="button primary"><span aria-hidden="true">＋</span> Новая заметка</NuxtLink>
    </header>
    <section v-if="store.notes.length" class="notes-grid" aria-label="Заметки">
      <NoteCard v-for="note in store.notes" :key="note.id" :note="note" @remove="remove" />
    </section>
    <section v-else class="empty-state">
      <span class="empty-symbol" aria-hidden="true">✓</span><h2>Начните с одной заметки</h2>
      <p class="muted">Дайте ей название и добавьте то, что хотите сделать.</p>
      <NuxtLink to="/notes/new" class="button primary">Создать заметку</NuxtLink>
    </section>
    <ConfirmModal v-bind="dialog" @confirm="answer(true)" @cancel="answer(false)" />
  </main>
</template>
