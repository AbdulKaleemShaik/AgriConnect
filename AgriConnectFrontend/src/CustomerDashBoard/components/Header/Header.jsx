import React from "react";
import "./Header.css";

const Header = () => {
  return (
    <div className="header">
      <div className="header-contents">
        <h2>Place Your Order</h2>
        <p>
          Choose from a diverse selection of fresh vegetables and fruits, sourced directly from local farms and known for their superior quality. Whether you're looking for everyday essentials or seasonal specialties, our collection offers the finest produce, handpicked to ensure freshness and taste.
        </p>
        <button>View Menu</button>
      </div>
    </div>
  );
};

export default Header;
