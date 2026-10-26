
import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { fetchProducts } from "../Service/UserService";
import axiosInstance from "../Service/AxiosInstant";
import { useUser } from "./UserContext";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
    const [cartItems, setCartItems] = useState([]);
    const [token, setToken] = useState("");
    const [food_list_data, setFoodListData] = useState([]);
    const { userDetails } = useUser() || {};

    const addToCart = async (itemId, userId) => {
        console.log("Adding to cart...");
        console.log(itemId);

        try {
            await axiosInstance.post(`http://localhost:8080/user/addCart?pid=${itemId}&uid=${userId}`);
        } catch (error) {
            console.log("Error while adding to cart");
        }
        console.log(food_list_data);


        const item = food_list_data.find(i => i.id === itemId);
        const existingItem = cartItems.find(cartItem => cartItem.id === itemId);
        if (!existingItem) {
            setCartItems((prevItems) => [
                ...prevItems,
                {
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    image: item.image,
                    quantity: 1,
                    totalPrice: item.price
                }
            ]);
        } else {
            setCartItems((prevItems) =>
                prevItems.map(cartItem =>
                    cartItem.id === itemId
                        ? {
                            ...cartItem,
                            quantity: cartItem.quantity + 1,
                            totalPrice: (cartItem.quantity + 1) * item.price
                        }
                        : cartItem
                )
            );
        }
        loadCartData();
    };

    // Remove from Cart Functionality
    const removeFromCart = async (itemId, userId) => {
        try {
            await axiosInstance.post(`http://localhost:8080/user/removeCart?pid=${itemId}&uid=${userId}`);
        } catch (error) {
            console.log("Error while removing from cart");
        }

        setCartItems((prevItems) =>
            prevItems
                .map(item => item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item)
                .filter(item => item.quantity > 0)
        );
    };

    // Get total cart amount
    const getTotalCartAmount = () => {
        let totalAmount = 0;
        cartItems.forEach((item) => {
            totalAmount += item.totalPrice * item.quantity;
        });
        return totalAmount;
    };

    // Fetch all products
    const fetchFoodList = async () => {
        const response = await fetchProducts();
        // localStorage.setItem('productList', JSON.stringify(response.data)); // Store products in localStorage

        setFoodListData(response);
    };

    // Load cart data when user is logged in
    const loadCartData = async () => {
        try {
            const response = await axiosInstance.get(`${import.meta.env.VITE_API_URL}/user/cart`);
            const res = response.data;
            // localStorage.setItem('cartItems', JSON.stringify(response.data)); // Store cart items in localStorage

            const cartSummary = res?.map((item) => ({
                id: item.product.id,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                title: item.product.title,
                image: item.product.image
            }));
            setCartItems(cartSummary || []);
        } catch (error) {
            console.error("Error loading cart data:", error);
        }
    };

    // Effect to load products and cart data if user is logged in
    useEffect(() => {
        const loadData = async () => {
            if (userDetails) {
                await fetchFoodList();
                await loadCartData();
            }
        };

        loadData();
    }, [userDetails]);

    // Return context values
    const contextValue = {
        food_list_data,
        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
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
