import express from "express";
import { POST } from "../authControllers/loginController.js";

const app = express();

app.post("/auth/login", async (req, res) => {
  try {
    const response = await POST(req);

    res
      .status(response.status)
      .json(JSON.parse(response.body));

  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});