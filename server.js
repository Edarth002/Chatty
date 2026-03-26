import { createServer } from "http";
import WebSocket, { WebSocketServer } from "ws";

const host = "localhost";
const port = 5000

const server = createServer((req, res)=>{
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello World\n")
});


const wss = new WebSocketServer({ server });


const connectedUsers = {}
const offlineMessages = {}

wss.on("connection", (ws, req) => {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    ws.userId = (reqUrl.searchParams.get("userId") || "unknown").trim();
    const userId = ws.userId;

    if (!connectedUsers[userId]) connectedUsers[userId] = [];
    connectedUsers[userId].push(ws);

    console.log("Connected Users:", Object.keys(connectedUsers));


    if (offlineMessages[userId] && offlineMessages[userId].length > 0) {
        offlineMessages[userId].forEach(msg => ws.send(JSON.stringify(msg)));
        offlineMessages[userId] = [];
    }

    ws.on("message", (data)=>{
        try {
            const parsed = JSON.parse(data);
            handleMessage(parsed, ws)
        } catch (error) {
            console.log("Invalid Message Format");
            
        }
    })

    ws.on("close", ()=>{
        console.log(`${userId} is disconnected`);
        connectedUsers[userId] = connectedUsers[userId].filter(conn => conn !== ws);

        if (connectedUsers[userId].length === 0){
            delete connectedUsers[userId];
            console.log("Updated connected users: ", Object.keys(connectedUsers));
            
        }
        
    })
    
})

function handleMessage(message, ws) {
    const { type, to, content } = message;
    const from = ws.userId;

    if (type === "message") {
        const msgObj = {
            id: Date.now().toString(),
            from,
            to,
            content,
            timestamp: Date.now()
        };

        const receivers = connectedUsers[to];

        if (receivers && receivers.length > 0) {
            receivers.forEach(conn => conn.send(JSON.stringify(msgObj)));
        } else {
            if (!offlineMessages[to]) offlineMessages[to] = [];
            offlineMessages[to].push(msgObj);
        }
    }
}


server.listen(port, host,()=>{
    console.log("Server is running on port 5000")
})