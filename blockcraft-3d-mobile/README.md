# BlockCraft 3D - Combate

Incluye inventario, minería animada, chunks, espada, arco y cuatro mobs.

## Mobs

- Zombie: persigue y ataca de cerca.
- Esqueleto: intenta mantener distancia y dispara flechas.
- Araña: es rápida y ataca cuerpo a cuerpo.
- Creeper: se acerca y explota cuando permanece cerca.

## Armas

- `6`: espada. Clic izquierdo para atacar.
- `7`: arco. Clic izquierdo para disparar.
- Las flechas se consumen del inventario.

## Controles

WASD para moverse, ESPACIO para saltar, 1-5 para bloques, 6 para espada,
7 para arco, E para inventario, R para reiniciar y ESC para liberar el mouse.

Abre `index.html`. Necesita internet para cargar Three.js.


## Física de combate añadida

- Las explosiones de creepers destruyen bloques cercanos, excepto bedrock.
- Las explosiones generan partículas visibles.
- Las explosiones empujan al jugador y también a otros mobs.
- Los golpes cuerpo a cuerpo empujan al jugador.
- La espada y las flechas empujan a los mobs.
- El knockback se va frenando poco a poco para dar sensación de inercia.


## Mejoras de esta versión

- Los zombies, arañas y otros mobs ya no pueden golpear a través de paredes.
- Los esqueletos solo disparan si tienen línea de visión.
- Las flechas chocan con bloques antes de poder causar daño.
- La explosión del creeper no daña a través de una pared sólida.
- Los mobs tienen colisión básica con bloques y ya no atraviesan paredes fácilmente.
- Distancia de chunks aumentada de 7x7 a 9x9 chunks visibles.
- El mundo sigue generándose proceduralmente al avanzar, por lo que el mapa práctico es mucho más grande.
- Texturas pixeladas generadas localmente para pasto, tierra, piedra, madera, hojas y bedrock.
- Nuevo cielo degradado, iluminación más cálida y nubes 3D simples.
- Mayor distancia de cámara y niebla más lejana.


## Rostros y drops de bloques

- Zombies ahora tienen ojos y boca.
- Esqueletos tienen ojos, nariz y boca.
- Arañas tienen varios ojos rojos.
- Creepers tienen una cara frontal más reconocible.
- Al romper un bloque, aparece una miniatura 3D del bloque.
- La miniatura salta, cae, gira y rebota ligeramente.
- Cuando el jugador se acerca, el bloque se recoge y se añade al inventario.
- Algunas explosiones también pueden dejar miniaturas de bloques destruidos.


## Crafteo

Se añadió una cuadrícula de crafteo 3×3 dentro del inventario.

Uso:
- Pulsa `E`.
- Haz clic en un material del inventario para seleccionarlo.
- Haz clic en una casilla concreta de la cuadrícula para colocarlo exactamente ahí.
- Haz clic o clic derecho en una casilla ocupada para devolver el material.
- Cuando la forma coincide con una receta, aparece el resultado.

Recetas incluidas:
- 1 tronco → 4 tablones.
- 2 tablones en vertical → 4 palos.
- 4 tablones en cuadrado 2×2 → 1 mesa de crafteo.
- 2 tablones + 1 palo en vertical → espada de madera.
- 2 piedras + 1 palo en vertical → espada de piedra.

También se corrigió la orientación de los rostros de los mobs: antes los detalles podían quedar en la parte trasera porque `lookAt()` orienta el eje frontal del grupo hacia el jugador.


## Herramientas y mano en primera persona

- El objeto seleccionado ahora aparece visible en la mano del jugador.
- Los bloques aparecen como cubos pequeños en la mano.
- La espada, arco, pico, pala y hacha tienen modelos 3D simples.
- La mano se mueve al caminar y hace una animación al usar herramientas.
- `8` selecciona el pico.
- `9` selecciona la pala.
- `0` selecciona el hacha.
- La piedra solo puede romperse si tienes seleccionado el pico.
- La pala rompe tierra y pasto más rápido.
- El hacha rompe madera más rápido.
- El pico rompe piedra más rápido.


