import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './HomePage/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';

import CustomerLogin from './CustomerComponents/Authentication/CustomerLogin';
import CustomerRegister from './CustomerComponents/Authentication/CustomerRegister'
import FarmerLogin from './FarmerComponents/FarmerLoginPage/FarmerLogin'
import FarmerRegestration from './FarmerComponents/Regestration/FarmerRegistration'
import CustomerDashboard from './CustomerDashBoard/CustomerDashBoard'
import Cart from "./CustomerDashBoard/pages/Cart/Cart";
import PlaceOrder from "./CustomerDashBoard/pages/PlaceOrder/PlaceOrder";
import Dashboard from './FarmerComponents/DashBoard/DashBoard'
import ProductsPage from './FarmerComponents/MyProductPage/MyProductPage'
import AddProduct from './FarmerComponents/AddProduct/AddProduct'
import Transcations from './FarmerComponents/TranscationPage/Transcations'
import FarmerProfile from './FarmerComponents/ProfilePage/ProfilePage'
import AskEmailPage from './ForgetPassword/AskEmailPage';
import ResetPassword from './ForgetPassword/ResetPasswordPage';
import AdminProductPage from './FarmerComponents/AddedProducts/AdminProductPage'
import EditProduct from './FarmerComponents/AddedProducts/EditProductPage';
import ProductDetails from './CustomerDashBoard/components/ProductDetails/ProductDetails';
import CustomerDashboardLayout from './CustomerDashBoard/CustomerDashBoardLayout';
import PaymentOptions from './CustomerDashBoard/pages/paymentOptions/PaymentOptions';
import ProtectedRoute from './ProtectedRoute';
import CustomerOrdersPage from './CustomerDashBoard/UserOrders/UserOrders'
import FarmerOrders from './FarmerComponents/OrdersPage/FarmerOrdersPage'
import OrderTracking from './CustomerDashBoard/UserOrders/OrderTracking';
import CustomerProfilePage from './CustomerDashBoard/pages/ProfilePage/CustomerProfilePage'

import MSP from './FarmerComponents/DashBoard/MSP'

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<CustomerDashboard />} />
        <Route path='/forgetPassword' element={<AskEmailPage />} />
        <Route path='/HomeLogin' element={<Home/>}/>
        <Route path='/customerlogin' element={<CustomerLogin />} />
        <Route path='/customerregestration' element={<CustomerRegister />} />
        <Route path='/farmerlogin' element={<FarmerLogin />} />
        <Route path='/farmerorders' element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path='' element={<FarmerOrders />} />
        </Route>
        <Route path='/farmerregistration' element={<FarmerRegestration />} />
        <Route path='/minimum-support-prize' element={<MSP />}></Route>
        <Route path='/resetPassword/:email' element={<ResetPassword />} />
        <Route path='customerdashboard/product/:id' element={<ProductDetails />} />

        {/* Protected Routes */}
        <Route path='/customerdashboard' element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
          <Route element={<CustomerDashboardLayout />}>
            <Route index element={<CustomerDashboard />} />
            <Route path='cart' element={<Cart />} />
            <Route path='customerorders' element={<CustomerOrdersPage />}></Route>
           

            <Route path="order" element={<PlaceOrder />} />
            <Route path='customer-profilepage' element={<CustomerProfilePage />}></Route>
            <Route path="tracking-page" element={<OrderTracking />}></Route>
            <Route path='paymentoptions' element={<PaymentOptions />} />
          </Route>
        </Route>




        {/* Admin-Only Routes */}
        <Route path="/productspage" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<ProductsPage />} />
        </Route>

        <Route path="/farmerdashboard" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<Dashboard />} />
        </Route>

        <Route path="/addproduct" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<AddProduct />} />
        </Route>

        <Route path="/transcationspage" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<Transcations />} />
        </Route>

        <Route path="/farmerprofile" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<FarmerProfile />} />
        </Route>

        <Route path="/myproducts" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<AdminProductPage />} />
        </Route>

        <Route path="/editProduct/:id" element={<ProtectedRoute allowedRoles={['FARMER']} />}>
          <Route path="" element={<EditProduct />} />
        </Route>
      </Routes>
      <ToastContainer /> 
    </>
  );
}

export default App;
