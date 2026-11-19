<script setup lang="ts">
import { useNotesStore } from '~/stores/notes'
const store = useNotesStore()
const route = useRoute()
let timer: ReturnType<typeof setTimeout> | undefined
watch(() => store.toastMessage, message => {
  clearTimeout(timer)
  if (message) timer = setTimeout(() => { store.toastMessage = '' }, 3500)
})
onBeforeUnmount(() => clearTimeout(timer))
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#main-content">К содержимому</a>
    <NuxtRouteAnnouncer />
    <aside class="sidebar">
      <NuxtLink to="/" class="brand"><span class="brand-mark" aria-hidden="true">б</span> Базис</NuxtLink>
      <nav aria-label="Главная навигация">
        <NuxtLink to="/" class="nav-link" :class="{ active: route.path === '/' }" :aria-current="route.path === '/' ? 'page' : undefined">Все заметки</NuxtLink>
        <NuxtLink to="/notes/new" class="nav-link" :class="{ active: route.path === '/notes/new' }" :aria-current="route.path === '/notes/new' ? 'page' : undefined">Новая заметка</NuxtLink>
      </nav>
      <p class="sidebar-foot">Ваше пространство<br>для небольших планов.</p>
    </aside>
    <div class="workspace">
      <header class="topbar"><span>Заметки и задачи</span><span class="local-status">В этом браузере</span></header>
      <p v-if="store.error && route.path === '/'" class="notice error" role="alert">{{ store.error }} <button class="button secondary" @click="store.refresh">Повторить</button></p>
      <NuxtPage />
    </div>
    <div v-if="store.toastMessage" class="toast" role="status">{{ store.toastMessage }}</div>
  </div>
</template>
