<script setup lang="ts">
import { ref } from 'vue'
useSeoMeta({ title: 'Support & FAQ' })
const { data: user } = await useFetch('/api/auth/me')
const faqs = [
  { q: 'What is Inspo Clone?', a: 'It is a curated library of website inspirations and components.' },
  { q: 'How can I submit a component?', a: 'You can submit your own component via the Submit link in the footer.' },
  { q: 'How do I save projects?', a: 'Just click the Save button on any project modal. You need to be logged in.' }
]
const activeFaq = ref<number | null>(0)
const toggleFaq = (index: number) => activeFaq.value = activeFaq.value === index ? null : index
const form = ref({ subject: '', message: '' })
const isSubmitting = ref(false)
const successMsg = ref('')
const submitTicket = async () => {
  if (!user.value) { alert('You need to sign in to submit a ticket.'); window.location.href = '/sign-in'; return; }
  isSubmitting.value = true;
  try {
    await $fetch('/api/tickets', { method: 'POST', body: form.value })
    successMsg.value = 'Ticket submitted successfully! We will get back to you soon.'
    form.value = { subject: '', message: '' }
  } catch (error) { alert('Failed to submit ticket.') }
  finally { isSubmitting.value = false }
}
</script>
<template>
  <div class="max-w-[1200px] mx-auto py-24 px-6">
    <div class="text-center mb-16">
      <h1 class="text-4xl md:text-5xl font-bold mb-4 tracking-tight">Help & Support</h1>
      <p class="text-zinc-500 text-lg">Find answers to common questions or reach out to us directly.</p>
    </div>
    <div class="flex flex-col lg:flex-row gap-12 lg:gap-24">
      <div class="w-full lg:w-1/2">
        <h2 class="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
        <div class="flex flex-col gap-4">
          <div v-for="(faq, i) in faqs" :key="i" class="border border-zinc-200 rounded-2xl overflow-hidden bg-zinc-50/50">
            <button @click="toggleFaq(i)" class="w-full px-6 py-5 flex justify-between items-center text-left font-medium text-black hover:bg-zinc-100 transition-colors">
              {{ faq.q }}
            </button>
            <div v-show="activeFaq === i" class="px-6 pb-5 text-zinc-600 leading-relaxed text-sm">{{ faq.a }}</div>
          </div>
        </div>
      </div>
      <div class="w-full lg:w-1/2">
        <h2 class="text-2xl font-semibold mb-6">Submit a Ticket</h2>
        <form @submit.prevent="submitTicket" class="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col gap-5 shadow-xl shadow-zinc-200/50">
          <div v-if="successMsg" class="bg-emerald-50 text-emerald-600 p-4 rounded-xl text-sm border border-emerald-100">{{ successMsg }}</div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">Subject</label>
            <input v-model="form.subject" type="text" required placeholder="e.g. Account Issue" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all" />
          </div>
          <div>
            <label class="block text-sm font-medium text-zinc-700 mb-2">Message</label>
            <textarea v-model="form.message" required rows="5" placeholder="How can we help you?" class="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-5 py-4 text-black focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all resize-none"></textarea>
          </div>
          <button type="submit" :disabled="isSubmitting" class="w-full bg-black text-white py-4 mt-2 rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-70">
            {{ isSubmitting ? 'Sending...' : 'Send Message' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>