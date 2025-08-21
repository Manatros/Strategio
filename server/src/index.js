// src/index.js
require("dotenv").config();
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");

const PORT = Number(process.env.PORT || 3000);
const PROTOCOL_VERSION = process.env.PROTOCOL_VERSION || "0.0.1";
const TICK_RATE = Number(process.env.TICK_RATE || 10);
const TICK_MS = Math.round(1000 / TICK_RATE);

const app = express();
app.get("/health", (_req, res) => res.status(200).send("ok"));
app.get("/version", (_req, res) =>
  res.json({ protocol: PROTOCOL_VERSION, tickRate: TICK_RATE })
);

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let nextClientId = 1;
const clients = new Map();

function send(ws, type, data = {}) {
  try { ws.send(JSON.stringify({ type, ...data })); } catch {}
}

wss.on("connection", (ws) => {
  let accepted = false;
  const id = `c${nextClientId++}`;

  // Expect a handshake first
  ws.once("message", (raw) => {
    let msg;
    try { msg = JSON.parse(String(raw)); } catch {
      send(ws, "error", { message: "invalid json" });
      return ws.close(1002, "bad json");
    }

    if (msg.type !== "handshake" || typeof msg.protocol !== "string") {
      send(ws, "error", { message: "handshake required" });
      return ws.close(1002, "bad handshake");
    }

    if (msg.protocol !== PROTOCOL_VERSION) {
      send(ws, "update_required", {
        serverProtocol: PROTOCOL_VERSION,
        clientProtocol: msg.protocol,
      });
      return ws.close(4000, "protocol mismatch");
    }

    // accept client
    const client = {
      id, ws, lastSeq: 0, lastPingAt: Date.now(), inputBuffer: []
    };
    clients.set(id, client);
    accepted = true;

    send(ws, "welcome", { id, protocol: PROTOCOL_VERSION, tickRate: TICK_RATE });

    const pingInt = setInterval(() => {
      if (ws.readyState === ws.OPEN) send(ws, "ping", { t: Date.now() });
    }, 5000);

    ws.on("close", () => {
      clearInterval(pingInt);
      clients.delete(id);
    });

    ws.on("message", (raw2) => {
      try {
        const m = JSON.parse(String(raw2));
        if (m.type === "pong" && typeof m.t === "number") {
          // optional: track rtt
        } else if (m.type === "input") {
          client.inputBuffer.push({ seq: m.seq ?? 0, t: Date.now(), input: m.input });
          client.lastSeq = m.seq ?? client.lastSeq;
        }
      } catch {}
    });
  });

  setTimeout(() => {
    if (!accepted && ws.readyState === ws.OPEN) {
      send(ws, "error", { message: "handshake timeout" });
      ws.close(1002, "no handshake");
    }
  }, 5000);
});

// minimal lockstep broadcaster: flush inputs every tick
setInterval(() => {
  const tickAt = Date.now();
  const snapshot = {};
  for (const [id, c] of clients) {
    if (c.inputBuffer.length) {
      snapshot[id] = c.inputBuffer.splice(0, c.inputBuffer.length);
    }
  }
  if (Object.keys(snapshot).length) {
    const packet = JSON.stringify({ type: "tick", t: tickAt, inputs: snapshot });
    for (const c of clients.values()) {
      if (c.ws.readyState === c.ws.OPEN) c.ws.send(packet);
    }
  }
}, TICK_MS);

server.listen(PORT, () => {
  console.log(`[server] :${PORT} protocol=${PROTOCOL_VERSION} ${TICK_RATE}Hz`);
});
