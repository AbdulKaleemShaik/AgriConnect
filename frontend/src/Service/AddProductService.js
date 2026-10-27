import axiosInstance from './AxiosInstant';

/** POST /api/products (farmer, multipart: title, description, category, price, stock, discount, active, image). */
const addProductService = async (formDataToSend) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  };
  const response = await axiosInstance.post('/api/products', formDataToSend, config);
  return response.data;
};

export { addProductService };
