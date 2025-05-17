// Frontend utilities for API communication
import axios from "axios"
import apiClient from "./apiClient"

// Helper to extract error messages from API responses
function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    // If there's a response object available
    if (error.response) {
      // If the error response contains a structured error object
      if (error.response.data && typeof error.response.data === "object") {
        if (error.response.data.error) {
          return error.response.data.error
        }
        if (error.response.data.message) {
          return error.response.data.message
        }
      }

      // If the error has a status text
      if (error.response.statusText) {
        return `${error.response.status}: ${error.response.statusText}`
      }

      // Generic error based on status code
      if (error.response.status === 500) {
        return "Server error. Please try again later."
      }
    }

    // If there's a network error
    if (error.request && !error.response) {
      return "Network error. Please check your connection and try again."
    }

    // If Axios has a message
    if (error.message) {
      return error.message
    }
  }

  // Fallback to generic error or the error message if available
  return error instanceof Error ? error.message : "An unexpected error occurred"
}

export async function fetchFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await apiClient.get<T>(endpoint)
    return response.data
  } catch (error) {
    console.error("API error:", error)
    throw new Error(extractErrorMessage(error))
  }
}

export async function postToApi<T, D = Record<string, unknown>>(
  endpoint: string,
  data: D
): Promise<T> {
  try {
    const response = await apiClient.post<T>(endpoint, data)
    return response.data
  } catch (error) {
    console.error("API error:", error)
    throw new Error(extractErrorMessage(error))
  }
}

// Add more methods as needed
export async function putToApi<T, D = Record<string, unknown>>(
  endpoint: string,
  data: D
): Promise<T> {
  try {
    const response = await apiClient.put<T>(endpoint, data)
    return response.data
  } catch (error) {
    console.error("API error:", error)
    throw new Error(extractErrorMessage(error))
  }
}

export async function deleteFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await apiClient.delete<T>(endpoint)
    return response.data
  } catch (error) {
    console.error("API error:", error)
    throw new Error(extractErrorMessage(error))
  }
}
