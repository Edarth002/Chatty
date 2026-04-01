import jwt from "jsonwebtoken";
import prisma from "./prisma.ts";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

export async function RegisterUser({username, email, password}: {username: string, email: string, password: string}) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined"); 
    }
        const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Registration failed" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return{
        status: 201,
        body:{
            message: "User registered successfully",
            token,
        }
    }
    }

export async function LoginUser({username, password}: {username: string, password: string}) {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined"); 
    }
      const user = await prisma.user.findUnique({
          where: { username },
        });
    
        if (!user) {
          return new Response(
            JSON.stringify({ error: "Authentication failed" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
          return new Response(
            JSON.stringify({ error: "Authentication failed" }),
            {
              status: 401,
              headers: { "Content-Type": "application/json" },
            }
          );
        }
    
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return {
              status:201,
              body:{
                message: "Login successful",
                token,
              }
        }
}