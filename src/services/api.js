const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

if (import.meta.env.DEV) {
  console.log("API URL initialized at:", API_URL);
}

/**
 * Error carrying the HTTP status, so callers can tell "you're rate limited"
 * from "your session expired" from "the server is down" instead of matching on
 * message text.
 */
export class ApiError extends Error {
  constructor(message, status, { isNetwork = false } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetwork = isNetwork;
  }
}

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (response, url) => {
  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const text = await response.text();

  if (!isJson) {
    // The API returns JSON for every status, including 404, 429 and 500. A
    // non-JSON body means something in front of the API answered instead —
    // a proxy, a CDN error page, or a misrouted request.
    console.error("Non-JSON response received:", {
      status: response.status,
      url: response.url,
      preview: text.slice(0, 200),
    });
    throw new ApiError(
      response.ok
        ? "The server sent an unexpected response. Please try again."
        : `The server is not responding correctly (${response.status}). Please try again shortly.`,
      response.status
    );
  }

  if (!text.trim()) {
    if (!response.ok) {
      throw new ApiError(`Request failed (${response.status}).`, response.status);
    }
    return {};
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`Failed to parse JSON response from ${url}:`, text);
    throw new ApiError("The server sent a malformed response.", response.status);
  }

  if (!response.ok) {
    if (response.status === 429) {
      throw new ApiError(
        data.message || "Too many requests. Please wait a moment and try again.",
        429
      );
    }
    throw new ApiError(data.message || data.error || `Request failed (${response.status}).`, response.status);
  }

  return data;
};

const safeFetch = async (url, options) => {
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    console.error("NETWORK ERROR:", url, error);
    throw new ApiError(
      "Can't reach DriveDoc right now. Check your connection and try again.",
      0,
      { isNetwork: true }
    );
  }
  return handleResponse(response, url);
};

const authed = (method, body) => ({
  method,
  headers: getHeaders(),
  credentials: "include",
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

const open = (method, body) => ({
  method,
  headers: { "Content-Type": "application/json" },
  credentials: "include",
  ...(body !== undefined && { body: JSON.stringify(body) }),
});

export const api = {
  // --- Auth -----------------------------------------------------------------
  signup: async (userData) => {
    const data = await safeFetch(`${API_URL}/auth/signup`, open("POST", userData));
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  login: async (credentials) => {
    const data = await safeFetch(`${API_URL}/auth/login`, open("POST", credentials));
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  // Takes a Google *credential* (ID token). An access token can't be verified
  // as having been issued for this app, so the backend no longer accepts one.
  oauthGoogle: async (credential) => {
    const data = await safeFetch(`${API_URL}/auth/oauth/google`, open("POST", { credential }));
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  forgotPassword: async (email) =>
    safeFetch(`${API_URL}/auth/forgot-password`, open("POST", { email })),

  resetPassword: async (token, password) => {
    const data = await safeFetch(`${API_URL}/auth/reset-password`, open("POST", { token, password }));
    if (data.token) localStorage.setItem("token", data.token);
    return data;
  },

  getMe: async () => safeFetch(`${API_URL}/auth/me`, authed("GET")),

  updateProfile: async (profile) => safeFetch(`${API_URL}/auth/me`, authed("PUT", profile)),

  deleteAccount: async () => safeFetch(`${API_URL}/auth/me`, authed("DELETE")),

  exportMyData: async () => safeFetch(`${API_URL}/auth/me/export`, authed("GET")),

  logout: async () => {
    // Clear the local token first so a failed network call still signs the
    // user out of this device.
    localStorage.removeItem("token");
    localStorage.removeItem("pushSubscription");
    localStorage.removeItem("notifications_enabled");
    try {
      await safeFetch(`${API_URL}/auth/logout`, open("POST"));
    } catch {
      // The cookie expires on its own; nothing useful to tell the user here.
    }
  },

  // --- Documents ------------------------------------------------------------
  getDocuments: async () => safeFetch(`${API_URL}/documents`, authed("GET")),

  addDocument: async (docData) => safeFetch(`${API_URL}/documents`, authed("POST", docData)),

  updateDocument: async (id, docData) =>
    safeFetch(`${API_URL}/documents/${id}`, authed("PUT", docData)),

  deleteDocument: async (id) => safeFetch(`${API_URL}/documents/${id}`, authed("DELETE")),

  // --- Renewal guidance -----------------------------------------------------
  // Public editorial content, cacheable, no auth needed.
  getRenewalGuidance: async (country, type) =>
    safeFetch(
      `${API_URL}/guidance?country=${encodeURIComponent(country || "")}&type=${encodeURIComponent(type)}`,
      { headers: { "Content-Type": "application/json" } }
    ),

  // --- Driving schools -------------------------------------------------------
  // DriveDoc lists schools from public map data; it does not book with them.
  findSchools: async ({ lat, lng, q }) => {
    const params = new URLSearchParams();
    if (typeof lat === "number" && typeof lng === "number") {
      params.set("lat", String(lat));
      params.set("lng", String(lng));
    }
    if (q) params.set("q", q);
    return safeFetch(`${API_URL}/schools?${params.toString()}`, authed("GET"));
  },

  // --- Notifications --------------------------------------------------------
  getNotificationPublicKey: async () =>
    safeFetch(`${API_URL}/notifications/public-key`, { credentials: "include" }),

  subscribeToPush: async (subscription) =>
    safeFetch(`${API_URL}/notifications/subscribe`, authed("POST", subscription)),

  optOutNotifications: async (endpoint) =>
    safeFetch(`${API_URL}/notifications/opt-out`, authed("POST", { endpoint })),

  optInNotifications: async (endpoint) =>
    safeFetch(`${API_URL}/notifications/opt-in`, authed("POST", { endpoint })),

  // Email reminders are a separate channel from push: they work without a
  // browser permission or an installed PWA, so they are on by default.
  setEmailReminders: async (enabled) =>
    safeFetch(`${API_URL}/notifications/email`, authed("PUT", { enabled })),
};
