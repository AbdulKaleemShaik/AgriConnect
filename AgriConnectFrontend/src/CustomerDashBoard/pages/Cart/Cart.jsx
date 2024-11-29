// import React, { useContext } from "react";
// import "./Cart.css";
// import { StoreContext } from "../../../Context/StoreContext";
// import { useNavigate } from "react-router-dom";
// import CustomerNav from "../../../CustomerComponents/Authentication/CustomerNav";
// import axiosInstance from "../../../Service/AxiosInstant";
// import { useUser } from "../../../Context/UserContext";
// const Cart = () => {
//   const { cartItems, food_list_data, removeFromCart, getTotalCartAmount, url } =
//     useContext(StoreContext);
//   const navigate = useNavigate();
//   const { userDetails } = useUser();
//   return (
//     <>
//       <CustomerNav />
//       <div className="cart">
//         <div className="cart-items">
//           <div className="cart-items-title">
//             <p>Items</p>
//             <p>Title</p>
//             <p>Price</p>
//             <p>Quantity</p>
//             <p>Total</p>
//             <p>Remove</p>
//           </div>
//           <br />
//           <hr />
//           {cartItems && cartItems.length > 0 ? (
//             cartItems.map((item, index) => {
//               if (item.quantity > 0) {
//                 return (
//                   <div key={index}>
//                     <div className="cart-items-title cart-items-item">
//                       <img src={`${import.meta.env.VITE_API_URL}/img/product_img/${item.image}`} alt={item.title} />
//                       <p>{item.title}</p>
//                       <p>${item.totalPrice}</p>
//                       <p>{item.quantity}</p>
//                       <p>${item.totalPrice * item.quantity}</p>
//                       <p onClick={() => removeFromCart(item.id, userDetails.id)} className="x">x</p>
//                     </div>
//                     <hr />
//                   </div>
//                 );
//               }
//               return null;
//             })
//           ) : (
//             <p>Your cart is empty.</p>
//           )}

//         </div>
//         <div className="cart-bottom">
//           <div className="cart-total">
//             <h2>Cart Totals</h2>
//             <div>
//               <div className="cart-total-details">
//                 <p>Subtotal</p>
//                 <p>${getTotalCartAmount()}</p>
//               </div>
//               <hr />

//               <div className="cart-total-details">
//                 <p>Delivery Fee</p>
//                 <p>${getTotalCartAmount() === 0 ? 0 : 2}</p>
//               </div>
//               <hr />
//               <div className="cart-total-details">
//                 <b>Total</b>
//                 <b>
//                   ${getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
//                 </b>
//               </div>
//             </div>
//             <button onClick={() => navigate("/customerdashboard/order")}>
//               PROCEED TO CHECKOUT
//             </button>
//           </div>
//           {/* <div className="cart-promocode">
//             <div>
//               <p>If you have promo code, Enter it here</p>
//               <div className="cart-promocode-input">
//                 <input type="text" placeholder="promo code" />
//                 <button>Submit</button>
//               </div>
//             </div>
//           </div> */}
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;





// import React, { useContext } from "react";
// import "./Cart.css";
// import { useEffect } from "react";
// import axiosInstance from "../../../Service/AxiosInstant";
// import { StoreContext } from "../../../Context/StoreContext";
// import { useNavigate } from "react-router-dom";
// import CustomerNav from "../../../CustomerComponents/Authentication/CustomerNav";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"; // Import the trash icon
// import { useUser } from "../../../Context/UserContext";

// const Cart = () => {
//   const { cartItems, removeFromCart, getTotalCartAmount, setCartItems } = useContext(StoreContext);
//   const navigate = useNavigate();
//   const { userDetails } = useUser();

//   useEffect(() => {

//     axiosInstance.get(`${import.meta.env.VITE_API_URL}/user/cart`).then((response) => {
//       console.log(response);
//       setCartItems(response.data);
//     });
//   }, []);
// console.log(cartItems);

