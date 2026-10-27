
import React, { useContext, useState, useEffect } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../../Context/StoreContext";
import { assetUrl } from "../../../Service/AxiosInstant";
import { fetchProductPage } from "../../../Service/UserService";
import FoodItem from "../FoodItem/FoodItem";
import { useSpring, animated } from "react-spring";

// Explore-menu names -> backend category names ("All" means no filter)
const toApiCategory = (category) => {
  if (!category || category === "All") return undefined;
  const name = category.trim();
  return name === "TuberCrops" ? "Tuber Crops" : name;
};

const FoodDisplay = ({ category }) => {
  const { setFoodListData } = useContext(StoreContext);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(9);
  const [currentItems, setCurrentItems] = useState([]);
  const [idx, setIdx] = useState(0);

  const fetchProducts = async (page) => {
    try {
      const { content = [], totalPages = 0 } = await fetchProductPage({
        page,
        size: itemsPerPage,
        category: toApiCategory(category),
      });
      setCurrentItems(content);
      setTotalPages(Math.max(totalPages, 1));
      setFoodListData(content);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage);
  }, [currentPage, category]);

  // Changing the category starts again from the first page
  useEffect(() => {
    setCurrentPage(0);
    setIdx(0);
  }, [category]);

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
            price={item.discountPrice ?? item.price}
            image={assetUrl(item.imageUrl)}
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
