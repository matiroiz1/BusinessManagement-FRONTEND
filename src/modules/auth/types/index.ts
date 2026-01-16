export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  userId: string;
  username: string;
  role: 'ADMIN' | 'MANAGER' | 'SELLER' | 'WAREHOUSE_OPERATOR' | 'CUSTOMER';
}