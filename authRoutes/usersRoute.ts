import { Router } from "express";
import prisma from '../lib/prisma.ts';

const app = Router();

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
    });

    res.json(users);
  } catch (error) {
    return new Response('Server error', { status: 500 });
  }
});

export default app;
