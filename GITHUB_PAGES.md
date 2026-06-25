# Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube estos archivos a la raíz del repositorio:
   - `index.html`
   - carpeta `src`
   - `.nojekyll`
   - `README.md`
   - `imsmanifest.xml`
3. Ve a Settings > Pages.
4. En Source selecciona Deploy from branch.
5. Rama: `main`.
6. Carpeta: `/root`.
7. Guarda y espera el enlace público.

El juego no requiere instalación ni servidor backend. Funciona como sitio estático.


## Nota V35

El proyecto es plano para GitHub Pages. No contiene carpetas internas. Los bloqueos preventivos se activan solamente por Escape, clic derecho o PrintScreen durante la partida.


## Nota V36

Versión plana para GitHub Pages. Corrige el desbloqueo docente, fuerza pantalla completa con clic normal durante la partida y activa bloqueos por Escape, clic derecho, PrintScreen o cambio de foco.


## Nota V37

La validación docente fue reforzada para aceptar hora militar con tolerancia y distintos formatos de escritura. El proyecto sigue plano para GitHub Pages.


## V38 - Desbloqueo continúa el juego

- Al oprimir `Desbloquear y continuar` con la contraseña correcta, el panel se oculta y el juego vuelve inmediatamente al modo de juego.
- Se añadió una tolerancia corta después del desbloqueo para evitar que eventos del navegador vuelvan a bloquear justo después de hacer clic.
- El juego intenta volver a pantalla completa después del desbloqueo.

## V39 - Botón de desbloqueo docente corregido

- Se conectó el botón `Desbloquear y continuar` con la función real de validación.
- También se puede desbloquear presionando Enter dentro del campo de contraseña.
- Después de validar la hora militar correcta, el panel se oculta, el bloqueo se limpia y el juego vuelve al modo de juego.
