"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const playerRoutes_1 = require("./routes/playerRoutes");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use("/players", playerRoutes_1.PlayerRouter);
