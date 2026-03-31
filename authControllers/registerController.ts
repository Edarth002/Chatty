import { registerSchema } from "./authschema.js";
import { ZodError } from "zod";
import { RegisterUser } from "../lib/authService.js";

export async function POST(request: Request) {
  try {

    const body = await request.json();
    const parsed = registerSchema.parse(body);

    const {status, body: responseBody} = await RegisterUser(parsed);

    return new Response(
      JSON.stringify(responseBody),
      {
        status,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ error: error.issues }),
        { status: 400 }
      );
    }

    console.error("Error registering user:", error);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}