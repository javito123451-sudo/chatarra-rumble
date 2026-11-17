# Chatarra Rumble — robots Mk-II

## Alcance de esta iteración

Esta iteración conserva los cuatro personajes existentes y añade detalles visuales a la geometría articulada que ya genera `robotGeo()`.

- **Brasa**: soldador pesado, careta, bombonas y soplete.
- **Garfio**: gruista, casco de obra y pluma con gancho.
- **Chispa**: mensajera ligera, bandolera y propulsores.
- **Bafle**: DJ, ecualizador y altavoz dorsal.

## Cambios

- Microplacas y remaches en hombros, antebrazos y rodillas.
- Placa frontal de identificación con tres testigos emisivos.
- Pulso animado de los paneles emisivos; aumenta brevemente cuando el robot recibe daño.
- El pulso reutiliza materiales existentes y no crea luces dinámicas por personaje.
- Los detalles se generan dentro de `robotGeo()` y se vinculan al esqueleto existente.
- No se cambia el protocolo multijugador, las estadísticas, las habilidades, las armas ni las colisiones.
- No se reemplaza `assets/soldier.glb`; se mantiene el modelo base y el sistema de animación existente.

## Compatibilidad y límites

El juego continúa usando Three.js r128, GLTFLoader y SkeletonUtils. El modelo detallado se carga en el modo gráfico realista cuando la calidad no está en baja; el modelo procedural sigue siendo el fallback.

Esta entrega es una mejora de geometría en tiempo de ejecución. No incluye nuevos archivos GLB independientes ni mapas PBR externos. Para exportar personajes GLB separados habría que crear y validar esos modelos como assets aparte.

## Validación automatizada añadida

- GitHub Actions ejecuta `scripts/check-inline-js.py` en cada pull request hacia `main` y en cada push a `main`.
- El script extrae los bloques JavaScript inline de `index.html` y los comprueba con `node --check`.
- Esta comprobación detecta errores de sintaxis; no sustituye las pruebas de navegador, renderizado, rendimiento ni multijugador.

## Validación pendiente

- Abrir el juego en navegador de escritorio y móvil.
- Probar los cuatro personajes en el lobby y durante una partida.
- Comprobar animaciones Idle, Walk y Run, armas y cámara.
- Revisar rendimiento con calidad alta, media y baja.
- Verificar una partida multijugador en sala antes de fusionar.
