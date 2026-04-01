import http from "http";
import express from "express";
import loginRoute from "./authRoutes/loginRoute.ts";
import registerRoute from "./authRoutes/registerRoute.ts";

const app = express();
const port = 4000;

app.use("/api/login", loginRoute);
app.use("/api/register", registerRoute);


app.get("/", (req, res) => {
    res.send("Hello World");
});


const server = http.createServer(app);  

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});