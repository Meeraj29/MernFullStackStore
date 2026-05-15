import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "sonner";

const CartContext = createContext();

export function CartProvider({ children }) {
    const [cartData, setCartData] = useState({
        cart: null,
        cartCount: 0,
        loading: true
    });

    const fetchCart = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                setCartData(prev => ({ ...prev, cartCount: 0, loading: false }));
                return;
            }

            const response = await api.get("/cart/view");

            setCartData({
                cart: response.data,
                cartCount: response.data.totalItems || 0,
                loading: false
            });
        } catch (error) {
            console.error("Error fetching cart count:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
            }
            setCartData(prev => ({ ...prev, cartCount: 0, loading: false }));
        }
    };

    const addToCart = async (productId, quantity = 1) => {
        const previousData = cartData;

        // Optimistically update the local state
        if (cartData.cart) {
            let itemFound = false;
            const updatedProducts = cartData.cart.products.map(item => {
                const id = item.productId._id || item.productId;
                if (id.toString() === productId.toString()) {
                    itemFound = true;
                    return { ...item, quantity: item.quantity + quantity };
                }
                return item;
            });

            if (!itemFound) {
                // If it's a new item, we'd need the full product details to be truly optimistic
                // For now, we'll just wait for the backend for new items to avoid blank cards
            } else {
                const newTotalItems = updatedProducts.reduce((sum, item) => sum + item.quantity, 0);
                const newTotalPrice = updatedProducts.reduce((sum, item) => {
                    const price = item.productId?.price || 0;
                    return sum + (price * item.quantity);
                }, 0);

                setCartData(prev => ({
                    ...prev,
                    cart: { ...prev.cart, products: updatedProducts, totalItems: newTotalItems, totalPrice: newTotalPrice },
                    cartCount: newTotalItems
                }));
            }
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                toast.error("Please login to add items to cart");
                return false;
            }

            const response = await api.post("/cart/add", { productId, quantity });

            const newCart = response.data.cart;
            setCartData({
                cart: newCart,
                cartCount: newCart.totalItems,
                loading: false
            });
            return true;
        } catch (error) {
            console.error("Add to cart error:", error);
            setCartData(previousData);
            const message = error.response?.data?.message || "Failed to add to cart";

            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                toast.error("Your session has expired. Please login again.");
            } else {
                toast.error(message);
            }
            return false;
        }
    };

    const removeFromCart = async (productId) => {
        const previousData = cartData;

        // Optimistically update the local state
        if (cartData.cart) {
            const updatedProducts = cartData.cart.products.filter(item => {
                const id = item.productId._id || item.productId;
                return id.toString() !== productId.toString();
            });

            const newTotalItems = updatedProducts.reduce((sum, item) => sum + item.quantity, 0);
            const newTotalPrice = updatedProducts.reduce((sum, item) => {
                const price = item.productId?.price || 0;
                return sum + (price * item.quantity);
            }, 0);

            setCartData(prev => ({
                ...prev,
                cart: { ...prev.cart, products: updatedProducts, totalItems: newTotalItems, totalPrice: newTotalPrice },
                cartCount: newTotalItems
            }));
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await api.post("/cart/remove", { productId });

            const newCart = response.data.cart;
            setCartData({
                cart: newCart,
                cartCount: newCart.totalItems,
                loading: false
            });
            return true;
        } catch (error) {
            console.error("Remove from cart error:", error);
            setCartData(previousData);
            return false;
        }
    };

    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        const previousData = cartData;

        // Optimistically update the local state
        if (cartData.cart) {
            const updatedProducts = cartData.cart.products.map(item => {
                const id = item.productId._id || item.productId;
                if (id.toString() === productId.toString()) {
                    return { ...item, quantity: quantity };
                }
                return item;
            });

            const newTotalItems = updatedProducts.reduce((sum, item) => sum + item.quantity, 0);

            // Note: We only calculate price if the product data is populated
            const newTotalPrice = updatedProducts.reduce((sum, item) => {
                const price = item.productId?.price || 0;
                return sum + (price * item.quantity);
            }, 0);

            setCartData(prev => ({
                ...prev,
                cart: { ...prev.cart, products: updatedProducts, totalItems: newTotalItems, totalPrice: newTotalPrice },
                cartCount: newTotalItems
            }));
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            const response = await api.put("/cart/update", { productId, quantity });

            const newCart = response.data.cart;
            setCartData({
                cart: newCart,
                cartCount: newCart.totalItems,
                loading: false
            });
            return true;
        } catch (error) {
            console.error("Update quantity error:", error);
            setCartData(previousData);
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;

            await api.delete("/cart/clear");

            setCartData({
                cart: { products: [], totalPrice: 0, totalItems: 0 },
                cartCount: 0,
                loading: false
            });
        } catch (error) {
            console.error("Clear cart error:", error);
        }
    };

    const incrementQuantity = (productId) => addToCart(productId, 1);
    const decrementQuantity = (productId, currentQuantity) => {
        if (currentQuantity <= 1) return;
        return updateQuantity(productId, currentQuantity - 1);
    };

    useEffect(() => {
        fetchCart();
    }, []);

    return (
        <CartContext.Provider value={{
            cartCount: cartData.cartCount,
            cart: cartData.cart,
            loading: cartData.loading,
            addToCart,
            removeFromCart,
            updateQuantity,
            incrementQuantity,
            decrementQuantity,
            fetchCart,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}
