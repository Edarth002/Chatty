import { Server } from "http";
import { type RawData, WebSocket, WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import verifyToken from "../lib/verifyToken.ts";

interface Message {
  id: string;
  type?: "message";
  from: string;
  to: string;
  content: string;
  timestamp: number;
}

interface AuthenticatedWebsocket extends WebSocket {
  userId: string;
}

const connectedUsers: Record<string, AuthenticatedWebsocket[]> = {};
const offlineMessages: Record<string, Message[]> = {};

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server }); // shares the HTTP server

  wss.on("connection", (ws: AuthenticatedWebsocket, req: IncomingMessage) => {
    if (!req.url) return ws.close();

    const reqUrl = new URL(req.url, `http://${req.headers.host}`);
    const token = reqUrl.searchParams.get("token") || "";

    if (!token) {
      console.log("Connection rejected: No token provided");
      return ws.close();
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      console.log("Connection rejected: Invalid token");
      return ws.close();
    }

    ws.userId = String(decoded.userId);
    const userId = ws.userId;

    if (!connectedUsers[userId]) connectedUsers[userId] = [];
    connectedUsers[userId].push(ws);
    console.log("Connected Users:", Object.keys(connectedUsers));

    if (offlineMessages[userId]?.length > 0) {
      offlineMessages[userId].forEach((msg) => ws.send(JSON.stringify(msg)));
      offlineMessages[userId] = [];
    }

    ws.on("message", (data: RawData) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (!parsed.type || !parsed.to || !parsed.content) {
          console.log("Invalid message structure");
          return;
        }
        handleMessage(parsed, ws);
      } catch {
        console.log("Invalid message format");
      }
    });

    ws.on("close", () => {
      connectedUsers[userId] = connectedUsers[userId].filter((c) => c !== ws);
      if (connectedUsers[userId].length === 0) {
        delete connectedUsers[userId];
      }
      console.log("Updated connected users:", Object.keys(connectedUsers));
    });
  });
}

function handleMessage(message: Message, ws: AuthenticatedWebsocket) {
  const { type, to, content } = message;
  const from = ws.userId;

  if (to === from) return console.log("Cannot send message to self");
  if (!to || !content) return console.log("Missing recipient or content");
  if (type !== "message") return console.log("Unsupported message type");

  const msgObj: Message = {
    id: Date.now().toString(),
    from,
    to,
    content,
    timestamp: Date.now(),
  };

  const receivers = connectedUsers[to];
  if (receivers?.length > 0) {
    receivers.forEach((conn) => conn.send(JSON.stringify(msgObj)));
  } else {
    if (!offlineMessages[to]) offlineMessages[to] = [];
    offlineMessages[to].push(msgObj);
  }
}