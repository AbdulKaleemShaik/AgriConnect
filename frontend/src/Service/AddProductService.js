import axiosInstance from './AxiosInstant';

const addProductService = async (formDataToSend) => {
    const config = {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    };
    const response = await axiosInstance.post('/admin/saveProduct', formDataToSend, config);
    return response.data;
};

export { addProductService };
