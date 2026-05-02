export interface User {
  id?: number;
  username: string;
  fullName: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
}
