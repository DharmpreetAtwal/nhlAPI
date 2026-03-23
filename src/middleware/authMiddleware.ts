import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { UnauthorizedError } from "../errors/httpClientErrors";

export interface AuthenticatedRequest extends Request {
    user?: {
        id: string;
        email: string;
        username: string | null;
    };
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedError("Missing or invalid authorization header");
        }

        const token = authHeader.substring(7);

        const session = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!session) {
            throw new UnauthorizedError("Invalid session token");
        }

        if (new Date() > session.expiresAt) {
            throw new UnauthorizedError("Session has expired");
        }

        req.user = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.username
        };

        next();
    } catch (error) {
        next(error);
    }
};
