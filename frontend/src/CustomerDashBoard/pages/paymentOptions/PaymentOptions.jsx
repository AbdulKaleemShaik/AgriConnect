
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import './PaymentOptions.css'; // Import your CSS for styling
import { getErrorMessage } from '../../../Service/AxiosInstant';
import { placeOrderService } from '../../../Service/UserService';
import { useUser } from "../../../Context/UserContext";
import { StoreContext } from '../../../Context/StoreContext';
import Loading from './Loading'; // Import your Loading component
import { Player } from '@lottiefiles/react-lottie-player';
import successAnimation from '../../../assets/Lotties/payment_success.json';

function PaymentOptions() {
  const [selectedOption, setSelectedOption] = useState('');
  const [showPhonePeModal, setShowPhonePeModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    validThru: '',
    cvv: ''
  });
  const [loading, setLoading] = useState(false); // Loading state
  const { userDetails } = useUser();
  const { setCartItems, loadCartData } = useContext(StoreContext);

  const navigate = useNavigate();
  const location = useLocation();
  const { formData } = location.state || {};

  const handlePaymentSelection = (option) => {
    setSelectedOption(option);

    if (option === 'PhonePe' || option === 'Google Pay' || option === 'Paytm') {
      setShowPhonePeModal(true);
    } else {
      setShowPhonePeModal(false); // Ensure PhonePe modal is closed when another option is selected
    }

    if (option === 'Card') {
      setShowCardModal(true);
    } else {
      setShowCardModal(false); // Ensure Card modal is closed when another option is selected
    }
  };

  // POST /api/orders: checks out the whole server-side cart (one order per cart line)
  const placeOrder = async (paymentType) => {
    if (!formData) {
      toast.error('Delivery information is missing. Please fill in the delivery form first.');
      navigate('/customerdashboard/order');
      return false;
    }
    const checkout = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || userDetails?.email,
      mobileNo: formData.mobileNo,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      paymentType,
    };
    try {
      setLoading(true);
      await placeOrderService(checkout);
      setCartItems([]); // the server empties the cart on checkout
      await loadCartData();
      return true;
    } catch (error) {
      console.error(error);
      toast.error(getErrorMessage(error, 'Could not place your order. Please try again.'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handlePhonePeSubmit = async () => {
    if (phoneNumber) {
      const ok = await placeOrder(selectedOption);
      setShowPhonePeModal(false);
      if (ok) setShowSuccessModal(true);
    } else {
      alert('Please enter a phone number!');
    }
  };

  const handleCardSubmit = async () => {
    const { cardNumber, validThru, cvv } = cardDetails;
    if (cardNumber && validThru && cvv) {
      const ok = await placeOrder('Card');
      setShowCardModal(false);
      if (ok) setShowSuccessModal(true);
    } else {
      alert('Please fill all the card details!');
    }
  };

  const handlePaymentProceed = async () => {
    if (!selectedOption) {
      alert('Please select a payment option!');
    } else if (selectedOption === 'Card') {
      setShowCardModal(true);
    } else if (['PhonePe', 'Google Pay', 'Paytm'].includes(selectedOption)) {
      setShowPhonePeModal(true);
    } else {
      const ok = await placeOrder(selectedOption);
      if (ok) setShowSuccessModal(true);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/customerdashboard');
  };

  const closeModal = () => {
    setShowPhonePeModal(false);
    setShowCardModal(false);
  };

  return (
    <div className="payment-options-container">
      {loading && <Loading />} {/* Conditionally render Loading component */}
      {!loading && (
        <>
          <h2>Select Payment Method</h2>
          <div className="payment-options">
            <button onClick={() => handlePaymentSelection('Card')}>Card</button>
            <button onClick={() => handlePaymentSelection('PhonePe')}>PhonePe</button>
            <button onClick={() => handlePaymentSelection('Google Pay')}>Google Pay</button>
            <button onClick={() => handlePaymentSelection('Paytm')}>Paytm</button>
            <button onClick={() => handlePaymentSelection('Cash on Delivery')}>Cash on Delivery</button>
          </div>

          <button className="proceed-button" onClick={handlePaymentProceed}>
            Proceed with {selectedOption ? selectedOption : '...'}
          </button>

          {showPhonePeModal && (
            <div className="phonepe-modal">
              <div className="phonepe-modal-content">
                <button className="close-modal-button" onClick={closeModal}>×</button>
                <h3>Enter {selectedOption} Number</h3>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <button className="phonepe-submit-button" onClick={handlePhonePeSubmit}>
                  Submit
                </button>
              </div>
            </div>
          )}

          {showCardModal && (
            <div className="card-modal">
              <div className="card-modal-content">
                <button className="close-modal-button" onClick={closeModal}>×</button>
                <h3>Enter Card Details</h3>
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardDetails.cardNumber}
                  onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Valid Thru (MM/YY)"
                  value={cardDetails.validThru}
                  onChange={(e) => setCardDetails({ ...cardDetails, validThru: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="CVV"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                />
                <button className="card-submit-button" onClick={handleCardSubmit}>
                  Submit
                </button>
              </div>
            </div>
          )}

          {showSuccessModal && (
            <div className="success-modal">
              <div className="success-modal-content">
                <button className="close-modal-button" onClick={closeSuccessModal}>×</button>
                <Player
                  autoplay
                  loop={true}
                  src={successAnimation}
                  style={{ width: 300, height: 300 }}
                />

              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default PaymentOptions;
