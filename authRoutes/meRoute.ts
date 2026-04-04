import express from "express";
import verifyToken from "../lib/verifyToken.ts";

const app = express();

app.get("/me", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }   
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    if (!decoded) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    res.json({ userId: decoded.userId });
})

export default app;