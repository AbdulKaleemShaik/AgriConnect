import React, { useContext, useState } from 'react';
import './PlaceOrder.css';
import { StoreContext } from '../../../Context/StoreContext';
import CustomerNav from '../../../CustomerComponents/Authentication/CustomerNav';
import { useNavigate } from "react-router-dom";
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone } from 'react-icons/ai';
import './PlaceOrder.css';



function PlaceOrder() {
  const { getTotalCartAmount } = useContext(StoreContext);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    mobileNo: ''
  });
  const navigate = useNavigate();


  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) newErrors.firstName = "First Name is required";
    if (!formData.lastName) newErrors.lastName = "Last Name is required";
    // if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Valid Email is required";
    if (!formData.address) newErrors.street = "Street address is required";
    if (!formData.city) newErrors.city = "City is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.pincode || !/^\d{5,6}$/.test(formData.pincode)) newErrors.zipCode = "Valid Zip Code is required";
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.mobileNo || !/^\d{10}$/.test(formData.mobileNo)) newErrors.phone = "Valid 10-digit phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Form is valid and ready for submission!");
      navigate('/customerdashboard/paymentoptions', { state: { formData } }); // Navigate to PaymentOptions with form data
    }

  };

  return (
    <>
      <CustomerNav />
      <form className="place-order" onSubmit={handleSubmit}>
        <div className="place-order-left">
          <p className="title">Delivery Information</p>

          <div className="multi-fields">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleInputChange}
            />
            {errors.firstName && <span className="error">{errors.firstName}</span>}

            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleInputChange}
            />
            {errors.lastName && <span className="error">{errors.lastName}</span>}
          </div>

          <div className="icon-input-container">
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>


          <input
            type="text"
            name="address"
            placeholder="Street"
            value={formData.address}
            onChange={handleInputChange}
          />
          {errors.street && <span className="error">{errors.street}</span>}

          <div className="multi-fields">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleInputChange}
            />
            {errors.city && <span className="error">{errors.city}</span>}

            <select
              name="state"
              value={formData.state}
              onChange={handleInputChange}
            >
              <option value="">Select State</option>
              <option value="AP">Andhra Pradesh</option>
              <option value="AR">Arunachal Pradesh</option>
              <option value="AS">Assam</option>
              <option value="BR">Bihar</option>
              <option value="CT">Chhattisgarh</option>
              <option value="GA">Goa</option>
              <option value="GJ">Gujarat</option>
              <option value="HR">Haryana</option>
              <option value="HP">Himachal Pradesh</option>
              <option value="JK">Jammu and Kashmir</option>
              <option value="JH">Jharkhand</option>
              <option value="KA">Karnataka</option>
              <option value="KL">Kerala</option>
              <option value="MP">Madhya Pradesh</option>
              <option value="MH">Maharashtra</option>
              <option value="MN">Manipur</option>
              <option value="ML">Meghalaya</option>
              <option value="MZ">Mizoram</option>
              <option value="NL">Nagaland</option>
              <option value="OD">Odisha</option>
              <option value="PB">Punjab</option>
              <option value="RJ">Rajasthan</option>
              <option value="SK">Sikkim</option>
              <option value="TN">Tamil Nadu</option>
              <option value="TG">Telangana</option>
              <option value="TR">Tripura</option>
              <option value="UP">Uttar Pradesh</option>
              <option value="UT">Uttarakhand</option>
              <option value="WB">West Bengal</option>
              {/* Add other states here */}
            </select>
            {errors.state && <span className="error">{errors.state}</span>}
          </div>

          <div className="multi-fields">
            <input
              type="text"
              name="pincode"
              placeholder="Zip Code"
              value={formData.pincode}
              onChange={handleInputChange}
            />
            {errors.zipCode && <span className="error">{errors.zipCode}</span>}

            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
            >
              <option value="">Select Country</option>
              <option value="IN">India</option>
              <option value="US">United States</option>
              <option value="UK">United Kingdom</option>
              <option value="AU">Australia</option>
              <option value="CA">Canada</option>
              {/* Add other countries here */}
            </select>
            {errors.country && <span className="error">{errors.country}</span>}
          </div>

          <input
            type="text"
            name="mobileNo"
            placeholder="Phone"
            value={formData.mobileNo}
            onChange={handleInputChange}
          />
          {errors.phone && <span className="error">{errors.phone}</span>}
        </div>

        <div className="place-order-right">
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
                <b>₹{getTotalCartAmount() === 0 ? 0 : getTotalCartAmount() + 2}</b>
              </div>
            </div>
            <button type="submit">PROCEED TO PAYMENT</button>
          </div>
        </div>
      </form>
    </>
  );
}

export default PlaceOrder;
