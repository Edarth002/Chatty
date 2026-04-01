import { Router } from "express";
import { RegisterUser } from "../lib/authService.ts";
import { registerSchema } from "../authControllers/authschema.ts";
import { ZodError } from "zod";

const router = Router();


router.post("/auth/register", async (req, res) => {
  try {
    const response = await RegisterUser(registerSchema.parse(req.body));    
    res.status(response.status).json(response.body);
  } catch (error) {
    console.error("Something is wrong here: ", error);
    
    if (error instanceof ZodError) {
      res.status(400).json({ error: error});
    }

    res.status(500).json({ error: "Internal Server Error" });   
    }
});

export default router;