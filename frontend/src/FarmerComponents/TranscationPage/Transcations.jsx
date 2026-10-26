import React from "react";
import styles from "./TransactionPage.module.css";
import NavBar from "../NavBar/NavBar";
import codimg from "../../assets/Images/cod.jpg"
import netbanking from "../../assets/Images/netbanking.jpg"
const transactions = [
  {
    productName: "Product 1",
    name: "Farmer 1",
    phoneNumber: "1234567890",
    address: "123 Main St, City",
    quantity: 10,
    amount: "₹1000",
    paymentOption: "Paytm",
  },
  {
    productName: "Product 2",
    name: "Farmer 2",
    phoneNumber: "0987654321",
    address: "456 Market St, City",
    quantity: 20,
    amount: "₹2000",
    paymentOption: "COD",
  },
];

function TransactionPage(){
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
            {transactions.map((transaction, index) => (
              <tr key={index}>
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
