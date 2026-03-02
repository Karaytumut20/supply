import { ref } from 'vue'

const toasts = ref([])
let nextId = 0

export const useToast = () => {
  const addToast = (message, type = 'info') => {
    const id = nextId++
    toasts.value.push({ id, message, type })
    setTimeout(() => removeToast(id), 3500)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return { toasts, addToast, removeToast }
}