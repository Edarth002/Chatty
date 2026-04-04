import http from "http";
import express from "express";
import loginRoute from "./authRoutes/loginRoute.ts";
import registerRoute from "./authRoutes/registerRoute.ts";
import meRoute from "./authRoutes/meRoute.ts";
import cors from "cors";

const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());

app.use("/api", loginRoute);
app.use("/api", registerRoute);
app.use("/api", meRoute);


app.get("/", (req, res) => {
    res.send("Hello World");
});


const server = http.createServer(app);  

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});