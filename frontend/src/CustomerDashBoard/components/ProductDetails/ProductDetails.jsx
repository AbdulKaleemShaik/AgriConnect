import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { assetUrl, getErrorMessage, normalizeRole } from "../../../Service/AxiosInstant";
import { fetchProductsById } from "../../../Service/UserService";
import styles from "./ProductDetails.module.css";
import { StoreContext } from "../../../Context/StoreContext"; // Import StoreContext
import CustomerNav from "../../../CustomerComponents/Authentication/CustomerNav";
import { useUser } from "../../../Context/UserContext";
import { ToastContainer, toast } from "react-toastify"; // Import ToastContainer and toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for Toastify

const ProductDetails = () => {
    const { id } = useParams(); // Get product id from URL
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const { addToCart } = useContext(StoreContext); // Use addToCart from StoreContext
    const navigate = useNavigate();
    const { userDetails } = useUser();

    // Fetch product details by id
    useEffect(() => {
        fetchProductsById(id)
            .then((data) => {
                setProduct(data);
            })
            .catch((err) => {
                console.error("Error fetching product details:", err);
                setError(getErrorMessage(err, "Product not found."));
            });
    }, [id]);

    // Handle adding product to cart using StoreContext
    const handleAddToCart = () => {
        if (userDetails && product) {
            if (normalizeRole(userDetails.role) !== "CUSTOMER") {
                toast.warning("Only customer accounts can add items to a cart.", { autoClose: 3000 });
                return;
            }
            addToCart(product.id).then((ok) => ok && toast.success("Added to cart", { autoClose: 1500 }));
        } else {
            // Show warning message if user is not logged in
            toast.warning("Please login to add product to cart!", {
              
                autoClose: 3000, // Auto close after 3 seconds
            });
        }
    };

    // If product is not loaded yet
    if (error) {
        return <p>{error}</p>;
    }
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
                        src={assetUrl(product.imageUrl)}
                        alt={product.title}
                        className={styles.product_image}
                    />
                    <div className={styles.product_description}>
                        <h1>{product.title}</h1>
                        <p>{product.description}</p>
                        <p className={styles.price}>Price: ₹{product.discountPrice ?? product.price}</p>
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
