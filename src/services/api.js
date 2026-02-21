const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

if (import.meta.env.DEV) {
  console.log("API URL initialized at:", API_URL);
}

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response, url) => {
  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  // Get raw text first for robust handling of empty/malformed responses
  const text = await response.text();

  if (isJson) {
    if (!text || text.trim() === "") {
      if (!response.ok) {
        throw new Error(`Server error (${response.status}): Empty response received from ${url}.`);
      }
      return {}; // Success with empty body
    }

    try {
      const data = JSON.parse(text);
      if (!response.ok) {
        throw new Error(data.message || data.error || `Request failed (${response.status})`);
      }
      return data;
    } catch (e) {
      console.error(`Failed to parse JSON response from ${url}:`, text);
      throw new Error(`Invalid JSON response from server (${response.status})`);
    }
  } else {
    console.error("Non-JSON response received:", {
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      preview: text.substring(0, 200),
    });
    throw new Error(
      `Server error (${response.status}): Received non-JSON response from ${url}. Please check backend server.`
    );
  }
};

const safeFetch = async (url, options) => {
    try {
        const response = await fetch(url, options);
        return await handleResponse(response, url);
    } catch (error) {
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            console.error('NETWORK ERROR: Failed to fetch', url);
            throw new Error(`Failed to Fetch: Please check your internet connection or if the backend server (${url}) is reachable and CORS is correctly configured.`);
        }
        throw error;
    }
};

export const api = {
  // Auth
  signup: async (userData) => {
    try {
      const data = await safeFetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify(userData),
      });
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
      const data = await safeFetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify(credentials),
      });
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
      const data = await safeFetch(`${API_URL}/auth/oauth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Enable cookies
        body: JSON.stringify({ accessToken }),
      });
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      return data;
    } catch (error) {
      console.error("Google OAuth error:", error);
      throw error;
    }
  },

  getMe: async () => {
    return safeFetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
      credentials: "include",
    });
  },

  // Documents
  getDocuments: async () => {
    return safeFetch(`${API_URL}/documents`, {
      headers: getHeaders(),
      credentials: "include",
    });
  },

  addDocument: async (docData) => {
    return safeFetch(`${API_URL}/documents`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(docData),
    });
  },

  updateDocument: async (id, docData) => {
    return safeFetch(`${API_URL}/documents/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(docData),
    });
  },

  deleteDocument: async (id) => {
    return safeFetch(`${API_URL}/documents/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
  },

  getMyBookings: async () => {
    return safeFetch(`${API_URL}/bookings`, {
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
  },

  createBooking: async (bookingData) => {
    return safeFetch(`${API_URL}/bookings`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(bookingData),
    });
  },

  cancelBooking: async (id) => {
    return safeFetch(`${API_URL}/bookings/${id}/cancel`, {
      method: "PUT", // Using PUT as defined in controller
      headers: getHeaders(),
      credentials: "include", // Enable cookies
    });
  },

  verifyPayment: async (data) => {
    return safeFetch(`${API_URL}/payments/verify`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include", // Enable cookies
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  // Notifications
  getNotificationPublicKey: async () => {
    return safeFetch(`${API_URL}/notifications/public-key`);
  },

  subscribeToPush: async (subscription) => {
    return safeFetch(`${API_URL}/notifications/subscribe`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(subscription),
    });
  },

  optOutNotifications: async (endpoint) => {
    return safeFetch(`${API_URL}/notifications/opt-out`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ endpoint }),
    });
  },

  optInNotifications: async (endpoint) => {
    return safeFetch(`${API_URL}/notifications/opt-in`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify({ endpoint }),
    });
  },
};
