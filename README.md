# Aventura Diferencial 2D · Primer Corte V16

Juego educativo 2D tipo aventura cenital para evaluar el primer corte de Ecuaciones Diferenciales.

## Novedades base

- Sistema de nota fijo:
  - Correcta: +0.1
  - Incorrecta: -0.1
  - Nota limitada entre 0.0 y 5.0
- Preguntas mixtas:
  - Opción múltiple con 6 respuestas parecidas.
  - Verdadero/Falso con lista desplegable.
  - Afirmaciones I, II, III y IV con desplegable V/F.
  - Preguntas de valor entero.
- Cada pregunta incluye pista y retroalimentación.
- Mazmorras por elemento:
  - Bosque del PVI: piedras empujables.
  - Mar de Variables Separables: agua, puentes y corrientes.
  - Cueva Exacta: muchas rocas y laberinto.
  - Volcán Lineal: lava y piso agrietado que se rompe.
  - Polo de Aplicaciones: hielo resbaladizo.
  - Templo del Primer Parcial: mezcla de acertijos.
- Brújula de objetivo.
- Controles PC y móvil/tablet.
- Reporte final imprimible/guardable como PDF.
- Archivos base para GitHub Pages y SCORM/Brightspace.

## Cómo subir a GitHub Pages

1. Descomprime el ZIP.
2. Sube el contenido de la carpeta a la raíz de un repositorio.
3. En GitHub: Settings > Pages > Deploy from branch.
4. Selecciona `main` y `/root`.

## Controles

- Movimiento: flechas o WASD.
- Interactuar: E o Espacio.
- Mapa: M.
- Reporte: R.
- Móvil/tablet: usa los botones en pantalla.


## Actualización V6
- El Mar de Variables Separables ahora tiene estructura de archipiélago.
- Se agregó un barco interactivo para llegar al guardián morado en una isla pequeña y regresar.
- Las posiciones de retos/cofres son distintas en cada región para que no se sienta el mismo mapa repetido.
- Cada región usa una estructura propia: bosque ramificado, mar con islas/barco, cueva laberíntica, volcán con lava y piso quebradizo, polo con hielo deslizante, y templo final mixto.

## Actualización V6

- Se corrigió la región del Mar de Variables Separables: ahora el guardián morado está en una isla accesible mediante barco.
- Se añadieron barcos interactivos: uno lleva a la isla del guardián y otro permite regresar al muelle.
- La brújula ahora puede dirigir al estudiante hacia el barco cuando el siguiente reto está en una isla.
- Se reajustaron las posiciones de retos por tema para que cada región tenga una estructura diferente.
- Se diferenciaron mejor las regiones:
  - Bosque: caminos y piedras empujables.
  - Mar: islas, muelles, barco y corrientes.
  - Cueva: laberinto oscuro con rocas.
  - Volcán: lava, ceniza y pisos agrietados.
  - Polo: hielo resbaladizo y obstáculos.
  - Templo final: mezcla de mecánicas.

## Actualización V7

- En preguntas de opción múltiple ya no es necesario presionar el botón **Responder**:
  - al hacer clic sobre una opción, esta brilla;
  - luego se envía automáticamente la respuesta.
- En preguntas de desplegable, afirmaciones I-IV y valor entero se mantiene el botón **Responder**.
- En el Mar de Variables Separables el barco ahora es manejable:
  - presiona **E** para subir;
  - mueve el barco con flechas/WASD;
  - acércate a una isla, muelle u orilla;
  - presiona **E** para desembarcar.
- El barco ya no es solo teletransporte: el estudiante debe navegar por sí mismo entre islas.


## Actualización V8

- Las trampas ya no dejan bloqueado al avatar.
- Al caer en un hueco/trampa aparece una **pregunta de liberación**.
- Si el estudiante responde correctamente:
  - sale de la trampa;
  - vuelve a una casilla segura.
- Si responde mal:
  - pierde 0.1;
  - el hueco se hace más grande;
  - debe seguir respondiendo hasta acertar.
- Las trampas usan el mismo banco mixto de preguntas del tema de la cueva actual.


## Actualización V9

