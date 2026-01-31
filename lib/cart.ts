// Cart utility functions

export interface CartItem {
  id: string;
  productId: string;
  product: {
    id: string;
    name: string;
    image: string;
    vendor: string;
    vendorId: string;
  };
  quantity: number;
  rentalDuration: number;
  rentalUnit: 'hour' | 'day' | 'week';
  unitPrice: number;
  selectedAttributes?: Record<string, string>;
}

// Get cart items from localStorage
export const getCartItems = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const items = localStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error('Error loading cart items:', error);
    return [];
  }
};

// Save cart items to localStorage
export const saveCartItems = (items: CartItem[]): void => {
  if (typeof window === 'undefined') return;
  
  try {
    console.log('Saving cart items to localStorage:', items); // Debug log
    localStorage.setItem('cartItems', JSON.stringify(items));
    // Dispatch custom event to update cart count in header
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    console.log('Cart updated event dispatched'); // Debug log
  } catch (error) {
    console.error('Error saving cart items:', error);
  }
};

// Add item to cart
export const addToCart = (item: Omit<CartItem, 'id'>): void => {
  console.log('Adding to cart:', item); // Debug log
  const cartItems = getCartItems();
  console.log('Current cart items:', cartItems); // Debug log
  
  const existingItemIndex = cartItems.findIndex(
    cartItem => 
      cartItem.productId === item.productId && 
      cartItem.rentalUnit === item.rentalUnit &&
      JSON.stringify(cartItem.selectedAttributes) === JSON.stringify(item.selectedAttributes)
  );

  if (existingItemIndex >= 0) {
    // Update existing item
    cartItems[existingItemIndex].quantity += item.quantity;
    cartItems[existingItemIndex].rentalDuration = item.rentalDuration;
  } else {
    // Add new item
    const newItem: CartItem = {
      ...item,
      id: `${item.productId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    cartItems.push(newItem);
  }

  console.log('Updated cart items:', cartItems); // Debug log
  saveCartItems(cartItems);
};

// Remove item from cart
export const removeFromCart = (itemId: string): void => {
  const cartItems = getCartItems();
  const updatedItems = cartItems.filter(item => item.id !== itemId);
  saveCartItems(updatedItems);
};

// Update item quantity
export const updateCartItemQuantity = (itemId: string, quantity: number): void => {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return;
  }

  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    cartItems[itemIndex].quantity = quantity;
    saveCartItems(cartItems);
  }
};

// Update item rental duration
export const updateCartItemDuration = (itemId: string, duration: number): void => {
  if (duration <= 0) return;

  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    cartItems[itemIndex].rentalDuration = duration;
    saveCartItems(cartItems);
  }
};

// Check if product is already in cart
export const isProductInCart = (productId: string): boolean => {
  const cartItems = getCartItems();
  return cartItems.some(item => item.productId === productId);
};

// Get cart total count
export const getCartCount = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => total + item.quantity, 0);
};

// Get cart total price
export const getCartTotal = (): number => {
  const cartItems = getCartItems();
  return cartItems.reduce((total, item) => {
    return total + (item.unitPrice * item.quantity * item.rentalDuration);
  }, 0);
};

// Clear cart
export const clearCart = (): void => {
  saveCartItems([]);
};