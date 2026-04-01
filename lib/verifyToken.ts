import jwt from "jsonwebtoken";

export default function verifyToken(token: string): { userId: number; username: string } | null {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined"); 
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; username: string };
      return decoded;
    } catch (error) {
      console.error("Token verification failed:", error);
      return null;
    }
    }