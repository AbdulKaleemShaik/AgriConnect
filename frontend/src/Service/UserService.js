import axiosInstance, { setToken } from './AxiosInstant';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

/* ---------- Auth ---------- */

/** POST /api/auth/login {email, password}; stores the JWT and returns the AuthResponse. */
const loginService = async ({ email, password }) => {
  const response = await axiosInstance.post('/api/auth/login', { email, password });
  if (response.data?.token) {
    setToken(response.data.token);
  }
  return response.data;
};

/** POST /api/auth/register/{customer|farmer} (multipart). */
const registerService = async (formDataToSend, role = 'customer') => {
  const response = await axiosInstance.post(`/api/auth/register/${role}`, formDataToSend, multipart);
  return response.data;
};

const forgotPasswordService = async (email) => {
  await axiosInstance.post('/api/auth/forgot-password', { email });
};

const resetPasswordService = async ({ email, otp, newPassword }) => {
  await axiosInstance.post('/api/auth/reset-password', { email, otp, newPassword });
};

/* ---------- Current user ---------- */

const fetchCurrentUser = async () => {
  const response = await axiosInstance.get('/api/users/me');
  return response.data;
};

const updateProfileService = async (formDataToSend) => {
  const response = await axiosInstance.put('/api/users/me', formDataToSend, multipart);
  return response.data;
};

const changePasswordService = async ({ currentPassword, newPassword }) => {
  await axiosInstance.put('/api/users/me/password', { currentPassword, newPassword });
};

/* ---------- Products (public) ---------- */

/** GET /api/products → PageResponse. Returns the full page object. */
const fetchProductPage = async ({ category, q, page = 0, size = 100 } = {}) => {
  const params = { page, size };
  if (category) params.category = category;
  if (q) params.q = q;
  const response = await axiosInstance.get('/api/products', { params });
  return response.data;
};

/** Convenience: the product list (content of the first page). */
const fetchProducts = async (options) => {
  const page = await fetchProductPage(options);
  return page?.content || [];
};

const fetchProductsById = async (id) => {
  const response = await axiosInstance.get(`/api/products/${id}`);
  return response.data;
};

const fetchCategories = async () => {
  const response = await axiosInstance.get('/api/categories');
  return response.data;
};

/* ---------- Cart (customer) ---------- */

const getCartService = async () => (await axiosInstance.get('/api/cart')).data;

const addCartItemService = async (productId, quantity = 1) =>
  (await axiosInstance.post('/api/cart/items', { productId, quantity })).data;

const updateCartItemService = async (productId, quantity) =>
  (await axiosInstance.put(`/api/cart/items/${productId}`, { quantity })).data;

const removeCartItemService = async (productId) => {
  await axiosInstance.delete(`/api/cart/items/${productId}`);
};

const clearCartService = async () => {
  await axiosInstance.delete('/api/cart');
};

/* ---------- Orders (customer) ---------- */

/** POST /api/orders — checks out the whole server-side cart; returns OrderResponse[]. */
const placeOrderService = async (checkout) => (await axiosInstance.post('/api/orders', checkout)).data;

const getMyOrdersService = async () => (await axiosInstance.get('/api/orders/mine')).data;

const getOrderByIdService = async (id) => (await axiosInstance.get(`/api/orders/${id}`)).data;

const getOrderByNumberService = async (orderNumber) =>
  (await axiosInstance.get(`/api/orders/number/${encodeURIComponent(orderNumber)}`)).data;

const cancelOrderService = async (id) => (await axiosInstance.post(`/api/orders/${id}/cancel`)).data;

export {
  loginService,
  registerService,
  forgotPasswordService,
  resetPasswordService,
  fetchCurrentUser,
  updateProfileService,
  changePasswordService,
  fetchProductPage,
  fetchProducts,
  fetchProductsById,
  fetchCategories,
  getCartService,
  addCartItemService,
  updateCartItemService,
  removeCartItemService,
  clearCartService,
  placeOrderService,
  getMyOrdersService,
  getOrderByIdService,
  getOrderByNumberService,
  cancelOrderService,
};
