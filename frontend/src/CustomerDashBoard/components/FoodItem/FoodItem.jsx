
// import React, { useContext } from "react";
// import { Link } from "react-router-dom";
// import "./FoodItem.css";
// import { assets } from "../../../assets/assets";
// import { StoreContext } from "../../../Context/StoreContext";
// import { useUser } from "../../../Context/UserContext";

// const FoodItem = ({ id, name, price, description, image }) => {
//   const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
//   const { userDetails } = useUser();
//   const itemInCart = cartItems.find(cartItem => cartItem.id === id);
//   console.log(id);
//   // console.log(userDetails);

//   const handleAddToCart = () => {
//     if (!userDetails) {
//       // User is not logged in, handle this case
//       alert("Please log in to add items to the cart.");
//       // You can also navigate to login page here if required
//       return;
//     }
//     addToCart(id, userDetails.id); // Proceed if user is logged in
//   };
//   return (
//     <div className="food-item">
//       <div className="food-item-image-container">
//         <Link to={`/customerdashboard/product/${id}`}>
//           <img className="food-item-image" src={image} alt="" />
//         </Link>

//         {!itemInCart ? (
//           <img
//             className="add"
//             onClick={handleAddToCart}
//             src={assets.add_icon_white}
//             alt=""
//           />
//         ) : (
//           <div className="food-item-counter">
//             <img
//               onClick={() => removeFromCart(id, userDetails.id)}
//               src={assets.remove_icon_red}
//               alt=""
//             />
//             <p>{itemInCart.quantity}</p> {/* Render quantity, not the object */}
//             <img
//               onClick={() => addToCart(id, userDetails.id)}
//               src={assets.add_icon_green}
//               alt=""
//             />
//           </div>
//         )}
//       </div>

//       <div className="food-item-info">
//         <div className="food-item-name-rating">
//           <p>{name}</p>
//           <img src={assets.rating_starts} alt="" />
//         </div>
//         <p className="food-item-desc">{description}</p>
//         <p className="food-item-price">₹{price}</p>
//       </div>
//     </div>
//   );
// };

// export default FoodItem;
// import React, { useContext, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "./FoodItem.css";
// import { assets } from "../../../assets/assets";
// import { StoreContext } from "../../../Context/StoreContext";
// import { useUser } from "../../../Context/UserContext";

// const FoodItem = ({ id, name, price, description, image }) => {
//   const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
//   const { userDetails } = useUser();
//   const navigate = useNavigate();
//   const itemInCart = cartItems.find(cartItem => cartItem.id === id);
  
//   // State to control the visibility of the login popup
//   const [showLoginPopup, setShowLoginPopup] = useState(false);

//   const handleAddToCart = () => {
//     if (!userDetails) {
//       // Show the login popup
//       setShowLoginPopup(true);
//       return;
//     }
//     addToCart(id, userDetails.id); // Proceed if user is logged in
//   };

//   const handleLoginConfirmation = (confirm) => {
//     if (confirm) {
//       // Navigate to the login page if the user confirms
//       navigate("/HomeLogin");
//     }
//     // Close the popup either way
//     setShowLoginPopup(false);
//   };

//   return (
//     <div className="food-item">
//       <div className="food-item-image-container">
//         <Link to={`/customerdashboard/product/${id}`}>
//           <img className="food-item-image" src={image} alt="" />
//         </Link>

//         {!itemInCart ? (
//           <img
//             className="add"
//             onClick={handleAddToCart}
//             src={assets.add_icon_white}
//             alt=""
//           />
//         ) : (
//           <div className="food-item-counter">
//             <img
//               onClick={() => removeFromCart(id, userDetails.id)}
//               src={assets.remove_icon_red}
//               alt=""
//             />
//             <p>{itemInCart.quantity}</p> {/* Render quantity, not the object */}
//             <img
//               onClick={() => addToCart(id, userDetails.id)}
//               src={assets.add_icon_green}
//               alt=""
//             />
//           </div>
//         )}
//       </div>

