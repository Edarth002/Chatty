import { createServer } from "http";
import WebSocket from "ws";

const host = "localhost";
const port = 5000

const server = createServer((req, res)=>{
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello World\n")
});

// const {ws1, ws2} = new WebSocket();

// const connectedUsers = {
//     "Arthur": [ws1],
//     "Nelson": [ws2]
// }

const offlineMessages = {}


server.listen(port, host,()=>{
    console.log("Server is running on port 5000")
})