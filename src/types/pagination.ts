declare global {
  namespace Express {
    interface Request {
      pagination: {
        limit?: number;
        nextCursor?: number;
      };
    }
  }
}

export {};