export interface RegisterInput {
    email: string;
    username?: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    expiresAt: Date;
    user: {
        id: string;
        email: string;
        username: string | null;
    };
}

export interface IAuthService {
    register(input: RegisterInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
}
