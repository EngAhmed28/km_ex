// API utility functions for connecting to backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to make API requests
export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error || 'حدث خطأ في الطلب';
      console.error('API Error Response:', { status: response.status, data });
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

// Auth API functions
export const authAPI = {
  register: async (name, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: { name, email, password },
    });
  },

  login: async (email, password) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me', {
      method: 'GET',
    });
  },
};

// Dashboard API functions
export const dashboardAPI = {
  getDashboard: async () => {
    return apiRequest('/dashboard', {
      method: 'GET',
    });
  },

  updateProfile: async (name, email) => {
    return apiRequest('/dashboard/profile', {
      method: 'PUT',
      body: { name, email },
    });
  },
};

// Categories API functions
export const categoriesAPI = {
  getAllCategories: async () => {
    return apiRequest('/categories', {
      method: 'GET',
    });
  },

  getCategoryById: async (id) => {
    return apiRequest(`/categories/${id}`, {
      method: 'GET',
    });
  },
};

// Products API functions
export const productsAPI = {
  getAllProducts: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.category) queryParams.append('category', params.category);
    if (params.category_id) queryParams.append('category_id', params.category_id);
    if (params.search) queryParams.append('search', params.search);
    if (params.min_price) queryParams.append('min_price', params.min_price);
    if (params.max_price) queryParams.append('max_price', params.max_price);
    
    const queryString = queryParams.toString();
    const url = `/products${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, {
      method: 'GET',
    });
  },

  getProductById: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'GET',
    });
  },
};

// Product Images API functions
export const productImagesAPI = {
  getProductImages: async (productId) => {
    return apiRequest(`/product-images/product/${productId}`, {
      method: 'GET',
    });
  },

  addProductImage: async (productId, imageUrl, isPrimary = false) => {
    return apiRequest(`/product-images/product/${productId}`, {
      method: 'POST',
      body: { image_url: imageUrl, is_primary: isPrimary },
    });
  },

  deleteProductImage: async (imageId) => {
    return apiRequest(`/product-images/${imageId}`, {
      method: 'DELETE',
    });
  },

  setPrimaryImage: async (imageId) => {
    return apiRequest(`/product-images/${imageId}/primary`, {
      method: 'PUT',
    });
  },
};

// Orders API functions
export const ordersAPI = {
  createOrder: async (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: orderData,
    });
  },

  getAllOrders: async (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.append('status', params.status);
    if (params.search) queryParams.append('search', params.search);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.include_stats) queryParams.append('include_stats', params.include_stats);
    
    const queryString = queryParams.toString();
    const url = `/orders${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url, {
      method: 'GET',
    });
  },

  getUserOrders: async () => {
    return apiRequest('/orders/my-orders', {
      method: 'GET',
    });
  },

  getOrderById: async (id) => {
    return apiRequest(`/orders/${id}`, {
      method: 'GET',
    });
  },

  updateOrderStatus: async (id, status) => {
    return apiRequest(`/orders/${id}/status`, {
      method: 'PUT',
      body: { status },
    });
  },
};

// Admin API functions
export const adminAPI = {
  getEmployeePermissions: async (employeeId) => {
    // Get permissions from employee data
    const response = await apiRequest('/admin/employees', {
      method: 'GET',
    });
    if (response.success && response.data && response.data.employees) {
      const employee = response.data.employees.find((emp) => emp.id === parseInt(employeeId));
      return {
        success: true,
        data: {
          permissions: employee?.permissions || []
        }
      };
    }
    return { success: false, data: { permissions: [] } };
  },

  setEmployeePermissions: async (employeeId, permissions) => {
    return apiRequest(`/admin/employees/${employeeId}/permissions`, {
      method: 'PUT',
      body: { permissions },
    });
  },
};
