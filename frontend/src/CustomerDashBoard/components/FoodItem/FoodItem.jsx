import React, { useContext } from "react";
import { Link } from "react-router-dom";
import "./FoodItem.css";
import { assets } from "../../../assets/assets";
import { StoreContext } from "../../../Context/StoreContext";
import { useUser } from "../../../Context/UserContext";
import { normalizeRole } from "../../../Service/AxiosInstant";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const { userDetails } = useUser();
  const itemInCart = cartItems.find(cartItem => cartItem.id === id);

  const handleAddToCart = () => {
    if (!userDetails) {
      toast.warn("You need to log in or register to add items to your cart.", {
        autoClose: 3000,
      });
      return;
    }
    if (normalizeRole(userDetails.role) !== "CUSTOMER") {
      toast.warn("Only customer accounts can add items to a cart.", { autoClose: 3000 });
      return;
    }
    addToCart(id);
  };

  return (
    <div className="food-item">
      <div className="food-item-image-container">
        <Link to={`/customerdashboard/product/${id}`}>
          <img className="food-item-image" src={image} alt={name} />
        </Link>

        {!itemInCart ? (
          <img
            className="add"
            onClick={handleAddToCart}
            src={assets.add_icon_white}
            alt="Add to cart"
          />
        ) : (
          <div className="food-item-counter">
            <img
              onClick={() => removeFromCart(id)}
              src={assets.remove_icon_red}
              alt="Remove from cart"
            />
            <p>{itemInCart.quantity}</p>
            <img
              onClick={() => addToCart(id)}
              src={assets.add_icon_green}
              alt="Add more"
            />
          </div>
        )}
      </div>

      <div className="food-item-info">
        <div className="food-item-name-rating">
          <p>{name}</p>
          <img src={assets.rating_starts} alt="Rating stars" />
        </div>
        <p className="food-item-desc">{description}</p>
        <p className="food-item-price">₹{price}</p>
      </div>
      <ToastContainer />
    </div>
  );
};

export default FoodItem;
