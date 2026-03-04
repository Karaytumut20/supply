<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from '#imports'

const email = ref('')
const isSubmitting = ref(false)
const isSuccess = ref(false)
const { addToast } = useToast()

const handleSubmit = async () => {
  if (!email.value) {
    addToast('Lütfen e-posta adresinizi girin.', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const res = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { email: email.value }
    })
    isSuccess.value = true
    addToast(res.message || 'Sıfırlama bağlantısı gönderildi.', 'success')
  } catch (err: any) {
    addToast(err.data?.message || 'Bir hata oluştu.', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#fafafa] flex items-center justify-center p-5 pt-24">
    <div class="w-full max-w-[400px] bg-white rounded-3xl p-8 shadow-[0_20px_40px_rgba(0,0,0,0.04)] border border-zinc-200">
      
      <div v-if="!isSuccess">
        <div class="mb-8 text-center">
            <h1 class="text-2xl font-black tracking-tight text-black mb-2">Şifremi Unuttum</h1>
            <p class="text-sm font-medium text-zinc-500 leading-relaxed">E-posta adresinizi girin, size şifrenizi sıfırlamanız için bir bağlantı gönderelim.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
            <div>
                <label class="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">E-Posta Adresi</label>
                <input v-model="email" type="email" placeholder="ornek@mail.com" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-[15px] font-medium text-black outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" />
            </div>

            <button type="submit" :disabled="isSubmitting" class="mt-4 w-full bg-black hover:bg-zinc-800 text-white h-[52px] rounded-xl font-bold shadow-md flex items-center justify-center gap-2 disabled:opacity-70 text-[15px] transition-all active:scale-95 focus:ring-4 focus:ring-zinc-200">
                <span v-if="isSubmitting">Gönderiliyor...</span>
                <span v-else>Bağlantı Gönder</span>
            </button>
        </form>
      </div>

      <div v-else class="text-center py-6">
          <div class="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon name="lucide:mail-check" class="w-8 h-8 text-emerald-600" />
          </div>
          <h2 class="text-xl font-bold text-black mb-3">E-postanızı Kontrol Edin</h2>
          <p class="text-sm text-zinc-500 font-medium leading-relaxed mb-6">Eğer sistemimizde kayıtlı bir hesabınız varsa, şifre sıfırlama bağlantısı gönderildi.</p>
          <NuxtLink to="/sign-in" class="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
              Giriş Ekranına Dön
          </NuxtLink>
      </div>

      <p v-if="!isSuccess" class="mt-8 text-center text-[13px] font-medium text-zinc-500">
        Hatırladınız mı? 
        <NuxtLink to="/sign-in" class="text-black font-bold hover:underline">Giriş Yap</NuxtLink>
      </p>

    </div>
  </div>
</template>
