Feature: Portada con efecto de pincel
  Como visitante quiero una portada memorable que presente el negocio y me
  lleve directo a reservar o ver servicios, para decidir mi siguiente paso
  en segundos.

  # Mecanismo de disparo: IntersectionObserver con threshold 0.35 sobre el
  # contenedor del titular (HANDOFF §3 #3). Duración y delay son valores de
  # diseño específicos de este efecto (4.8s / 0.5s) — NO armonizar con los
  # 1.1–1.4s de WebEmpresa sin que alguien lo decida explícitamente.

  @s1
  Scenario: El titular completa su animación de revelado
    Given la home recién cargada
    When espera a que termine la animación del titular del hero
    Then el texto "Nails Lash" es completamente visible en 4.8 segundos desde que empieza

  @s2
  Scenario: El pincel se repite al volver a entrar en el viewport
    Given el hero ya visible y su animación terminada
    When hago scroll fuera del hero y vuelvo a hacer scroll hasta que el hero ocupa al menos el 35% del viewport
    Then la animación del titular se relanza desde el principio

  @s3
  Scenario: El botón "Repetir" relanza la animación bajo demanda
    Given el hero visible con su animación terminada
    When pulso el botón "↺ Repetir"
    Then la animación del titular se relanza inmediatamente, sin esperar a salir y volver a entrar en el viewport

  @s4
  Scenario: "Ver servicios" lleva a la primera categoría
    Given la home renderizada
    When pulso el enlace "Ver servicios" del hero
    Then el scroll se desplaza a la sección "#unas"

  @s5
  Scenario: "Reservar cita" lleva al equipo
    Given la home renderizada
    When pulso el enlace "Reservar cita" del hero
    Then el scroll se desplaza a la sección "#equipo"

  # Gap cubierto aquí y NO presente en el prototipo (HANDOFF §4.1) — se añade
  # porque sin él el sitio no cumple "0 problemas": 5 animaciones en la
  # portada sin control de movimiento reducido es un problema real, no
  # cosmético.
  @s6
  Scenario: Con preferencia de movimiento reducido, el pincel no anima
    Given el sistema operativo tiene activada la preferencia "prefers-reduced-motion: reduce"
    When cargo la home
    Then el titular del hero es visible de inmediato, sin animación de revelado ni barrido de pincel
