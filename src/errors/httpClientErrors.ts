// Base HTTP Error class
export class HttpClientError extends Error {
    constructor(
        public statusCode: number,
        message: string,
        public isOperational: boolean = true
    ) {
        super(message);
        Object.setPrototypeOf(this, HttpClientError.prototype);
    }
}

// Specific error types
export class BadRequestError extends HttpClientError {
    constructor(message: string) {
        super(400, message);
        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}

export class NotFoundError extends HttpClientError {
    constructor(message: string) {
        super(404, message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
}

export class UnauthorizedError extends HttpClientError {
    constructor(message: string) {
        super(401, message);
        Object.setPrototypeOf(this, UnauthorizedError.prototype);
    }
}

export class ForbiddenError extends HttpClientError {
    constructor(message: string) {
        super(403, message);
        Object.setPrototypeOf(this, ForbiddenError.prototype);
    }
}

export class ConflictError extends HttpClientError {
    constructor(message: string) {
        super(409, message);
        Object.setPrototypeOf(this, ConflictError.prototype);
    }
}