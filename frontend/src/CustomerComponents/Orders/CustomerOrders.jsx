import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import NavBar from '../../CustomerDashBoard/components/Navbar/Navbar';
import styles from './CustomerOrders.module.css';
import {getAllOrders} from '../../Service/FarmerService'; // Import the service

const customerOrders = () => {
  // State to store fetched orders
  const [orders, setOrders] = useState([]);

  // Fetch orders from the backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders();
        setOrders(response.data.orders); 
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []); // Empty dependency array to ensure the effect runs only once when the component mounts

  return (
    <>
      <NavBar />
      <div className={styles.order_table_container}>
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table className={styles.order_table}>
            <TableHead>
              <TableRow>
                <TableCell>Order Id</TableCell>
                <TableCell>Date</TableCell>
                <TableCell className={styles.product_details_head}>Product Details</TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Payment Type</TableCell>
                <TableCell>Delivery Address</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.orderId}>
                    <TableCell>{order.orderId}</TableCell>
                    <TableCell>{order.orderDate}</TableCell>
                    <TableCell className={styles.product_details}>
                      {order.product.title} <br />
                      {order.product.description}
                    </TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>
                      ₹{order.price} <br />
                      Total: ₹{order.price * order.quantity}
                    </TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.paymentType}</TableCell>
                    <TableCell>
                      {order.orderAddress.firstName} {order.orderAddress.lastName} <br />
                      {order.orderAddress.address}, {order.orderAddress.city}, {order.orderAddress.state} <br />
                      Pincode: {order.orderAddress.pincode} <br />
                      Mobile: {order.orderAddress.mobileNo}
                    </TableCell>
                    <TableCell>
                      {order.status === 'In Progress' ? (
                        <Button 
                          variant="contained" 
                          color="error" 
                          className={styles.cancel_button}>
                          Cancel
                        </Button>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
};

export default customerOrders;
