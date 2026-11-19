<script setup lang="ts">
import { activateModal } from '~/lib/modal-focus'
defineProps<{ open: boolean; title: string; message: string; confirmText?: string; cancelText?: string; danger?: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()
const panel = useTemplateRef<HTMLElement>('panel')
const titleId = useId()
const descriptionId = useId()
let release: (() => void) | undefined
watch(panel, element => {
  release?.(); release = undefined
  if (element) release = activateModal(element, () => emit('cancel'))
}, { flush: 'post' })
onBeforeUnmount(() => release?.())
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-overlay" @click.self="emit('cancel')">
      <section ref="panel" class="modal" role="dialog" aria-modal="true" :aria-labelledby="titleId" :aria-describedby="descriptionId" tabindex="-1">
        <div class="modal-heading"><h2 :id="titleId">{{ title }}</h2><button class="icon-button" aria-label="Закрыть окно" @click="emit('cancel')">×</button></div>
        <p :id="descriptionId">{{ message }}</p>
        <div class="modal-actions">
          <button class="button secondary" data-autofocus @click="emit('cancel')">{{ cancelText ?? 'Остаться' }}</button>
          <button class="button" :class="danger ? 'danger' : 'primary'" @click="emit('confirm')">{{ confirmText ?? 'Подтвердить' }}</button>
        </div>
      </section>
    </div>
  </Teleport>
</template>
