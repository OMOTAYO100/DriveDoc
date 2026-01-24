const API_URL = import.meta.env.VITE_API_URL || "/api";

// Helper to get headers with token
const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || data.error || "Request failed");
    }
    return data;
  } else {
    // Handle non-JSON response (likely an error page or 404)
    const text = await response.text();
    console.error("Non-JSON response:", text);
    throw new Error(
      "Server error: Received non-JSON response. Please check backend server."
    );
  }
};

export const api = {
  // Auth
  signup: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify(userData),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify(credentials),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },
  oauthGoogle: async (accessToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/oauth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify({ accessToken }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (error) {
      console.error("Google OAuth error:", error);
      throw error;
    }
  },
  oauthFacebook: async (accessToken) => {
    try {
      const response = await fetch(`${API_URL}/auth/oauth/facebook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify({ accessToken }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (error) {
      console.error("Facebook OAuth error:", error);
      throw error;
    }
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
    return handleResponse(response);
  },

  // Documents
  getDocuments: async () => {
    const response = await fetch(`${API_URL}/documents`, {
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
    return handleResponse(response);
  },

  addDocument: async (docData) => {
    const response = await fetch(`${API_URL}/documents`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(docData),
    });
    return handleResponse(response);
  },

  updateDocument: async (id, docData) => {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(docData),
    });
    return handleResponse(response);
  },

  deleteDocument: async (id) => {
    const response = await fetch(`${API_URL}/documents/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
    return handleResponse(response);
  },

  // Bookings
  getMyBookings: async () => {
    const response = await fetch(`${API_URL}/bookings`, {
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
    return handleResponse(response);
  },

  createBooking: async (bookingData) => {
    const response = await fetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(bookingData),
    });
    return handleResponse(response);
  },

  cancelBooking: async (id) => {
    const response = await fetch(`${API_URL}/bookings/${id}/cancel`, {
      method: "PUT", // Using PUT as defined in controller
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
    return handleResponse(response);
  },

  // Payments (Paystack)
  verifyPayment: async (data) => {
    const response = await fetch(`${API_URL}/payments/verify`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  logout: () => {
    localStorage.removeItem("token");
  },
};
