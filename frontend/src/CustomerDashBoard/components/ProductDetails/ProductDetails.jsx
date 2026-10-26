import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../../Service/AxiosInstant";
import styles from "./ProductDetails.module.css";
import { StoreContext } from "../../../Context/StoreContext"; // Import StoreContext
import CustomerNav from "../../../CustomerComponents/Authentication/CustomerNav";
import { useUser } from "../../../Context/UserContext";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toastify

const ProductDetails = () => {
    const { id } = useParams(); // Get product id from URL
    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1); // For handling quantity
    const { addToCart } = useContext(StoreContext); // Use addToCart from StoreContext
    const navigate = useNavigate();
    const { userDetails } = useUser();

    // Fetch product details by id
    useEffect(() => {
        axiosInstance
            .get(`/product/${id}`)
            .then((res) => {
                setProduct(res.data);
            })
            .catch((err) => {
                console.error("Error fetching product details:", err);
            });
    }, [id]);

    // Handle adding product to cart using StoreContext
    const handleAddToCart = () => {
        if (userDetails && product) {
            addToCart(product.id, userDetails.id);
        } else {
            // Show warning message if user is not logged in
            toast.warning("Please login to add product to cart!", {
              
                autoClose: 3000, // Auto close after 3 seconds
            });
        }
    };

    // If product is not loaded yet
    if (!product) {
        return <p>Loading product details...</p>;
    }

    return (
        <>
            <CustomerNav />
            <ToastContainer /> {/* Render the ToastContainer here */}
            <div className={styles.product_details_container}>
                <div className={styles.product_info}>
                    <img
                        src={`${import.meta.env.VITE_API_URL}/img/product_img/${product.image}`}
                        alt={product.name}
                        className={styles.product_image}
                    />
                    <div className={styles.product_description}>
                        <h1>{product.name}</h1>
                        <p>{product.description}</p>
                        <p className={styles.price}>Price: ${product.price}</p>
                        {/* Uncomment if you want to add a quantity selector */}
                        {/* <div className={styles.quantity_selector}>
                            <label htmlFor="quantity">Quantity: </label>
                            <input
                                type="number"
                                id="quantity"
                                value={quantity}
                                min="1"
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </div> */}
                        <button className={styles.add_to_cart_btn} onClick={handleAddToCart}>
                            Add to Cart
                        </button>
                    </div>
                </div>
                <div className={styles.additional_info}>
                    <h2>Product Details</h2>
                    <ul>
                        <li>Category: {product.category}</li>
                        <li>Stock: {product.stock}</li>
                        <li>Discount: {product.discount ? `${product.discount}%` : "None"}</li>
                    </ul>
                </div>
            </div>
        </>
    );
};

export default ProductDetails;
