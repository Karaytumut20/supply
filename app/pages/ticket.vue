<script setup lang="ts">
import { ref } from 'vue'
useSeoMeta({ title: 'Support & FAQ' })

const faqs = [
  { q: 'What is Inspo Clone?', a: 'It is a curated library of website inspirations and components.' },
  { q: 'How can I submit a component?', a: 'You can submit your own component via the Submit link in the footer.' },
  { q: 'Is the source code free?', a: 'Some components are free, while premium ones require a purchase.' },
  { q: 'How do I contact support?', a: 'Use the form on the right side to create a support ticket.' }
]

const activeFaq = ref<number | null>(0)

const toggleFaq = (index: number) => {
  activeFaq.value = activeFaq.value === index ? null : index
}

const form = ref({ subject: '', message: '' })
const isSubmitting = ref(false)

const submitTicket = async () => {
  isSubmitting.value = true
  // Burada API çağrısı yapılacak: await $fetch('/api/tickets', { method: 'POST', body: form.value })
  setTimeout(() => {
    isSubmitting.value = false
    alert('Ticket submitted successfully!')
    form.value = { subject: '', message: '' }
  }, 1000)
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
              <svg :class="{'rotate-180': activeFaq === i}" class="w-5 h-5 transition-transform text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            <div v-show="activeFaq === i" class="px-6 pb-5 text-zinc-600 leading-relaxed text-sm">
              {{ faq.a }}
            </div>
          </div>
        </div>
      </div>

      <div class="w-full lg:w-1/2">
        <h2 class="text-2xl font-semibold mb-6">Submit a Ticket</h2>
        <form @submit.prevent="submitTicket" class="bg-white p-8 rounded-[2rem] border border-zinc-200 flex flex-col gap-5 shadow-xl shadow-zinc-200/50">
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
