# Citas · Fase 2: autenticación con Google Calendar (A-32)

> Prueba hecha el 2026-10-30 con la cuenta de Cenit **p.hurtado@cenitdigital.es**, que es de Google Workspace (organización `cenitdigital.es`). Proyecto de Google Cloud: `nails-citas-pruebas`. Issue #28.
> El código de la prueba fue desechable y no está en el repo. Aquí solo quedan los resultados reales.

## Decisión

**El backend usa OAuth 2.0 con el refresh token de la cuenta dueña del calendario.** Lo descartado:

- **Cuenta de servicio:** se deja como vía (a) sin probar a fondo, por los motivos de abajo.
- **Apps Script:** no hizo falta; era la vía (c), la alternativa si las otras dos fallaban.

## Qué se montó

| Pieza                      | Valor                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| Proyecto de Cloud          | `nails-citas-pruebas`, en la organización `cenitdigital.es`                                        |
| API                        | Google Calendar API activada                                                                       |
| Pantalla de consentimiento | «Citas Nails Lash Studio (pruebas)», público **Interno**                                           |
| Cliente OAuth              | `citas-api-pruebas`, tipo «App de escritorio», con PKCE y redirección de bucle local (`127.0.0.1`) |
| Secretos                   | `~/.cenit-secrets/nails-citas/` en el VPS (permisos 600). **Nunca en el repo, que es público**     |
| Calendario de pruebas      | «Citas pruebas — Trabajadora 1», zona `Europe/Madrid`                                              |

## Resultados (respuestas HTTP reales)

| Prueba                                                                  | Resultado                                                |
| ----------------------------------------------------------------------- | -------------------------------------------------------- |
| Refresh token → access token                                            | 200, `expires_in` 3599, scope `calendar`                 |
| `calendars.insert`                                                      | 200, `timeZone: Europe/Madrid`                           |
| `freeBusy.query`, día vacío                                             | 200, `busy: []`                                          |
| `events.insert` con `extendedProperties.private` y recordatorio `popup` | 200; devuelve las propiedades privadas                   |
| `freeBusy.query` tras la reserva                                        | 200, `busy` = `10:00–11:00 +01:00`                       |
| **Dos `events.insert` simultáneos al mismo hueco, sin id**              | **200 y 200: Calendar acepta el solape**                 |
| Dos `events.insert` simultáneos con el **mismo `id`**                   | 200 y **409** «The requested identifier already exists.» |
| `events.list?privateExtendedProperty=origen=web-citas`                  | 200, devuelve solo los eventos de la web                 |

## Consecuencias para el diseño

1. **El bloqueo propio es obligatorio.** Calendar no impide el solape. Se mantiene T-8:
   - `pg_advisory_xact_lock` por trabajadora y día;
   - después, una nueva consulta de `freeBusy`;
   - después, `events.insert`.
2. **El `id` determinista es una red extra, no la defensa.** Solo detecta el choque si las dos reservas empiezan a la misma hora en el mismo calendario. No detecta el solape de 10:00–11:00 con 10:30–11:30. Además, la referencia de `events.insert` avisa de que las colisiones pueden no detectarse.
3. **Las citas de la web se distinguen por `extendedProperties.private`.** Las del salón (teléfono, Treatwell apuntado a mano) bloquean igualmente, porque `freeBusy` las cuenta todas.
4. **El scope del backend definitivo se reduce:**
   - `calendar.events`, que admite `events.insert`;
   - `calendar.events.freebusy` o `calendar.freebusy`, que admiten `freeBusy.query`.
   - El scope `calendar` completo solo hizo falta para crear el calendario de pruebas.

## Por qué no se siguió con la cuenta de servicio

- **La pregunta que tenía que resolver no se puede responder aquí.** La duda era si una cuenta de servicio puede escribir en el calendario de un **Gmail personal**, y esta cuenta es de Workspace.
- **Crear su clave descarga un fichero JSON en el PC de quien pulsa.** Se creó la cuenta `citas-api-pruebas@nails-citas-pruebas.iam.gserviceaccount.com`, **sin claves**, y se canceló en el diálogo «Crear clave privada». **[NV]** si la política de la organización habría bloqueado la clave al confirmar.
- **La referencia de `events.insert` añade una limitación:** una cuenta de servicio necesita delegación de todo el dominio para añadir asistentes.

## Cuando se conecte la cuenta del salón

- **Si es Gmail personal:** la pantalla de consentimiento no puede ser «Interna». Se crea como **Externa** y se publica **en producción**, sin verificar. Así queda dentro de la exención por **uso personal** («solo usuarios conocidos personalmente») y el refresh token no caduca a los 7 días, como sí pasa en el estado _Testing_. Lo único que verá el salón es la pantalla de «app no verificada» una sola vez, al autorizar.
- **Si es Workspace:** igual que en esta prueba (Interna).
- **En los dos casos:** el refresh token deja de valer si se revoca el acceso, si no se usa en 6 meses o si se superan 100 tokens por cliente. El backend debe avisar si el canje falla.

**[NV] Sin probar:** la sesión del salón con una cuenta Gmail real, y las políticas de duración de sesión que un administrador de Workspace pudiera activar.

## Fuentes oficiales

- `events.insert`: https://developers.google.com/workspace/calendar/api/v3/reference/events/insert
- `freeBusy.query`: https://developers.google.com/workspace/calendar/api/v3/reference/freebusy/query
- Caducidad de refresh tokens: https://developers.google.com/identity/protocols/oauth2#expiration
- Exenciones de verificación (uso personal, uso interno): https://developers.google.com/identity/protocols/oauth2/production-readiness/sensitive-scope-verification
- OAuth para apps de escritorio (bucle local y PKCE): https://developers.google.com/identity/protocols/oauth2/native-app
