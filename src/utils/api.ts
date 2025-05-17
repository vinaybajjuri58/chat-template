// Frontend utilities for API communication
import axios from "axios"
import apiClient from "./apiClient"

export async function fetchFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await apiClient.get<T>(endpoint)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "An error occurred")
    }
    throw new Error("An unexpected error occurred")
  }
}

export async function postToApi<T>(endpoint: string, data: any): Promise<T> {
  try {
    const response = await apiClient.post<T>(endpoint, data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "An error occurred")
    }
    throw new Error("An unexpected error occurred")
  }
}

// Add more methods as needed
export async function putToApi<T>(endpoint: string, data: any): Promise<T> {
  try {
    const response = await apiClient.put<T>(endpoint, data)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "An error occurred")
    }
    throw new Error("An unexpected error occurred")
  }
}

export async function deleteFromApi<T>(endpoint: string): Promise<T> {
  try {
    const response = await apiClient.delete<T>(endpoint)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || "An error occurred")
    }
    throw new Error("An unexpected error occurred")
  }
}