## Espada mejorada, mochila y control del mouse

- La espada ahora tiene una hoja más detallada, filos claros, canal central, punta, guarda, empuñadura con envoltura y pomo.
- `B` abre/cierra una mochila de 12 espacios.
- Cada espacio puede guardar hasta 64 unidades del mismo objeto.
- Desde la mochila puedes pasar objetos del inventario a almacenamiento y recuperarlos con un clic.
- `TAB` alterna el mouse: si la cámara tiene el mouse capturado, lo libera; si está libre y no hay un menú abierto, vuelve a capturarlo.
- Al abrir el inventario o la mochila, el mouse se libera automáticamente para poder usar los botones.


## Barra rápida dinámica

- Un bloque desaparece de la barra principal cuando su cantidad llega a `0`.
- Si guardas todas sus unidades en la mochila, también desaparece de la barra.
- Cuando recuperas unidades desde la mochila, el objeto vuelve a aparecer automáticamente.
- Si el objeto que estabas sosteniendo se queda en `0`, se selecciona automáticamente otro objeto disponible.
- Espada, arco, pico, pala y hacha permanecen visibles como equipo.


## Optimización de rendimiento

Esta versión conserva mochila, crafting, herramientas, objetos en mano, mobs, knockback,
explosiones, drops y TAB, pero cambia la forma en la que el juego reparte el trabajo.

### Implementado

- Chunks de 16×16.
- Render distance inicial de 4 chunks.
- Simulation distance inicial de 3 chunks.
- Generación progresiva: máximo 1 chunk nuevo por frame.
- Cola de reconstrucción: máximo 1 chunk sucio por frame.
- Romper bloques ya no obliga a reconstruir varios chunks inmediatamente en el mismo frame.
- Los mobs fuera de la distancia de simulación dejan de ejecutar IA.
- Partículas de explosión renderizadas mediante un único `THREE.InstancedMesh`.
- Límite de partículas y de objetos tirados.
- Geometría compartida para los bloques miniatura tirados.
- Sombras desactivadas.
- Pixel ratio conservador.
- FPS máximo configurable: 30 o 60.
- La simulación se pausa al cambiar de pestaña.
- F3 muestra FPS, chunks, colas, mobs, items, draw calls y triángulos.
- F4 activa/desactiva el modo para PC de bajos recursos.
- Detección de FPS bajos durante varios segundos y sugerencia opcional de activar modo bajo.
- Presets Baja, Media y Alta.
- El modo de bajos recursos utiliza render distance 3, simulation distance 2,
  menos partículas, menos items, menos mobs y menor resolución de render.

El terreno sigue usando pocas `InstancedMesh` por chunk y solamente incluye bloques expuestos,
por lo que no existe un `THREE.Mesh` independiente para cada bloque.


## Barra principal reordenable

- Con el mouse libre (`TAB`), puedes arrastrar cualquier objeto visible de la barra principal.
- Suelta el objeto antes o después de otra casilla para cambiar su posición.
- Las teclas `1` a `0` siguen el orden visible actual de la barra, no el tipo de objeto.
- Cuando un objeto llega a 0 y desaparece, la numeración de los objetos visibles se reajusta.
- Si el objeto vuelve desde la mochila, recupera su posición guardada dentro del orden de la barra.
- El orden se guarda en `localStorage` porque es una preferencia pequeña, no datos pesados del mundo.


## Compatibilidad PC + celular

El juego detecta automáticamente dispositivos táctiles y conserva los controles clásicos en PC.

**PC:** WASD, mouse, Espacio, clic izquierdo/derecho, TAB, E, B y teclas 1-0.

**Celular:** joystick izquierdo para caminar, deslizar en el lado derecho para mirar,
botón ↑ para saltar, ⚔ para atacar/minar, ▣ para colocar, E para inventario y 🎒 para mochila.
La barra rápida puede tocarse para seleccionar y, con pulsación larga, arrastrarse para reordenar.

En móviles se evita Pointer Lock y se mantienen los límites/optimizaciones del proyecto.
