// API utility functions for connecting to backend
// Detect environment: development (localhost) or production (online)
// Priority: 1. Environment variable, 2. Check current URL hostname

let isProduction = false;
let isDevelopment = false;

if (typeof window !== 'undefined') {
  const hostname = window.location.hostname.toLowerCase();
  
  // Check if we're on production domain (most reliable check)
  isProduction = hostname === 'kingofmuscles.metacodecx.com' || 
                 hostname.includes('metacodecx.com') ||
                 hostname.includes('kingofmuscles');
  
  // Check if we're on localhost (most reliable check)
  isDevelopment = hostname === 'localhost' || 
                  hostname === '127.0.0.1' ||
                  hostname === '0.0.0.0' ||
                  hostname.startsWith('192.168.') ||
                  hostname.startsWith('10.0.');
} else {
  // Server-side rendering - default to development
  isDevelopment = true;
  isProduction = false;
}

// Use environment variable if set, otherwise detect automatically
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (isProduction 
    ? 'https://kingofmuscles.metacodecx.com/api' 
    : 'http://localhost:5000/api');

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_URL || 
  (isProduction 
    ? 'https://kingofmuscles.metacodecx.com' 
    : 'http://localhost:5000');

// Helper function to get API base URL (can be used in other files)
export const getApiBaseUrl = () => API_BASE_URL;

// Helper function to get Image base URL (can be used in other files)
export const getImageBaseUrl = () => IMAGE_BASE_URL;

// Helper function to get full URL for images/paths
export const getFullUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  // Ensure path starts with / if it's a relative path
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${IMAGE_BASE_URL}${normalizedPath}`;
};

// Log for debugging (only log once, not on every import)
if (typeof window !== 'undefined' && !window.__API_CONFIG_LOGGED__) {
  window.__API_CONFIG_LOGGED__ = true;
  console.log('🌐 Environment:', isProduction ? 'Production (Online)' : 'Development (Localhost)');
  console.log('🔗 API URL:', API_BASE_URL);
  console.log('🖼️ Image URL:', IMAGE_BASE_URL);
  console.log('📍 Current Hostname:', window.location.hostname);
  console.log('🔒 Protocol:', window.location.protocol);
}

// Legacy function - use getFullUrl instead (kept for backward compatibility)
export const getFullImageUrl = (path) => {
  return getFullUrl(path);
};
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
  getMyDiscount: async () => {
    return apiRequest('/dashboard/discount', {
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

  // Customer Discounts
  getCustomerDiscount: async (customerId) => {
    return apiRequest(`/admin/customers/${customerId}/discount`, {
      method: 'GET',
    });
  },

  setCustomerDiscount: async (customerId, discountData) => {
    return apiRequest(`/admin/customers/${customerId}/discount`, {
      method: 'PUT',
      body: discountData,
    });
  },

  deleteCustomerDiscount: async (customerId) => {
    return apiRequest(`/admin/customers/${customerId}/discount`, {
      method: 'DELETE',
    });
  },

  getAllCustomerDiscounts: async () => {
    return apiRequest('/admin/customers/discounts', {
      method: 'GET',
    });
  },
};

// Reviews API functions
export const reviewAPI = {
  getProductReviews: async (productId) => {
    return apiRequest(`/reviews/products/${productId}`, {
      method: 'GET',
    });
  },

  getUserReview: async (productId) => {
    return apiRequest(`/reviews/products/${productId}/my-review`, {
      method: 'GET',
    });
  },

  createReview: async (productId, rating, comment) => {
    return apiRequest(`/reviews/products/${productId}`, {
      method: 'POST',
      body: { rating, comment },
    });
  },

  markHelpful: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
    });
  },
};

// Brands API functions
export const brandsAPI = {
  getAllBrands: async (isActive) => {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) queryParams.append('is_active', isActive);
    const queryString = queryParams.toString();
    const url = `/brands${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  getBrandById: async (id) => {
    return apiRequest(`/brands/${id}`, { method: 'GET' });
  },

  createBrand: async (brandData) => {
    return apiRequest('/brands', {
      method: 'POST',
      body: brandData,
    });
  },

  updateBrand: async (id, brandData) => {
    return apiRequest(`/brands/${id}`, {
      method: 'PUT',
      body: brandData,
    });
  },

  deleteBrand: async (id) => {
    return apiRequest(`/brands/${id}`, {
      method: 'DELETE',
    });
  },

  toggleBrandStatus: async (id) => {
    return apiRequest(`/brands/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
};

// Stats API functions
export const statsAPI = {
  getAllStats: async (isActive) => {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) queryParams.append('is_active', isActive);
    const queryString = queryParams.toString();
    const url = `/stats${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  getStatById: async (id) => {
    return apiRequest(`/stats/${id}`, { method: 'GET' });
  },

  updateStat: async (id, statData) => {
    return apiRequest(`/stats/${id}`, {
      method: 'PUT',
      body: statData,
    });
  },

  toggleStatStatus: async (id) => {
    return apiRequest(`/stats/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
};

// Deals API functions
export const dealsAPI = {
  getActiveDeal: async () => {
    return apiRequest('/deals/active', { method: 'GET' });
  },

  getAllDeals: async (isActive) => {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) queryParams.append('is_active', isActive);
    const queryString = queryParams.toString();
    const url = `/deals${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  getDealById: async (id) => {
    return apiRequest(`/deals/${id}`, { method: 'GET' });
  },

  createDeal: async (dealData) => {
    return apiRequest('/deals', {
      method: 'POST',
      body: dealData,
    });
  },

  updateDeal: async (id, dealData) => {
    return apiRequest(`/deals/${id}`, {
      method: 'PUT',
      body: dealData,
    });
  },

  deleteDeal: async (id) => {
    return apiRequest(`/deals/${id}`, {
      method: 'DELETE',
    });
  },

  toggleDealStatus: async (id) => {
    return apiRequest(`/deals/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
};

// Goals API functions
export const goalsAPI = {
  getAllGoals: async (isActive) => {
    const queryParams = new URLSearchParams();
    if (isActive !== undefined) queryParams.append('is_active', isActive);
    const queryString = queryParams.toString();
    const url = `/goals${queryString ? `?${queryString}` : ''}`;
    return apiRequest(url, { method: 'GET' });
  },

  getGoalById: async (id) => {
    return apiRequest(`/goals/${id}`, { method: 'GET' });
  },

  createGoal: async (goalData) => {
    return apiRequest('/goals', {
      method: 'POST',
      body: goalData,
    });
  },

  updateGoal: async (id, goalData) => {
    return apiRequest(`/goals/${id}`, {
      method: 'PUT',
      body: goalData,
    });
  },

  deleteGoal: async (id) => {
    return apiRequest(`/goals/${id}`, {
      method: 'DELETE',
    });
  },

  toggleGoalStatus: async (id) => {
    return apiRequest(`/goals/${id}/toggle-status`, {
      method: 'PUT',
    });
  },
};

// Site Settings API functions
export const siteSettingsAPI = {
  getSiteSettings: async () => {
    return apiRequest('/site-settings', { method: 'GET' });
  },

  updateSiteSettings: async (settingsData) => {
    return apiRequest('/site-settings', {
      method: 'PUT',
      body: settingsData,
    });
  },
};
