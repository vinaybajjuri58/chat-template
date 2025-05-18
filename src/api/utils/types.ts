// Backend type definitions

export type TUser = {
  id: string
  name: string
  email: string
  createdAt: string // ISO date string format
}

export type TApiResponse<T> = {
  data?: T
  error?: string
  status: number
  emailVerificationRequired?: boolean
}

export type TRouteContext = {
  params: {
    id: string
  }
}

export type TLoginRequest = {
  email: string
  password: string
}

export type TSignupRequest = {
  name: string
  email: string
  password: string
}

export type TAuthResponse = {
  user: TUser
  token?: string
  emailVerified?: boolean
}