//   return (
//     <>
//       <CustomerNav />
//       <div className="cart">
//         <div className="cart-items">
//           <div className="cart-items-title">
//             <p>Items</p>
//             <p>Title</p>
//             <p>Price</p>
//             <p>Quantity</p>
//             <p>Total</p>
//             <p>Remove</p>
//           </div>
//           <br />
//           <hr />
//           {cartItems && cartItems.length > 0 ? (
//             cartItems.map((item, index) => {
//               if (item.quantity > 0) {
//                 return (
//                   <div key={index}>
//                     <div className="cart-items-title cart-items-item">
//                       <img
//                         src={`${import.meta.env.VITE_API_URL}/img/product_img/${item.product.image}`}
//                         alt={item.title}
//                       />
//                       <p>{item.title}</p>
//                       <p>₹{item.totalPrice}</p>
//                       <p>{item.quantity}</p>
//                       <p>₹{item.totalPrice * item.quantity}</p>
//                       <p onClick={() => removeFromCart(item.id, userDetails.id)} className="x">
//                         <FontAwesomeIcon icon={faTrashAlt} /> {/* Replace X with the trash icon */}
//                       </p>
//                     </div>
//                     <hr />
//                   </div>
//                 );
//               }
//               return null;
//             })
//           ) : (
//             <p>Your cart is empty.</p>
//           )}
//         </div>

//         <div className="cart-bottom">
//           <div className="cart-total">
//             <h2>Cart Totals</h2>
//             <div>
//               <div className="cart-total-details">
//                 <p>Subtotal</p>
//                 <p>₹{getTotalCartAmount()}</p>
//               </div>
//               <hr />

//               <div className="cart-total-details">
//                 <p>Delivery Fee</p>
//                 <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
//               </div>
//               <hr />
//               <div className="cart-total-details">
//                 <b>Total</b>
//                 <b>
//                   ₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
//                 </b>
//               </div>
//             </div>
//             <button onClick={() => navigate("/customerdashboard/order")}>
//               PROCEED TO CHECKOUT
//             </button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Cart;







import React, { useContext, useEffect } from "react";
import "./Cart.css";
import axiosInstance from "../../../Service/AxiosInstant";
import { StoreContext } from "../../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import CustomerNav from "../../../CustomerComponents/Authentication/CustomerNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"; // Import the trash icon
import { useUser } from "../../../Context/UserContext";

const Cart = () => {
  const { cartItems, removeFromCart, getTotalCartAmount, setCartItems } = useContext(StoreContext);
  const navigate = useNavigate();
  const { userDetails } = useUser();

  useEffect(() => {
    axiosInstance.get(`${import.meta.env.VITE_API_URL}/user/cart`).then((response) => {
      //console.log(response);
      setCartItems(response.data);
    });
  }, []);

//  console.log(cartItems);

  return (
    <>
      <CustomerNav />
      <div className="cart">
        <div className="cart-items">
          <div className="cart-items-title">
            <p>Items</p>
            <p>Title</p>
            <p>Price</p>
            <p>Quantity</p>
            <p>Total</p>
            <p>Remove</p>
          </div>
          <br />
          <hr />
          {cartItems && cartItems.length > 0 ? (
            cartItems.map((item, index) => {
              if (item.quantity > 0) {
                return (
                  <div key={index}>
                    <div className="cart-items-title cart-items-item">
                      {/* Check if item.product and item.product.image are defined */}
                      {item.product && item.product.image ? (
                        <img
                          src={`${import.meta.env.VITE_API_URL}/img/product_img/${item.product.image}`}
                          alt={item.title}
                        />
                      ) : (
                        <img src="path/to/placeholder-image.jpg" alt="Placeholder" />
                      )}
                      {console.log(item.title)}
                      <p>{item.title}</p>
                      <p>₹{item.totalPrice}</p>
                      <p>{item.quantity}</p>
                      <p>₹{item.totalPrice * item.quantity}</p>
                      <p onClick={() => removeFromCart(item.id, userDetails.id)} className="x">
                        <FontAwesomeIcon icon={faTrashAlt} /> {/* Replace X with the trash icon */}
                      </p>
                    </div>
                    <hr />
                  </div>
                );
              }
              return null;
            })
          ) : (
            <p>Your cart is empty.</p>
          )}
        </div>

        <div className="cart-bottom">
          <div className="cart-total">
            <h2>Cart Totals</h2>
            <div>
              <div className="cart-total-details">
                <p>Subtotal</p>
                <p>₹{getTotalCartAmount()}</p>
              </div>
              <hr />

              <div className="cart-total-details">
                <p>Delivery Fee</p>
                <p>₹{getTotalCartAmount() === 0 ? 0 : 2}</p>
              </div>
              <hr />
              <div className="cart-total-details">
                <b>Total</b>
                <b>
                  ₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}
                </b>
              </div>
            </div>
            <button onClick={() => navigate("/customerdashboard/order")}>
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
