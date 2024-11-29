import axiosInstance from './AxiosInstant';  



export const getAllOrders = async () => {
  const response = await axiosInstance.get('/admin/orders');
  return response;
};



export const updateOrderStatus = async (id, st) => {
  const response = await axiosInstance.post(`/admin/update-order-status`, null, {
    params: {
      id: id,
      status: st
    }
  });
  return response;
};


export const getOrderById = async(orderId) =>{
  const response = await axiosInstance.get(`/admin/search-order` ,{ params: { orderId } })
  console.log(response)
  return response
}

export const editOrderById = async(id)=>{
  const response = await axiosInstance.get(`/product/${id}`);
  console.log(response)
  return response.data;
}



