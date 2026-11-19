<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
definePageMeta({ key: route => route.path })
const store = useNotesStore()
const { session, isNew, missing, validation, conflict, dialog, answer, dirty, draftError,
  text, toggle, remove, add, undo, redo, flush, save, cancel, removeNote } = useNoteEditor()
useHead({ title: isNew ? 'Новая заметка — Базис' : 'Редактирование — Базис' })
</script>

<template>
  <main id="main-content" class="editor" tabindex="-1">
    <NuxtLink to="/" class="back-link">← Все заметки</NuxtLink>
    <section v-if="missing" class="empty-state">
      <h1>Заметка не найдена</h1><p class="muted">Возможно, её удалили или в ссылке есть ошибка.</p>
      <NuxtLink to="/" class="button primary">К списку заметок</NuxtLink>
    </section>
    <template v-else>
      <header class="page-heading"><div><h1>{{ isNew ? 'Новая заметка' : 'Редактирование заметки' }}</h1><p>{{ dirty ? 'Есть несохранённые изменения' : 'Изменения сохранятся по кнопке «Сохранить»' }}</p></div></header>
      <div v-if="conflict" class="notice" role="status">
        <p>{{ conflict === 'deleted' ? 'Эта заметка удалена в другой вкладке. Ваши правки остались здесь.' : 'Эта заметка изменена в другой вкладке. Чтобы сохранить обе версии, создайте копию.' }}</p>
        <button class="button secondary" :disabled="!!validation" @click="save(true)">Сохранить как новую заметку</button>
      </div>
      <p v-if="draftError" class="notice error" role="alert">{{ draftError }}</p>
      <EditorToolbar :can-undo="session.canUndo" :can-redo="session.canRedo" @undo="undo" @redo="redo" />
      <NoteFields :draft="session.draft" @text="text" @blur="flush" @toggle="toggle" @remove="remove" @add="add" />
      <p v-if="validation" id="validation" class="error" role="status">{{ validation }}</p>
      <div class="editor-actions">
        <button class="button primary" :disabled="!!validation || !!conflict" :aria-describedby="validation ? 'validation' : undefined" @click="save()">Сохранить изменения</button>
        <button class="button secondary" @click="cancel">Отменить редактирование</button>
        <button v-if="!isNew" class="button text-danger" @click="removeNote">Удалить заметку</button>
      </div>
      <p v-if="store.error" class="error" role="alert">{{ store.error }}</p>
    </template>
    <ConfirmModal v-bind="dialog" @confirm="answer(true)" @cancel="answer(false)" />
  </main>
</template>
