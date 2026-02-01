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
    stock?: number; // Add stock information
  };
  quantity: number;
  rentalDuration: number;
  rentalUnit: 'hour' | 'day' | 'week';
  unitPrice: number;
  selectedAttributes?: Record<string, string>;
  // NEW: Time-based rental fields
  rentalStartDate?: string; // ISO string
  rentalEndDate?: string;   // ISO string
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

// Get quantity of specific product already in cart
export const getProductQuantityInCart = (productId: string): number => {
  const cartItems = getCartItems();
  return cartItems
    .filter(item => item.productId === productId)
    .reduce((total, item) => total + item.quantity, 0);
};

// Check if adding quantity would exceed stock
export const canAddToCart = (productId: string, quantityToAdd: number, availableStock: number): boolean => {
  const currentQuantityInCart = getProductQuantityInCart(productId);
  const totalAfterAdd = currentQuantityInCart + quantityToAdd;
  return totalAfterAdd <= availableStock;
};

// Get maximum quantity that can be added to cart for a product
export const getMaxAddableQuantity = (productId: string, availableStock: number): number => {
  const currentQuantityInCart = getProductQuantityInCart(productId);
  return Math.max(0, availableStock - currentQuantityInCart);
};

// Add item to cart with stock validation (keep for backward compatibility)
export const addToCartWithStockCheck = (item: Omit<CartItem, 'id'>, availableStock: number): { success: boolean; message: string; maxAvailable?: number } => {
  console.log('Adding to cart with stock check:', item, 'Available stock:', availableStock);
  
  const currentQuantityInCart = getProductQuantityInCart(item.productId);
  const totalAfterAdd = currentQuantityInCart + item.quantity;
  
  if (totalAfterAdd > availableStock) {
    const maxAddable = getMaxAddableQuantity(item.productId, availableStock);
    return {
      success: false,
      message: maxAddable > 0 
        ? `Only ${maxAddable} more items can be added to cart (${currentQuantityInCart} already in cart, ${availableStock} total stock)`
        : `Cannot add more items. You already have ${currentQuantityInCart} items in cart (maximum stock: ${availableStock})`,
      maxAvailable: maxAddable
    };
  }
  
  // Proceed with normal add to cart
  addToCart(item);
  return {
    success: true,
    message: 'Item added to cart successfully'
  };
};

// Validate entire cart availability before checkout
export const validateCartAvailability = async (): Promise<{ valid: boolean; message: string; invalidItems?: any[] }> => {
  const cartItems = getCartItems();
  
  if (cartItems.length === 0) {
    return { valid: true, message: 'Cart is empty' };
  }

  try {
    const response = await fetch('/api/cart/validate-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cartItems: cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          rentalStartDate: item.rentalStartDate,
          rentalEndDate: item.rentalEndDate
        }))
      })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        valid: false,
        message: data.error || 'Failed to validate cart'
      };
    }

    return {
      valid: data.valid,
      message: data.message,
      invalidItems: data.invalidItems
    };

  } catch (error) {
    console.error('Error validating cart:', error);
    return {
      valid: false,
      message: 'Failed to validate cart availability'
    };
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

// Update item quantity with stock validation
export const updateCartItemQuantityWithStockCheck = (itemId: string, quantity: number, availableStock: number): { success: boolean; message: string } => {
  if (quantity <= 0) {
    removeFromCart(itemId);
    return { success: true, message: 'Item removed from cart' };
  }

  const cartItems = getCartItems();
  const itemIndex = cartItems.findIndex(item => item.id === itemId);
  
  if (itemIndex >= 0) {
    const item = cartItems[itemIndex];
    const otherItemsQuantity = cartItems
      .filter(cartItem => cartItem.productId === item.productId && cartItem.id !== itemId)
      .reduce((total, cartItem) => total + cartItem.quantity, 0);
    
    const totalQuantity = otherItemsQuantity + quantity;
    
    if (totalQuantity > availableStock) {
      return {
        success: false,
        message: `Cannot set quantity to ${quantity}. Maximum available: ${availableStock - otherItemsQuantity} (${availableStock} total stock, ${otherItemsQuantity} in other cart items)`
      };
    }
    
    cartItems[itemIndex].quantity = quantity;
    saveCartItems(cartItems);
    return { success: true, message: 'Quantity updated successfully' };
  }
  
  return { success: false, message: 'Item not found in cart' };
};

// Update item quantity (original function for backward compatibility)
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