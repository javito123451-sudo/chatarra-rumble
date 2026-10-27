// Servidor de salas de Chatarra Rumble.
// No simula el juego: crea salas con código de 4 letras y reenvía los mensajes de cada jugador al resto de la sala.
// El primer jugador de la sala es el anfitrión (controla bots, marea y cajas). Si se va, el siguiente pasa a serlo.
const http = require('http');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const MAX_PLAYERS = 18;
const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // sin I ni O para no confundir con 1 y 0
const CONTROL = new Set(['create', 'join', 'start']);
const rooms = new Map(); // código -> { code, hostId, players: Map(id -> {id, name, char, ws}) }
let nextId = 1;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'access-control-allow-origin': '*' });
  res.end(`Chatarra Rumble: ${rooms.size} salas activas\n`);
});
const wss = new WebSocketServer({ server, maxPayload: 64 * 1024 });

function send(ws, msg) { if (ws.readyState === 1) ws.send(typeof msg === 'string' ? msg : JSON.stringify(msg)); }
function playerList(room) { return [...room.players.values()].map(p => ({ id: p.id, name: p.name, char: p.char })); }
function broadcast(room, msg, exceptId) {
  const data = JSON.stringify(msg);
  for (const p of room.players.values()) if (p.id !== exceptId) send(p.ws, data);
}
function newCode() {
  for (let i = 0; i < 1000; i++) {
    let c = '';
    for (let k = 0; k < 4; k++) c += LETTERS[Math.floor(Math.random() * LETTERS.length)];
    if (!rooms.has(c)) return c;
  }
  return null;
}
function cleanName(n) { return String(n || 'Chatarrero').replace(/[<>]/g, '').trim().slice(0, 12) || 'Chatarrero'; }
function cleanChar(c) { return ['brasa', 'garfio', 'chispa', 'bafle'].includes(c) ? c : 'brasa'; }

function joinRoom(ws, room, msg) {
  const id = 'p' + (nextId++);
  room.players.set(id, { id, name: cleanName(msg.name), char: cleanChar(msg.char), ws });
  ws.playerId = id;
  ws.roomCode = room.code;
  send(ws, { t: 'joined', id, code: room.code, hostId: room.hostId || id, players: playerList(room) });
  if (!room.hostId) room.hostId = id;
  broadcast(room, { t: 'lobby', players: playerList(room), hostId: room.hostId }, id);
}

function leave(ws) {
  const room = rooms.get(ws.roomCode);
  if (!room) return;
  const id = ws.playerId;
  room.players.delete(id);
  ws.roomCode = null;
  if (room.players.size === 0) { rooms.delete(room.code); return; }
  broadcast(room, { t: 'left', id });
  if (room.hostId === id) {
    room.hostId = room.players.keys().next().value;
    broadcast(room, { t: 'host', id: room.hostId });
  }
  broadcast(room, { t: 'lobby', players: playerList(room), hostId: room.hostId });
}

wss.on('connection', ws => {
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });
  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }
    if (!msg || typeof msg.t !== 'string') return;

    if (msg.t === 'create') {
      if (ws.roomCode) leave(ws);
      const code = newCode();
      if (!code) return send(ws, { t: 'err', msg: 'No hay salas libres, prueba en un momento.' });
      const room = { code, hostId: null, players: new Map() };
      rooms.set(code, room);
      joinRoom(ws, room, msg);
      return;
    }
    if (msg.t === 'join') {
      const room = rooms.get(String(msg.code || '').toUpperCase());
      if (!room) return send(ws, { t: 'err', msg: 'No existe ninguna sala con ese código.' });
      if (room.players.size >= MAX_PLAYERS) return send(ws, { t: 'err', msg: 'La sala está llena (18 jugadores).' });
      if (ws.roomCode) leave(ws);
      joinRoom(ws, room, msg);
      return;
    }
    const room = rooms.get(ws.roomCode);
    if (!room) return;
    if (msg.t === 'start') {
      if (room.hostId !== ws.playerId) return;
      const seed = Number.isFinite(msg.seed) ? msg.seed | 0 : Math.floor(Math.random() * 2147483647);
      broadcast(room, { t: 'start', seed, hostId: room.hostId, players: playerList(room) });
      return;
    }
    if (CONTROL.has(msg.t)) return;
    // Mensajes de partida: se reenvían tal cual al resto de la sala
    msg.from = ws.playerId;
    broadcast(room, msg, ws.playerId);
  });
  ws.on('close', () => leave(ws));
  ws.on('error', () => {});
});

// Corta conexiones muertas cada 30 s
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false;
    try { ws.ping(); } catch {}
  }
}, 30000);

server.listen(PORT, () => console.log(`Chatarra Rumble escuchando en el puerto ${PORT}`));
