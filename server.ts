import http from "http";
import express from "express";
import cors from "cors";
import { setupWebSocket } from "./app/chatRoute.ts";
import loginRoute from "./authRoutes/loginRoute.ts";
import registerRoute from "./authRoutes/registerRoute.ts";
import meRoute from "./authRoutes/meRoute.ts";
import usersRoute from "./authRoutes/usersRoute.ts";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use("/api", loginRoute);
app.use("/api", registerRoute);
app.use("/api", meRoute);
app.use("/api", usersRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const server = http.createServer(app);

setupWebSocket(server); // <-- attach WS to the same server

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});