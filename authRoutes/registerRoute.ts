import express from "express";
import { RegisterUser } from "../lib/authService.ts";
import { registerSchema } from "../authControllers/authschema.ts";

const app = express();

app.post("/auth/register", async (req, res) => {
  try {
    const response = await RegisterUser(registerSchema.parse(req.body));    
    res.status(response.status).json(response.body);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });   
    }
});

export default app;