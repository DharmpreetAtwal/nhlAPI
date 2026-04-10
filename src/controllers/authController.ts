import { Request, Response, NextFunction } from "express";
import { IAuthService } from "../interfaces/iAuthService";

export class AuthController {
    private authService: IAuthService;

    constructor(authService: IAuthService) {
        this.authService = authService;
    }

    register = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email, username, password } = req.body;

            const result = await this.authService.register({
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

            const result = await this.authService.login({
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
