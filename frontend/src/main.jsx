import { createRoot } from 'react-dom/client'
import React from "react";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextprovider from "./Context/StoreContext.jsx";
import { UserProvider } from "./Context/UserContext.jsx";

// UserProvider wraps StoreContextprovider so the cart can react to login/logout.
createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <UserProvider>
      <StoreContextprovider>
        <App />
      </StoreContextprovider>
    </UserProvider>
  </BrowserRouter>
)
