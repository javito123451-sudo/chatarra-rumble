# Chatarra Rumble

Battle royale web 3D (Three.js) con modo multijugador por salas.

- `index.html`: el juego completo. Vercel lo sirve tal cual (sin compilación).
- `server/`: servidor Node de salas (WebSocket). Render lo arranca con `node server/server.js`.

El juego se conecta por defecto a `wss://chatarra-rumble-server.onrender.com`.
Para probar con otro servidor: añade `?server=wss://tu-servidor` a la URL del juego.

## Recursos de terceros
- `lib/GLTFLoader.js` y `lib/SkeletonUtils.js`: ejemplos de Three.js r128 (licencia MIT).
- `assets/soldier.glb`: modelo «Soldier» de los ejemplos de Three.js (personaje y animaciones de Mixamo).
- `lib/post.js`: posprocesado de los ejemplos de Three.js r128 (EffectComposer, RenderPass, ShaderPass, UnrealBloomPass y sus shaders; licencia MIT).
