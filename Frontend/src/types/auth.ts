export type User = {
  username: string;
  name: string;
};

export type AuthResponse = {
  message: string;
  token?: string;
  user: User;
};

export type LoginPayload = {
  username: string;
  password: string;
};