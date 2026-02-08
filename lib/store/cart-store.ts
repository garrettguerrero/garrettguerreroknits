import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItemType = 'pattern' | 'bundle'

export interface CartItem {
  id: string
  type: CartItemType
  title: string
  price: number
  coverImage?: string
  slug: string
}

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, type: CartItemType) => void
  clearCart: () => void
  getItemCount: () => number
  getTotal: () => number
  hasItem: (id: string, type: CartItemType) => boolean
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items, hasItem } = get()

        // Prevent duplicate patterns and bundles (but not future merchandise)
        if ((item.type === 'pattern' || item.type === 'bundle') && hasItem(item.id, item.type)) {
          // Item already in cart, don't add again
          return
        }

        set({ items: [...items, item] })
      },

      removeItem: (id, type) => {
        set((state) => ({
          items: state.items.filter((item) => !(item.id === id && item.type === type)),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemCount: () => {
        return get().items.length
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price, 0)
      },

      hasItem: (id, type) => {
        return get().items.some((item) => item.id === id && item.type === type)
      },
    }),
    {
      name: 'cart-storage', // localStorage key
      skipHydration: false, // Hydrate immediately
    }
  )
)
