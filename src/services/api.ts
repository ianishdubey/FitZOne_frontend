const API_BASE_URL = 'http://localhost:5000/api';

// API utility functions
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    
    return response;
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },
};

// User API
export const userAPI = {
  getProfile: () => apiRequest('/user/profile'),
  
  updateProfile: (profileData: any) => apiRequest('/user/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  }),

  getPurchasedPrograms: () => apiRequest('/user/programs'),
};

// Programs API
export const programsAPI = {
  getAll: () => apiRequest('/programs'),
  
  purchase: (programId: string) => apiRequest(`/programs/${programId}/purchase`, {
    method: 'POST',
  }),
};

// Contact API
export const contactAPI = {
  submitInquiry: (inquiryData: {
    name: string;
    email: string;
    phone?: string;
    message: string;
    type?: string;
  }) => apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(inquiryData),
  }),
};

// Membership API
export const membershipAPI = {
  create: (membershipData: {
    planType: string;
    amount: number;
  }) => apiRequest('/memberships', {
    method: 'POST',
    body: JSON.stringify(membershipData),
  }),
};

// Health check
export const healthCheck = () => apiRequest('/health');