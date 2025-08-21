const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "ws://localhost:3000";
const PROTOCOL_VERSION = import.meta.env.VITE_PROTOCOL_VERSION ?? "0.0.1";

let socket: WebSocket | null = null;
let connecting = false;

function doHandshake(ws: WebSocket) {
  try {
    ws.send(JSON.stringify({ type: "handshake", protocol: PROTOCOL_VERSION }));
  } catch (e) {
    console.warn("[client] handshake send failed:", e);
  }
}

export function connect(): WebSocket {
  // Singleton guard
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }
  if (connecting) return socket!;

  connecting = true;
  const ws = new WebSocket(SERVER_URL);
  socket = ws;

  // If already open (very rare), send immediately
  if (ws.readyState === WebSocket.OPEN) doHandshake(ws);
  else ws.addEventListener("open", () => {
    console.log("[client] ws open");
    doHandshake(ws);
  });

  ws.addEventListener("message", (ev) => {
    const msg = JSON.parse(String(ev.data));
    if (msg.type === "welcome") {
      console.log("[client] welcome", msg);
    } else if (msg.type === "update_required") {
      console.error("[client] update required", msg);
    } else if (msg.type === "ping") {
      ws.send(JSON.stringify({ type: "pong", t: msg.t }));
    } else if (msg.type === "tick") {
      // apply tick inputs later
    } else if (msg.type === "error") {
      console.warn("[client] server error:", msg.message);
    }
  });

  ws.addEventListener("close", (e) => {
    console.log("[client] ws closed", e.code, e.reason);
    connecting = false;
    socket = null;
  });
  ws.addEventListener("error", (e) => {
    console.error("[client] ws error", e);
  });

  // HMR-safe: close old socket when this module is replaced
  if (import.meta.hot) {
    import.meta.hot.dispose(() => {
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.close(1000, "hmr dispose");
      }
      socket = null;
      connecting = false;
    });
  }

  connecting = false;
  return ws;
}

export function sendInput(input: any, seq: number) {
  if (!socket || socket.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ type: "input", input, seq }));
}