//       <div className="food-item-info">
//         <div className="food-item-name-rating">
//           <p>{name}</p>
//           <img src={assets.rating_starts} alt="" />
//         </div>
//         <p className="food-item-desc">{description}</p>
//         <p className="food-item-price">₹{price}</p>
//       </div>

//       {showLoginPopup && (
//         <div className="login-popup">
//           <div className="popup-content">
//             <h3>Login Required</h3>
//             <p>You need to log in to add items to your cart. Would you like to log in?</p>
//             <button onClick={() => handleLoginConfirmation(true)}>Yes</button>
//             <button onClick={() => handleLoginConfirmation(false)}>No</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default FoodItem;

// import React, { useContext } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import "./FoodItem.css";
// import { assets } from "../../../assets/assets";
// import { StoreContext } from "../../../Context/StoreContext";
// import { useUser } from "../../../Context/UserContext"
// import { ToastContainer, toast } from 'react-toastify';

// const FoodItem = ({ id, name, price, description, image }) => {
//   const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
//   const { userDetails } = useUser();
//   const navigate = useNavigate();
//   const itemInCart = cartItems.find(cartItem => cartItem.id === id);
  
//   const handleAddToCart = () => {
//     if (!userDetails) {      // Show toast notification
//       toast.warn("You need to log in or register to add items to your cart.", {
//         position: toast.POSITION.TOP_CENTER,
//         autoClose: 3000,
//         onClose: () => navigate("/HomeLogin"), // Navigate to login page after toast closes
//       });
//       return;
//     }
//     addToCart(id, userDetails.id); // Proceed if user is logged in
//   };

//   return (
//     <div className="food-item">
//       <div className="food-item-image-container">
//         <Link to={`/customerdashboard/product/${id}`}>
//           <img className="food-item-image" src={image} alt="" />
//         </Link>

//         {!itemInCart ? (
//           <img
//             className="add"
//             onClick={handleAddToCart}
//             src={assets.add_icon_white}
//             alt=""
//           />
//         ) : (
//           <div className="food-item-counter">
//             <img
//               onClick={() => removeFromCart(id, userDetails.id)}
//               src={assets.remove_icon_red}
//               alt=""
//             />
//             <p>{itemInCart.quantity}</p>
//             <img
//               onClick={() => addToCart(id, userDetails.id)}
//               src={assets.add_icon_green}
//               alt=""
//             />
//           </div>
//         )}
//       </div>

//       <div className="food-item-info">
//         <div className="food-item-name-rating">
//           <p>{name}</p>
//           <img src={assets.rating_starts} alt="" />
//         </div>
//         <p className="food-item-desc">{description}</p>
//         <p className="food-item-price">₹{price}</p>
//       </div>
//     </div>
//   );
// };

// export default FoodItem;
import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./FoodItem.css";
import { assets } from "../../../assets/assets";
import { StoreContext } from "../../../Context/StoreContext";
import { useUser } from "../../../Context/UserContext";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FoodItem = ({ id, name, price, description, image }) => {
  const { cartItems, addToCart, removeFromCart } = useContext(StoreContext);
  const { userDetails } = useUser();
  const navigate = useNavigate();
  const itemInCart = cartItems.find(cartItem => cartItem.id === id);
  
  const handleAddToCart = () => {
    if (!userDetails) {
      // Show toast notification
      toast.warn("You need to log in or register to add items to your cart.", {
        autoClose: 3000,
      });
      return;
    }
    addToCart(id, userDetails.id); // Proceed if user is logged in
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
              onClick={() => removeFromCart(id, userDetails.id)}
              src={assets.remove_icon_red}
              alt="Remove from cart"
            />
            <p>{itemInCart.quantity}</p>
            <img
              onClick={() => addToCart(id, userDetails.id)}
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
      <ToastContainer /> {/* Place ToastContainer here */}
    </div>
  );
};

export default FoodItem;
