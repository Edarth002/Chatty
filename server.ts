import http from "http";
import express from "express";

const app = express();
const port = 5000;

app.get("/", (req, res) => {
    res.send("Hello World");
});

const server = http.createServer(app);  

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});