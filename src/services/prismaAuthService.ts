import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { ConflictError, UnauthorizedError } from "../errors/httpClientErrors";
import crypto from "crypto";
import { IAuthService, RegisterInput, LoginInput, AuthResponse } from "../interfaces/iAuthService";

const SESSION_EXPIRY_HOURS = 24;

export class PrismaAuthService implements IAuthService {
    async register(input: RegisterInput): Promise<AuthResponse> {
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: input.email },
                    ...(input.username ? [{ username: input.username }] : [])
                ]
            }
        });

        if (existingUser) {
            if (existingUser.email === input.email) {
                throw new ConflictError("Email already registered");
            }
            if (existingUser.username === input.username) {
                throw new ConflictError("Username already taken");
            }
        }

        const hashedPassword = await bcrypt.hash(input.password, 10);

        const user = await prisma.user.create({
            data: {
                email: input.email,
                username: input.username || null,
                password: hashedPassword
            }
        });

        return this.createSession(user.id, user.email, user.username);
    }

    async login(input: LoginInput): Promise<AuthResponse> {
        const user = await prisma.user.findUnique({
            where: { email: input.email }
        });

        if (!user) {
            throw new UnauthorizedError("Invalid email or password");
        }

        const passwordMatch = await bcrypt.compare(input.password, user.password);

        if (!passwordMatch) {
            throw new UnauthorizedError("Invalid email or password");
        }

        return this.createSession(user.id, user.email, user.username);
    }

    private async createSession(
        userId: string,
        email: string,
        username: string | null
    ): Promise<AuthResponse> {
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + SESSION_EXPIRY_HOURS);

        const session = await prisma.session.create({
            data: {
                userId,
                token: this.generateToken(),
                expiresAt
            }
        });

        return {
            token: session.token,
            expiresAt: session.expiresAt,
            user: {
                id: userId,
                email,
                username
            }
        };
    }

    private generateToken(): string {
        return crypto.randomBytes(32).toString("base64url");
    }
}
