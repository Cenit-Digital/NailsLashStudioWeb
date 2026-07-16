# Mutación — F-02 `datos_negocio_fuente_unica`

> El `tdd_craftsman` dejó `src/lib/site.ts` al 100 % de mutación en una corrida
> tranquila y documentó aquí la ÚNICA exclusión (mutante equivalente). El
> `mutation_tester` mide de forma independiente y confirma o refuta.

## Comando (baja concurrencia, lección de F-01)

```
pnpm exec stryker run --mutate src/lib/site.ts --concurrency 2
```

A alta concurrencia los timeouts enmascaran supervivientes reales (F-01 escondió
3). El número que vale es "0 survived" en corrida tranquila. Node huérfanos
matados tras cada corrida (`Get-Process node | … | Stop-Process -Force`).

## Resultado

- **1ª corrida:** 96.49 % — 55 killed, **2 survived**, 0 timeouts.
- **2ª corrida (tras cerrar el hueco real):** **100.00 % — 56 killed, 0 survived,
  0 timeouts, 1 excluido.** `break:100` superado.

## Superviviente real cerrado con un test (no excluido)

`src/lib/site.ts` — `throw new Error('…')` → `throw new Error('')`.

`@s11` usaba `expect(...).toThrow()` sin argumento, que ignora el mensaje: un
error MUDO pasaba. Pero el contrato exige, en su sección de modos de error,
"falla RUIDOSA («falla cerrada» del proyecto)"; un mensaje vacío no es ruidoso.

**Cerrado con test, no excluido:** el mensaje se simplificó a un literal único y
`@s11`/`@s12` anclan ahora un fragmento escrito A MANO
(`expect(...).toThrow('teléfono')`). No se importa la constante de producción
(anti-tautología, patrón
`testing/doble-de-test-anclado-al-literal-no-al-simbolo.md`). Precedente directo:
F-01 `@s22` ancló la causa concreta del reventón por la misma razón
(`progress/mutation_puerta_placeholders.md`).

## Mutante equivalente excluido (política docs/mutation-testing.md §78-80)

`src/lib/site.ts:HOST_WHATSAPP` — `const HOST_WHATSAPP = 'https://wa.me/'` → `''`.

**Por qué es equivalente respecto al contrato.** El `.feature` cierra A-10 en su
cabecera: el host (`wa.me` vs `api.whatsapp.com/send`) **NO está verificado contra
fuente primaria** y se trata como constante configurable, a comprobar a mano en
Android/iOS/WhatsApp Web antes de F-13. Los escenarios `@s5`, `@s6` y `@s7`
aseveran SOLO dos propiedades del enlace: el número en E.164 **sin `+`** y el
texto `encodeURIComponent`-ado; **el host no se asevera** (el `.feature` lo dice
literalmente: "el host NO se ata"). Los helpers de test extraen el número como el
último segmento de la ruta (`slice(lastIndexOf('/')+1)`) y el texto tras `?text=`,
de modo que son indiferentes al host. Mutar la cadena del host a `''` (o a
cualquier otro host) NO altera ninguna aserción del contrato:
`numeroDelEnlace('34625223366?text=…')` sigue devolviendo `'34625223366'`.

**Por qué NO se mata con un test.** Matarlo exigiría aseverar el host (p. ej.
`toContain('wa.me')`), que es EXACTAMENTE lo que el contrato prohíbe hasta que
A-10/A-3 se verifiquen a mano. Inventar esa aserción ataría el código a un host no
verificado y ensuciaría el contrato — está fuera del alcance de F-02.

**Exclusión quirúrgica.** La expresión está aislada en su propia línea con
`// Stryker disable next-line all` y el porqué escrito en el propio `site.ts`.
Cuando F-13 verifique el host contra fuente primaria, se añade la aserción y se
retira la exclusión.

Es la misma disciplina que F-01 aplicó a `toLowerCase↔toUpperCase` en
`placeholders.ts`: equivalente genuino, verificado a mano, excluido con
justificación, no una vía para esquivar un hueco real.

