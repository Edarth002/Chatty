import { Router } from "express";
import { loginSchema } from "../authControllers/authschema.ts";
import { LoginUser } from "../lib/authService.ts";

const router = Router();

router.post("/auth/login", async (req, res) => {
  try {
    const response = await LoginUser(loginSchema.parse(req.body));
    res.status(response.status).json(response.body);

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;