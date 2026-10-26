
import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../../Context/StoreContext";
import axiosInstance from "../../../Service/AxiosInstant";
import FoodItem from "../FoodItem/FoodItem";
import { useSpring, animated } from "react-spring";

const FoodDisplay = ({ category }) => {
  const { setFoodListData } = useContext(StoreContext);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  const [currentItems, setCurrentItems] = useState([]);
  const [idx, setIdx] = useState(0);

  const fetchProducts = async (page) => {
    try {
      const response = await axiosInstance.get(`/products`, {
        params: {
          page,
          size: itemsPerPage,
        },
      });

      const { content, totalPages } = response.data;
      setCurrentItems(content);
      setTotalPages(totalPages);
      setFoodListData(content);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage]);

  const goToNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
    setIdx((prev) => prev + 1);
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
      setIdx((prev) => Math.max(0, prev - 1));
    }
  };

  const goToPage = (page) => {
    setCurrentPage(page);
    setIdx(page)
  };

  const generatePageNumbers = () => {
    const pageNumbers = [];
    for (let i = idx; i < idx + totalPages; i++) {
      pageNumbers.push(i);
    }
    return pageNumbers;
  };

  const props = useSpring({
    opacity: currentItems.length ? 1 : 0,
    transform: currentItems.length ? "translateY(0)" : "translateY(-20px)",
  });

  return (
    <div className="food-display" id="food-display">
      <h2>Top Fresh Groceries Near You</h2>
      <animated.div style={props} className="food-display-list">
        {currentItems.map((item, index) => (
          <FoodItem
            key={index}
            id={item.id}
            name={item.title}
            description={item.description}
            price={item.price}
            image={`${import.meta.env.VITE_API_URL}/img/product_img/${item.image}`}
          />
        ))}
      </animated.div>


      <div className="pagination-controls">
        <nav aria-label="Page navigation">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
              <button className="page-link" onClick={goToPreviousPage} disabled={currentPage === 0}>
                Previous
              </button>
            </li>

            {generatePageNumbers().map((number) => (
              <li className={`page-item ${idx === number ? 'active' : ''}`} key={number}>
                <button className="page-link" onClick={() => goToPage(number)}>
                  {number + 1}
                </button>
              </li>
            ))}

            <li >
              <button className="page-link" onClick={goToNextPage}>
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>

    </div>
  );
};

export default FoodDisplay;
