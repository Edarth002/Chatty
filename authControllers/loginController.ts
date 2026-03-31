import { LoginUser } from "../lib/authService.js";
import { loginSchema } from "./authschema.js";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    const parsed = loginSchema.parse(body);

    const {status, body: responseBody} = await LoginUser(parsed);
  
    
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ error: error.issues }),
        { status: 400 }
      );
    }

    console.error("Login error:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}