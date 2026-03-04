import { useState, useRequestHeaders } from '#imports'

export const useCart = () => {
    const isCartOpen = useState<boolean>('cart-open', () => false)
    const cartData = useState<any>('cart-data', () => null)
    const isCartLoading = useState<boolean>('cart-loading', () => false)

    const toggleCart = () => {
        isCartOpen.value = !isCartOpen.value
    }

    const fetchCart = async () => {
        isCartLoading.value = true
        try {
            // Fetch user cart
            const data = await $fetch('/api/cart', {
                headers: useRequestHeaders(['cookie']) as HeadersInit
            })
            cartData.value = data
        } catch (e) {
            console.error('Failed to fetch cart', e)
        } finally {
            isCartLoading.value = false
        }
    }

    const addToCart = async (projectId: string, licenseType: string = 'STANDARD') => {
        try {
            const response: any = await $fetch('/api/cart/add', {
                method: 'POST',
                body: { projectId, licenseType }
            })
            await fetchCart() // Senkronize et
            isCartOpen.value = true // Çekmeceyi aç
            return response
        } catch (e: any) {
            if (e.data && e.data.statusMessage) {
                throw new Error(e.data.statusMessage)
            }
            throw e
        }
    }

    const removeFromCart = async (itemId: string) => {
        try {
            await $fetch('/api/cart/remove', {
                method: 'POST',
                body: { itemId }
            })
            await fetchCart()
        } catch (e: any) {
            console.error(e)
            throw e
        }
    }

    const checkout = async () => {
        try {
            await $fetch('/api/cart/checkout', { method: 'POST' })
            cartData.value = null // Yerel belleği temizle, API arkada boşalttı
            await fetchCart()
            return true
        } catch (e: any) {
            throw e
        }
    }

    const clearCartState = () => {
        cartData.value = null
    }

    return {
        isCartOpen,
        cartData,
        isCartLoading,
        toggleCart,
        fetchCart,
        addToCart,
        removeFromCart,
        checkout,
        clearCartState
    }
}