---

# Veredicto del `mutation_tester` (medición independiente)

**Veredicto:** PASS
**Score site.ts:** killed/total = 56/56 = **100.00%** (umbral: 100%)

Medido de forma independiente por el `mutation_tester`, a baja concurrencia
(`--concurrency 2`, lección de F-01), dejando terminar la corrida.

## Corrida sobre el objetivo NUEVO de F-02 — `src/lib/site.ts`

```
pnpm exec stryker run --mutate src/lib/site.ts --concurrency 2
```

- Instrumentados: 57 mutantes; 1 excluido (`Stryker disable next-line all`) → 56 probados.
- Corrida TRANQUILA: 0 timeouts (ningún timeout que pudiera enmascarar supervivientes).

```
----------|------------------|----------|-----------|------------|----------|----------|
          | % Mutation score |          |           |            |          |          |
File      |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
----------|--------|---------|----------|-----------|------------|----------|----------|
All files | 100.00 |  100.00 |       56 |         0 |          0 |        0 |        0 |
 site.ts  | 100.00 |  100.00 |       56 |         0 |          0 |        0 |        0 |
----------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

**0 supervivientes en site.ts.** Confirmo el resultado del `tdd_craftsman`.

## Regresión F-01 — `placeholders.ts` + `puerta.ts` (deben seguir a 100%)

```
pnpm exec stryker run --mutate 'src/lib/placeholders.ts,src/lib/puerta.ts' --concurrency 2
```

```
-----------------|------------------|----------|-----------|------------|----------|----------|
                 | % Mutation score |          |           |            |          |          |
File             |  total | covered | # killed | # timeout | # survived | # no cov | # errors |
-----------------|--------|---------|----------|-----------|------------|----------|----------|
All files        | 100.00 |  100.00 |      137 |         9 |          0 |        0 |        0 |
 placeholders.ts | 100.00 |  100.00 |       87 |         9 |          0 |        0 |        0 |
 puerta.ts       | 100.00 |  100.00 |       50 |         0 |          0 |        0 |        0 |
-----------------|--------|---------|----------|-----------|------------|----------|----------|
Final mutation score of 100.00 is greater than or equal to break threshold 100
```

Los 9 `timeout` de `placeholders.ts` cuentan como KILLED (mutantes que provocan
bucle infinito, matados por timeout); **0 survived** a baja concurrencia, así que
no hay enmascaramiento. **Sin regresión: F-01 sigue a 100%.**

## Verificación de la ÚNICA exclusión (mutante equivalente `HOST_WHATSAPP`)

Verificado A MANO por el `mutation_tester`: `HOST_WHATSAPP = 'https://wa.me/'` → `''`.
Con host `''`, `waHref('625 22 33 66','Hola, quiero cita')` produce
`'34625223366?text=Hola%2C%20quiero%20cita'`; los helpers del test extraen el
número (`slice(lastIndexOf('/')+1)` → `'34625223366'`) y el texto (tras `?text=`)
igual que con el host real, y `url.not.toContain('+34625223366')` se mantiene.
Ninguna aserción de `@s5/@s6/@s7` cambia. Matarlo exigiría aseverar el host, que
el contrato (A-10) prohíbe hasta F-13. **Equivalente respecto al contrato,
exclusión correcta.** NO requiere decisión de contrato: A-10 ya está cerrado en
el `.feature`; no es un hueco, es una decisión tomada. Es la única exclusión de
`site.ts` (una sola línea `// Stryker disable next-line all`, línea 73).

## Higiene

Suite completa verde antes de mutar (`pnpm test`: 84 tests). Procesos `node`
huérfanos matados tras cada corrida (`taskkill /F /IM node.exe`). No edité `src/`
ni los tests.

**Conclusión: PASS. site.ts al 100%, F-01 sin regresión, 0 supervivientes, la
única exclusión es un equivalente genuino ya decidido por el contrato.**
