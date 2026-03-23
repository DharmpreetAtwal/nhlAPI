import express from "express";
import { AuthController } from "../controllers/authController";
import { PrismaAuthService } from "../services/prismaAuthService";

export const AuthRouterV1 = express.Router();

const authService = new PrismaAuthService();
const authController = new AuthController(authService);

AuthRouterV1.post("/register", authController.register);
AuthRouterV1.post("/login", authController.login);
