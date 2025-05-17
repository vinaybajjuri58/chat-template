// Backend type definitions

export type User = {
  id: string
  name: string
  email: string
  createdAt: string // ISO date string format
}

export type ApiResponse<T> = {
  data?: T
  error?: string
  status: number
  emailVerificationRequired?: boolean
}

export type RouteContext = {
  params: {
    id: string
  }
}

export type LoginRequest = {
  email: string
  password: string
}

export type SignupRequest = {
  name: string
  email: string
  password: string
}

export type AuthResponse = {
  user: User
  token?: string
  emailVerified?: boolean
}
