import { Request, Response, NextFunction } from "express";
import { PrismaAuthService } from "../services/prismaAuthService";

export class AuthController {
    private prismaAuthService: PrismaAuthService;

    constructor(prismaAuthService: PrismaAuthService) {
        this.prismaAuthService = prismaAuthService;
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, username, password } = req.body;

            const result = await this.prismaAuthService.register({
                email,
                username,
                password
            });

            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, password } = req.body;

            const result = await this.prismaAuthService.login({
                email,
                password
            });

            res.status(200).json({
                success: true,
                message: "Login successful",
                data: result
            });
        } catch (error) {
            next(error);
        }
    };
}
