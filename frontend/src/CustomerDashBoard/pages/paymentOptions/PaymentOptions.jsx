
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import './PaymentOptions.css'; // Import your CSS for styling
import axiosInstance from '../../../Service/AxiosInstant';
import { useUser } from "../../../Context/UserContext";
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

  const navigate = useNavigate();
  const location = useLocation();
  let { formData } = location.state || {};

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

  const handlePhonePeSubmit = async () => {
    if (phoneNumber) {
      formData = { ...formData, paymentType: selectedOption, email: userDetails.email };
      try {
        setLoading(true); // Set loading to true when submitting
        const response = await axiosInstance.post('/user/save-order', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        // console.log(response);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false); // Set loading to false when done
        setShowPhonePeModal(false);
        setShowSuccessModal(true);
      }
    } else {
      alert('Please enter a phone number!');
    }
  };

  const handleCardSubmit = () => {
    const { cardNumber, validThru, cvv } = cardDetails;
    if (cardNumber && validThru && cvv) {
      setLoading(true); // Set loading to true when submitting card details
      console.log(`Card payment with details: ${cardNumber}, ${validThru}, ${cvv}`);
      setShowCardModal(false);
      setShowSuccessModal(true);
      setLoading(false); // Set loading to false after processing
    } else {
      alert('Please fill all the card details!');
    }
  };

  const handlePaymentProceed = () => {
    if (selectedOption && selectedOption !== 'PhonePe' && selectedOption !== 'Card') {
      setLoading(true); // Set loading to true when proceeding with a non-modal option
      console.log(`Proceeding with ${selectedOption}`);
      setShowSuccessModal(true);
      setLoading(false); // Set loading to false when done
    } else if (!selectedOption) {
      alert('Please select a payment option!');
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
