import axiosInstance from './AxiosInstant';

const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };

/* ---------- Farmer orders ---------- */

/** GET /api/orders/farmer (paginated) → OrderResponse[] of the requested page. */
export const getAllOrders = async ({ page = 0, size = 100 } = {}) => {
  const response = await axiosInstance.get('/api/orders/farmer', { params: { page, size } });
  return response.data?.content || [];
};

/** PATCH /api/orders/{id}/status {status}. */
export const updateOrderStatus = async (id, status) => {
  const response = await axiosInstance.patch(`/api/orders/${id}/status`, { status });
  return response.data;
};

/** Looks an order up by its public order number (falls back to numeric id). */
export const getOrderById = async (orderRef) => {
  const ref = String(orderRef).trim();
  try {
    const response = await axiosInstance.get(`/api/orders/number/${encodeURIComponent(ref)}`);
    return response.data;
  } catch (error) {
    if (/^\d+$/.test(ref) && error?.response?.status === 404) {
      const response = await axiosInstance.get(`/api/orders/${ref}`);
      return response.data;
    }
    throw error;
  }
};

/* ---------- Farmer products ---------- */

/** GET /api/products/mine → ProductResponse[] (includes inactive ones). */
export const getMyProducts = async () => {
  const response = await axiosInstance.get('/api/products/mine');
  return response.data || [];
};

export const getProductById = async (id) => {
  const response = await axiosInstance.get(`/api/products/${id}`);
  return response.data;
};

/** PUT /api/products/{id} (multipart). */
export const updateProduct = async (id, formDataToSend) => {
  const response = await axiosInstance.put(`/api/products/${id}`, formDataToSend, multipart);
  return response.data;
};

/** DELETE /api/products/{id} (soft delete). */
export const deleteProduct = async (id) => {
  await axiosInstance.delete(`/api/products/${id}`);
};

/** Order statuses accepted by PATCH /api/orders/{id}/status, with their display labels. */
export const ORDER_STATUSES = [
  { value: 'PLACED', label: 'Order placed' },
  { value: 'CONFIRMED', label: 'Order confirmed' },
  { value: 'PROCESSING', label: 'Order processing' },
  { value: 'SHIPPED', label: 'Shipped/Dispatched' },
  { value: 'IN_TRANSIT', label: 'In transit' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export { multipart };