- Cuando el avatar cae en una trampa aparece una **escalera visible** dentro del hueco.
- La escalera representa la salida, pero solo se activa si el estudiante responde correctamente la pregunta de liberación.
- Si responde mal:
  - el hueco se expande;
  - la escalera permanece en el centro;
  - debe seguir respondiendo hasta acertar.
- Al responder bien, el avatar sube por la escalera y vuelve a una casilla segura.


## Actualización V10

- Cada mundo ahora tiene **muchas más trampas** distribuidas en la ruta.
- El jugador debe evitarlas con habilidad; si cae en una, queda hundido hasta responder bien.
- Si responde mal, la trampa se expande y lo hunde más; sigue atrapado hasta acertar.
- La escalera/camino de salida aparece dentro de la trampa y solo sirve cuando responde correctamente.
- En el **Mar de Variables Separables**, el barco ahora solo navega sobre **mar/corrientes** y ya no se mueve sobre tierra.
- Las islas del mar incluyen trampas propias, además del desplazamiento en barco.

## Actualización V11

- Se cerraron mejor los mapas para evitar que el jugador bordee fácilmente el camino principal.
- El Bosque del PVI ahora funciona como corredor/laberinto de bosque sólido, no como campo abierto.
- Se aumentó mucho la densidad de trampas en todos los mundos.
- Las piedras ahora tienen función de acertijo:
  - si se empujan sobre una trampa o hueco, lo tapan;
  - la casilla se vuelve camino seguro;
  - la piedra desaparece como si hubiera caído dentro del hueco.
- Varias rutas ya no se resuelven solo esquivando: requieren empujar piedras para crear paso.
- El barco del mar sigue limitado solo a mar/corrientes, no tierra.


## Actualización V12

- Al responder correctamente una pregunta de trampa, ahora aparece una **escalera/camino atravesable** sobre el hueco.
- El avatar queda sobre esa escalera y puede moverse hacia el otro lado.
- Si la trampa se expandió por respuestas incorrectas, la escalera crea una conexión parcial a través del hueco para no quedar bloqueado.
- La escalera ya no es solo visual: es una casilla caminable dentro del mapa.


## Actualización V13

- Se eliminó el sistema de corazones y vidas.
- El estudiante puede equivocarse todas las veces que necesite.
- La respuesta incorrecta sigue restando 0.1, pero no termina la partida.
- Al responder correctamente una trampa aparecen **varias escaleras/caminos** en el hueco para cruzar hacia el otro lado.
- Se agregaron preguntas más complejas e integradoras por tema.
- Los guardianes ahora tienen formas de bestias mitológicas:
  - Bosque/PVI: grifo.
  - Mar/separables: kraken.
  - Cueva/exactas: medusa.
  - Volcán/lineales: dragón.
  - Polo/aplicaciones: yeti.
  - Templo final: quimera.
- Se conserva la mecánica de empujar piedras para tapar huecos y crear caminos.

## Actualización V16

- Se aumentó la dificultad ambiental para que no se pueda pasar por los corredores fácilmente.
- Cada cofre, bestia mitológica y jefe queda rodeado por anillos de trampas matemáticas.
- Se agregaron barreras de trampas en los corredores principales de cada mundo.
- Se agregaron más piedras cerca de las barreras para que el estudiante pueda resolver el paso empujándolas de forma inteligente.
- El jugador ahora debe elegir entre dos estrategias:
  - responder preguntas al caer en una trampa;
  - o empujar piedras para tapar trampas y construir camino seguro.
- Se reforzó especialmente el Bosque del PVI con más líneas de trampas y piedras junto a los accesos a los retos.


## V29 - Preguntas de comprobación de soluciones

- Se agregan preguntas en LaTeX/MathJax donde el estudiante debe decidir cuál función candidata satisface una ecuación diferencial.
- Este tipo de pregunta aparece en todos los mundos: PVI, separables, exactas, lineales/Bernoulli y aplicaciones.
- Las opciones se aleatorizan para que la respuesta correcta no quede fija en la opción A.
- La retroalimentación explica la verificación por derivación, sustitución en la ecuación y condición inicial cuando corresponde.

## V30 - Bloqueos con contraseña docente y límite de puntaje por mundo

