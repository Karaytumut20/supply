import Lenis from 'lenis'

export default defineNuxtPlugin((nuxtApp) => {
  const lenis = new Lenis({
    duration: 1.0, // Scroll hissini biraz daha duyarlı yaptık
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
  })

  function raf(time: number) {
    lenis.raf(time)
    requestAnimationFrame(raf)
  }
  requestAnimationFrame(raf)

  // Sayfa geçişlerinde ve yenilenmesinde en tepeye anında çıkmayı zorla
  nuxtApp.hook('page:start', () => {
    window.scrollTo(0, 0)
    lenis.scrollTo(0, { immediate: true })
  })
})
