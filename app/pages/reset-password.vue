<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from '#imports'

const route = useRoute()
const router = useRouter()
const { addToast } = useToast()

const token = route.query.token?.toString()
const password = ref('')
const confirmPassword = ref('')
const isSubmitting = ref(false)

const handleSubmit = async () => {
    if (!token) {
        addToast('Geçersiz veya eksik token. Lütfen e-postanızı tekrar kontrol edin.', 'error')
        return
    }
    
    if (password.value !== confirmPassword.value) {
        addToast('Şifreler eşleşmiyor.', 'error')
        return
    }

    if (password.value.length < 6) {
        addToast('Şifre en az 6 karakter olmalıdır.', 'warning')
        return
    }

    isSubmitting.value = true
    try {
        const res = await $fetch('/api/auth/reset-password', {
            method: 'POST',
            body: { token, newPassword: password.value }
        })
        addToast(res.message || 'Şifreniz başarıyla değiştirildi.', 'success')
        router.push('/sign-in')
    } catch (err: any) {
        addToast(err.data?.message || 'Şifre güncellenemedi.', 'error')
    } finally {
        isSubmitting.value = false
    }
}
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] flex items-center justify-center p-5 pt-24">
    <div class="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-zinc-200">
      
      <div v-if="!token" class="text-center py-6">
          <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="lucide:x-circle" class="w-8 h-8 text-red-600" />
          </div>
          <h2 class="text-xl font-bold text-black mb-3">Geçersiz Bağlantı</h2>
          <p class="text-sm text-zinc-500 font-medium leading-relaxed mb-6">Şifre sıfırlama bağlantınız eksik veya hatalı.</p>
          <NuxtLink to="/forgot-password" class="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Yeni Bir Bağlantı İste
          </NuxtLink>
      </div>

      <div v-else>
        <div class="mb-8 text-center">
            <h1 class="text-2xl font-black tracking-tight text-black mb-2">Yeni Şifre Belirle</h1>
            <p class="text-sm font-medium text-zinc-500 leading-relaxed">Lütfen hesabınız için yeni bir şifre girin.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
            <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Yeni Şifre</label>
                <input v-model="password" type="password" placeholder="••••••••" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
            </div>

            <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Yeni Şifre (Tekrar)</label>
                <input v-model="confirmPassword" type="password" placeholder="••••••••" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
            </div>

            <button type="submit" :disabled="isSubmitting" class="mt-4 w-full bg-black hover:bg-zinc-800 text-white h-[52px] rounded-xl font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-70 text-[15px] transition-all active:scale-95 focus:ring-4 focus:ring-zinc-200">
                <span v-if="isSubmitting">Güncelleniyor...</span>
                <span v-else>Şifreyi Güncelle</span>
            </button>
        </form>
      </div>

    </div>
  </div>
</template>
