import React, { useEffect, useState } from "react";
import styles from "./TransactionPage.module.css";
import NavBar from "../NavBar/NavBar";
import codimg from "../../assets/Images/cod.jpg"
import netbanking from "../../assets/Images/netbanking.jpg"
import { toast } from "react-toastify";
import { getAllOrders } from "../../Service/FarmerService";
import { getErrorMessage } from "../../Service/AxiosInstant";

// Maps a farmer-side OrderResponse to a transaction row (cancelled orders are not transactions)
const toTransaction = (order) => {
  const a = order.shippingAddress || {};
  return {
    id: order.id,
    productName: order.product?.title,
    name: [a.firstName, a.lastName].filter(Boolean).join(" "),
    phoneNumber: a.mobileNo,
    address: [a.address, a.city, a.state, a.pincode].filter(Boolean).join(", "),
    quantity: order.quantity,
    amount: `₹${order.totalPrice}`,
    paymentOption: order.paymentType,
  };
};

function TransactionPage(){
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    getAllOrders()
      .then((orders) => setTransactions(orders.filter((o) => o.status !== "CANCELLED").map(toTransaction)))
      .catch((error) => toast.error(getErrorMessage(error, "Failed to load transactions")));
  }, []);

  return (
    <div className={styles.container}>
     <NavBar />
      <div className={styles.content}>
        <h1 className={styles.title}>TRANSACTION <span>HISTORY</span></h1>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Name</th>
              <th>Phone Number</th>
              <th>Delivery Address</th>
              <th>Quantity</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.productName}</td>
                <td>{transaction.name}</td>
                <td>{transaction.phoneNumber}</td>
                <td>{transaction.address}</td>
                <td>{transaction.quantity}</td>
                <td>{transaction.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className={styles.paymentOptions}>
          <h3>Payment Option</h3>
          <div className={styles.paymentImages}>
            <img src={netbanking}alt="Paytm" />
            <img src={codimg} alt="COD" />
          </div>
        </div>
      </div>
      <footer className={styles.footer}>
        <p>© 2023 Company, Inc</p>
        <ul className={styles.footerLinks}>
          <li>Home</li>
          <li>Features</li>
          <li>Pricing</li>
          <li>FAQs</li>
          <li>About</li>
        </ul>
      </footer>
    </div>
  );
};

export default TransactionPage;
