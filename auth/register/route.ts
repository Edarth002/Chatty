import bcrypt from "bcrypt";
import jsonwebtoken from "jsonwebtoken";
import { registerSchema } from "../authschema.js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = registerSchema.parse(body);
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Failed to register user" }),
        { status: 400 }
      );
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    const token = jsonwebtoken.sign(
      { userId: user.id, username: user.username },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    return new Response(
      JSON.stringify({ message: "User registered successfully", token }),
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return new Response(
      JSON.stringify({ error: "Failed to register user" }),
      { status: 500 }
    );
  } 
}