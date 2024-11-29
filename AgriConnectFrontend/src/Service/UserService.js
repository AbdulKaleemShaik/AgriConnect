import axiosInstance from "./AxiosInstant";


const loginService = async (loginInfo) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const response = await axiosInstance.post('/api/auth/login', loginInfo, config);
 // console.log(response);
  if (response.data && response.data.token) {
    localStorage.setItem('token', response.data.token);
  }

  return response.data;
};



const registerService = async (formDataToSend) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axiosInstance.post('/saveUser', formDataToSend, config);
  return response.data;
};


const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/allproducts', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    return response.data
  } catch (error) {
    console.error('Error fetching products:', error);

  }
};

const fetchProductsById = async (id) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axiosInstance.get('/product/${id}', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data
  } catch (error) {
    console.error('Error fetching products:', error);
  }

};
export { loginService, registerService, fetchProducts, fetchProductsById };
