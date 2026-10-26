import * as React from 'react';
import { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Button, Select, MenuItem } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { getAllOrders, updateOrderStatus,getOrderById } from '../../Service/FarmerService';  
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../NavBar/NavBar'
import Updating from './Updating.jsx';

const columns = [
  { id: 'orderId', label: 'Order ID', minWidth: 150 },
  { id: 'product', label: 'Product Details', minWidth: 150 },
  { id: 'name', label: 'Customer Name', minWidth: 130 },
  { id: 'mobile', label: 'Mobile Number', minWidth: 130 },
  { id: 'address', label: 'Delivery Address', minWidth: 250 },
  { id: 'status', label: 'Status', minWidth: 130 },
  { id: 'actions', label: 'Actions', minWidth: 100 }
];


const statusOptions = [
  'Order placed', 'Order confirmed', 'Order processing', 'Shipped/Dispatched',
  'In transit', 'Out for delivery', 'Delivered'
];

export default function OrderTable() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatuses, setOrderStatuses] = useState({}); 
  const [updating,setUpdating] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getAllOrders();
        setOrders(response.data.orders);
      } catch (e) {
        toast.error('Failed to fetch the orders', {
          position: toast.POSITION.TOP_RIGHT,
        });
      }
    };

    fetchOrders();
  }, []);

  const handleStatusChange = (e, orderId) => {
    setOrderStatuses({
      ...orderStatuses,
      [orderId]: e.target.value
    });
  };

  const handleUpdateStatus = async (orderId,temp) => {
    const updatedStatus = orderStatuses[temp];
    if (updatedStatus!=null) {
      setUpdating(true);
      try {
        const response = await updateOrderStatus(orderId, updatedStatus);
        toast.success(`Order ${orderId} status updated`);
    } catch (error) {
        
        toast.error("Failed to update order status");
    }
    finally{
      setUpdating(false);
    }
    
    } else {
      toast.error('Please select a status before updating');
    }
  };
  


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  
  const handleSearch = async () => {
    if (searchQuery.trim() === "") {
      toast.error("Please enter a valid order ID to search");
      
      return;
    }
  
    try {
      const response = await getOrderById(searchQuery); 
      setOrders([response.data]);
      
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Order not found ");
    }
  };
  
  if(updating){
    return(
      <Updating />
    )
  }

  return (
    <>
    <Navbar />
    <Paper sx={{ width: '95%', margin: '0 auto',marginTop :'35px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', textAlign: 'center' }} className="orderTableContainer">
      <ToastContainer />
      <h2>Order List</h2>
      
  
      
      {/* Table */}
      <TableContainer sx={{ maxHeight: 440 }}>
        <Table stickyHeader aria-label="order table" className="orderTable">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id} 
                  style={{ minWidth: column.minWidth, backgroundColor: '#f5f5f5', fontWeight: 'bold', textAlign: 'left' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {orders
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((order) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={order.orderId}>
                  
                  {/* Order ID */}
                  <TableCell className="orderId" sx={{ maxWidth: '250px' }}>{order.orderId}</TableCell>

                  {/* Product Details */}
                  <TableCell className="productDetails" sx={{ maxWidth: 150, wordWrap: 'break-word', overflow: 'hidden' }}>
                    <div><strong>Title:</strong> {order.product.title}</div>
                    <div><strong>Price:</strong> ${order.product.price}</div>
                  </TableCell>

                  {/* Customer Name */}
                  <TableCell className="customerName" sx={{ maxWidth: 130 }}>
                    {order.orderAddress.firstName} {order.orderAddress.lastName}
                  </TableCell>

                  {/* Mobile Number */}
                  <TableCell className="mobileNumber" sx={{ maxWidth: 130 }}>
                    {order.orderAddress.mobileNo}
                  </TableCell>

                  {/* Delivery Address */}
                  <TableCell className="deliveryAddress" sx={{ maxWidth: 250, wordWrap: 'break-word', overflow: 'hidden' }}>
                    {order.orderAddress.address}, {order.orderAddress.city}, {order.orderAddress.pincode}, {order.orderAddress.state}
                  </TableCell>

                  {/* Status Dropdown */}
                  <TableCell>
                    <Select
                      className="statusDropdown"
                      
                      value={orderStatuses[order.orderId] || (statusOptions.includes(order.status) ? order.status : statusOptions[0])} // Ensure valid status
                      onChange={(e) => handleStatusChange(e, order.orderId)} // Capture status change
                      sx={{ width: 150 }}
                    >
                      {statusOptions.map((status, index) => (
                        <MenuItem key={index} value={status}>
                          {status}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Update Button */}
                  <TableCell>
                    <Button
                      className="actionButton"
                      sx={{
                        backgroundColor: 'rgb(43, 164, 32)',
                        color: 'white',
                        ':hover': { backgroundColor: '#0056b3' },
                        padding: '8px 12px',
                        borderRadius: '4px'
                      }}
                      onClick={() => handleUpdateStatus(order.id,order.orderId)} 
                    >
                      Update
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={orders.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
    </>
  );
}
