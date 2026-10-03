export type User = {
  email: string;
  name: string;
};

export type AuthResponse = {
  message: string;
  user: User;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  name: string;
  password: string;
};
