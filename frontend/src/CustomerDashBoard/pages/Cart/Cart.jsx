import React, { useContext, useEffect } from "react";
import "./Cart.css";
import { StoreContext } from "../../../Context/StoreContext";
import { useNavigate } from "react-router-dom";
import CustomerNav from "../../../CustomerComponents/Authentication/CustomerNav";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons"; // Import the trash icon

const Cart = () => {
  const { cartItems, removeFromCart, getTotalCartAmount, loadCartData } = useContext(StoreContext);
  const navigate = useNavigate();

  // Always show the server's current cart (GET /api/cart)
  useEffect(() => {
    loadCartData();
  }, [loadCartData]);

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
            cartItems.map((item) => {
              if (item.quantity > 0) {
                return (
                  <div key={item.cartItemId ?? item.id}>
                    <div className="cart-items-title cart-items-item">
                      {item.image ? (
                        <img src={item.image} alt={item.title} />
                      ) : (
                        <img src="path/to/placeholder-image.jpg" alt="Placeholder" />
                      )}
                      <p>{item.title}</p>
                      <p>₹{item.price}</p>
                      <p>{item.quantity}</p>
                      <p>₹{item.lineTotal}</p>
                      <p onClick={() => removeFromCart(item.id)} className="x">
                        <FontAwesomeIcon icon={faTrashAlt} /> {/* Decrements quantity; removes the line at zero */}
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
            <button
              onClick={() => navigate("/customerdashboard/order")}
              disabled={!cartItems || cartItems.length === 0}
            >
              PROCEED TO CHECKOUT
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
