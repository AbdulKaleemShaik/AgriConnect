import { createContext, useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
    fetchProducts,
    getCartService,
    addCartItemService,
    updateCartItemService,
    removeCartItemService,
} from "../Service/UserService";
import { assetUrl, getErrorMessage, normalizeRole } from "../Service/AxiosInstant";
import { useUser } from "./UserContext";

export const StoreContext = createContext(null);

const EMPTY_CART = { items: [], totalQuantity: 0, totalAmount: 0 };

/** Flattens a CartResponse item into the shape the UI components use (id = product id). */
const toCartItem = (item) => ({
    id: item.product?.id,
    cartItemId: item.id,
    title: item.product?.title,
    image: assetUrl(item.product?.imageUrl),
    price: Number(item.unitPrice ?? 0),
    quantity: item.quantity,
    lineTotal: Number(item.lineTotal ?? 0),
    stock: item.product?.stock,
    product: item.product,
});

const StoreContextProvider = (props) => {
    const [cart, setCart] = useState(EMPTY_CART);
    const [token, setToken] = useState("");
    const [food_list_data, setFoodListData] = useState([]);
    const { userDetails } = useUser() || {};
    const isCustomer = normalizeRole(userDetails?.role) === "CUSTOMER";

    const cartItems = (cart.items || []).map(toCartItem);

    const applyCart = (cartResponse) => setCart(cartResponse || EMPTY_CART);

    // Replace the cart contents locally (e.g. after checkout empties it server-side)
    const setCartItems = (items) => {
        if (!items || items.length === 0) setCart(EMPTY_CART);
    };

    // Load the authenticated customer's cart
    const loadCartData = useCallback(async () => {
        try {
            applyCart(await getCartService());
        } catch (error) {
            console.error("Error loading cart data:", error);
        }
    }, []);

    const addToCart = async (productId, quantity = 1) => {
        try {
            applyCart(await addCartItemService(productId, quantity));
            return true;
        } catch (error) {
            toast.error(getErrorMessage(error, "Could not add the item to your cart."));
            return false;
        }
    };

    // Decrements the quantity by one; removes the line when it reaches zero
    const removeFromCart = async (productId) => {
        const existing = cartItems.find((item) => item.id === productId);
        try {
            if (existing && existing.quantity > 1) {
                applyCart(await updateCartItemService(productId, existing.quantity - 1));
            } else {
                await removeCartItemService(productId);
                await loadCartData();
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Could not update your cart."));
        }
    };

    // Removes the whole line regardless of quantity
    const deleteFromCart = async (productId) => {
        try {
            await removeCartItemService(productId);
            await loadCartData();
        } catch (error) {
            toast.error(getErrorMessage(error, "Could not update your cart."));
        }
    };

    // Grand total as computed by the server (discounted prices)
    const getTotalCartAmount = () => Number(cart.totalAmount || 0);

    // Fetch products (first page of the public catalogue)
    const fetchFoodList = async () => {
        try {
            setFoodListData(await fetchProducts());
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    // Load the cart whenever a customer logs in; clear it on logout
    useEffect(() => {
        if (userDetails && isCustomer) {
            loadCartData();
        } else {
            setCart(EMPTY_CART);
        }
    }, [userDetails, isCustomer, loadCartData]);

    const contextValue = {
        food_list_data,
        cartItems,
        cart,
        setCartItems,
        addToCart,
        removeFromCart,
        deleteFromCart,
        getTotalCartAmount,
        token,
        setToken,
        loadCartData,
        fetchFoodList,
        setFoodListData,
    };

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    );
};

export default StoreContextProvider;