- Cuando se activa un bloqueo por salir de pantalla completa, cambiar de pestaña o usar acciones restringidas, para continuar se debe escribir la contraseña docente basada en hora militar.
- El juego cuenta señales de bloqueo. El máximo permitido es 5; al superar ese límite, el quiz se anula con nota 0.
- Cada mundo permite sumar como máximo 1.0 unidad de nota por respuestas correctas. Después de alcanzar ese tope en el mundo, las respuestas correctas no suman más hasta pasar al siguiente mundo.


## V33 - Informe MathJax corregido y proyecto plano para GitHub

- El informe HTML descargado ahora genera delimitadores LaTeX correctos para MathJax.
- El formulario teórico usa expresiones como \(y^{\prime}=f(x,y)\), \(M_y=N_x\), \(\mu(x)=e^{\int p(x)\,dx}\) sin errores de barras invertidas.
- El detalle de preguntas conserva LaTeX visible y legible.
- El proyecto para GitHub quedó plano: los archivos principales están en la raíz, sin carpeta `src`.


## V34 - Corrección real de MathJax en el informe

- Se corrigió la configuración exportada de MathJax en el informe HTML.
- El informe ahora reconoce correctamente `\( ... \)`, `$ ... $`, `\[ ... \]` y `$$ ... $$`.
- El formulario teórico ya no debe mostrar código literal como `\(y^{\prime}...\)`.
- El proyecto sigue plano para GitHub: todos los archivos están en la raíz, sin carpeta `src`.


## V35 - Bloqueos preventivos exactos

- Los bloqueos preventivos se activan únicamente durante la partida por:
  1. presionar `Escape`,
  2. hacer clic derecho,
  3. presionar `PrintScreen` / pantallazo.
- Al activarse un bloqueo aparece un panel con contraseña docente. El campo muestra `****`.
- La contraseña corresponde a la hora militar actual, pero esta regla no se muestra en la interfaz.
- Cada bloqueo cuenta como una señal preventiva. Se permiten máximo 5 señales; si se supera ese límite, el quiz se anula con nota 0.
- No hay bloqueo automático al iniciar el juego ni por estar fuera de pantalla completa.


## V36 - Pantalla completa y desbloqueo corregidos

- Al hacer clic normal durante la partida, el juego intenta volver a pantalla completa.
- Escape, clic derecho, PrintScreen y cambio de foco activan un bloqueo preventivo.
- Para desbloquear, el docente escribe la contraseña oculta en el campo `****`.
- La contraseña corresponde a la hora militar actual, con tolerancia de algunos minutos, pero esta regla no se muestra en la interfaz.
- Se permiten 5 señales preventivas. La sexta señal anula el quiz con nota 0.


## V37 - Contraseña docente robusta

- Se corrigió la validación de contraseña docente para aceptar formatos `HHMM`, `HH:MM`, `HMM` y equivalentes de 12/24 horas.
- Se agregó tolerancia de minutos y respaldo de zona horaria para evitar que el docente quede bloqueado por diferencias del reloj del navegador.
- El campo de contraseña sigue mostrando `****` y la regla no se muestra en la interfaz.
- Al desbloquear, el juego vuelve a intentar entrar en pantalla completa.


## V38 - Desbloqueo continúa el juego

- Al oprimir `Desbloquear y continuar` con la contraseña correcta, el panel se oculta y el juego vuelve inmediatamente al modo de juego.
- Se añadió una tolerancia corta después del desbloqueo para evitar que eventos del navegador vuelvan a bloquear justo después de hacer clic.
- El juego intenta volver a pantalla completa después del desbloqueo.

## V39 - Botón de desbloqueo docente corregido

- Se conectó el botón `Desbloquear y continuar` con la función real de validación.
- También se puede desbloquear presionando Enter dentro del campo de contraseña.
- Después de validar la hora militar correcta, el panel se oculta, el bloqueo se limpia y el juego vuelve al modo de juego.

## V40 - Anulación automática en la quinta señal

- Al llegar a 5 señales de bloqueo, el intento se finaliza automáticamente.
- La nota final queda fijada en `0.0` y el estado del informe muestra un aviso rojo de `QUIZ ANULADO`.
- El informe HTML se descarga automáticamente al momento de la anulación.
- El informe conserva el historial de respuestas, aciertos, errores, sellos, objetos, mundo alcanzado, posición final del avatar, tema activo y puntaje desarrollado antes de la anulación.
