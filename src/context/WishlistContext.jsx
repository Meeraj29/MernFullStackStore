import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState({ products: [] });
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("wishlist");
            setWishlist(data);
        } catch (error) {
            console.error("Error fetching wishlist:", error);
            setWishlist({ products: [] });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.role !== "admin") {
            fetchWishlist();
        } else {
            setWishlist({ products: [] });
            setLoading(false);
        }
    }, [user]);

    const toggleWishlist = async (productId) => {
        if (!user) {
            toast.error("Please login to manage wishlist");
            return;
        }
        try {
            const { data } = await api.post("wishlist/toggle", { productId });
            setWishlist(data.wishlist);
            toast.success("Wishlist updated!");
        } catch (error) {
            console.error("Error toggling wishlist:", error);
            toast.error("Failed to update wishlist");
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.products.some(item => item.productId._id === productId || item.productId === productId);
    };

    return (
        <WishlistContext.Provider value={{ wishlist, loading, toggleWishlist, isInWishlist, fetchWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};
