# Chatarra Rumble

Battle royale web 3D (Three.js) con modo multijugador por salas.

- `index.html`: el juego completo. Vercel lo sirve tal cual (sin compilación).
- `server/`: servidor Node de salas (WebSocket). Render lo arranca con `node server/server.js`.

El juego se conecta por defecto a `wss://chatarra-rumble-server.onrender.com`.
Para probar con otro servidor: añade `?server=wss://tu-servidor` a la URL del juego.
