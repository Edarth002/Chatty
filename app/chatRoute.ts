import { createServer } from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";

const host = "localhost";
const port = 5000

const server = createServer((req, res)=>{
    res.writeHead(200, {"Content-Type": "text/plain"});
    res.end("Hello World\n")
});


interface Message {
    id: string,
    type?: "message",
    from: string,
    to:string,
    content: string,
    timestamp: number
}

interface AuthenticatedWebsocket extends WebSocket{
    userId: string
}


 const wss = new WebSocketServer({ server });

const connectedUsers:Record<string, AuthenticatedWebsocket[]> = {}
const offlineMessages:Record<string, Message[]> = {}

wss.on("connection", (ws:AuthenticatedWebsocket, req:IncomingMessage) => {
if (!req.url) {
    return ws.close()
}

    

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

    ws.on("message", (data:RawData)=>{
        try {
            const parsed = JSON.parse(data.toString());
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

function handleMessage(message:Message, ws:AuthenticatedWebsocket) {
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
