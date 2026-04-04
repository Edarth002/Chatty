import express from "express";
import { createServer } from "http";
import { RawData, WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import verifyToken from "../lib/verifyToken.ts";

const app = express();

const server = createServer(app);


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
    const token = reqUrl.searchParams.get("token") || "";

    if(!token){
        console.log("Connection rejected: No token provided");
        return ws.close();
    }

    const decoded = verifyToken(token);

    if (!decoded) {
        console.log("Connection rejected: Invalid token");
        return ws.close();
    }

    ws.userId = String(decoded.userId);
    console.log("Conversion to String successful");
    
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
            if (typeof parsed !== "object" || !parsed.type || !parsed.to || !parsed.content) {
                console.log("Invalid message structure");
                return;
            }
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

    if(message.to === from){
        console.log("Cannot send message to self");
        return;
    }

    if(!message.to || !message.content){
        console.log("Missing recipient or content");
        return;
    }

    if(message.type !== "message"){
        console.log("Unsupported message type");
        return;
    }

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
