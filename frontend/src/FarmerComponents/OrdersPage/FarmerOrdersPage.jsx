import * as React from 'react';
import { useEffect, useState } from 'react';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Button, Select, MenuItem } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { getAllOrders, updateOrderStatus, getOrderById, ORDER_STATUSES } from '../../Service/FarmerService';
import { getErrorMessage } from '../../Service/AxiosInstant';
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


// Backend OrderStatus values with their display labels
const statusOptions = ORDER_STATUSES;

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
        setOrders(await getAllOrders());
      } catch (e) {
        toast.error(getErrorMessage(e, 'Failed to fetch the orders'), {
          position: 'top-right',
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

  const handleUpdateStatus = async (orderId) => {
    const updatedStatus = orderStatuses[orderId];
    if (updatedStatus!=null) {
      setUpdating(true);
      try {
        const updated = await updateOrderStatus(orderId, updatedStatus);
        setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
        setOrderStatuses((prev) => {
          const next = { ...prev };
          delete next[orderId];
          return next;
        });
        toast.success(`Order ${updated.orderNumber} status updated to "${updated.statusLabel}"`);
    } catch (error) {
        
        toast.error(getErrorMessage(error, "Failed to update order status"));
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
      toast.error("Please enter a valid order number to search");
      
      return;
    }
  
    try {
      const order = await getOrderById(searchQuery);
      setOrders([order]);
      
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error(getErrorMessage(error, "Order not found"));
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
                <TableRow hover role="checkbox" tabIndex={-1} key={order.id}>
                  
                  {/* Order ID */}
                  <TableCell className="orderId" sx={{ maxWidth: '250px' }}>{order.orderNumber}</TableCell>

                  {/* Product Details */}
                  <TableCell className="productDetails" sx={{ maxWidth: 150, wordWrap: 'break-word', overflow: 'hidden' }}>
                    <div><strong>Title:</strong> {order.product?.title}</div>
                    <div><strong>Quantity:</strong> {order.quantity}</div>
                    <div><strong>Price:</strong> ${order.totalPrice}</div>
                  </TableCell>

                  {/* Customer Name */}
                  <TableCell className="customerName" sx={{ maxWidth: 130 }}>
                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                  </TableCell>

                  {/* Mobile Number */}
                  <TableCell className="mobileNumber" sx={{ maxWidth: 130 }}>
                    {order.shippingAddress?.mobileNo}
                  </TableCell>

                  {/* Delivery Address */}
                  <TableCell className="deliveryAddress" sx={{ maxWidth: 250, wordWrap: 'break-word', overflow: 'hidden' }}>
                    {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.pincode}, {order.shippingAddress?.state}
                  </TableCell>

                  {/* Status Dropdown */}
                  <TableCell>
                    <Select
                      className="statusDropdown"
                      
                      value={orderStatuses[order.id] || order.status || statusOptions[0].value}
                      onChange={(e) => handleStatusChange(e, order.id)} // Capture status change
                      disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
                      sx={{ width: 150 }}
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
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
                      onClick={() => handleUpdateStatus(order.id)}
                      disabled={order.status === 'DELIVERED' || order.status === 'CANCELLED'}
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
