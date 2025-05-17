import axios from "axios"

// Create an axios instance with custom config
const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  // Important for cookie-based auth
  withCredentials: true,
})

// Add a request interceptor for common request processing
apiClient.interceptors.request.use(
  (config) => {
    // With Supabase, we don't need to manually add auth tokens
    // Cookies are automatically sent with requests
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add a response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common errors (unauthorized, forbidden, etc.)
    if (error.response) {
      // Global error handling
      if (error.response.status === 401) {
        // Handle unauthorized - e.g., redirect to login
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
