#!/usr/bin/env python3
"""Capa de la API de citas para ensamblar la imagen con crane, sin Docker (Fase 8, issue #41).

Patrón de RAGchatbotIA (tools/ensamblar-imagen.py): el workflow api-image.yml empaqueta la API en un job de Node
(`pnpm --filter ./api build` -> api/dist/servidor.mjs) y aquí se arma, de forma reproducible, la única capa que va
encima de la base oficial node:22-bookworm-slim fijada por digest. Después `crane append` la pone encima y
`crane mutate` fija usuario, WORKDIR, ENV y CMD.

Contenido de la capa (dueño root:root, solo lectura para el usuario node, uid 1000):
  /app/servidor.mjs   el bundle ESM de la API (sin node_modules: esbuild lo empaqueta todo)
La entrada debe traer SOLO ese fichero: cualquier otro (un .map, un .env) se rechaza.

Uso: ensamblar-imagen.py --entrada <dir con servidor.mjs> --salida capa.tar
Fecha 0 y orden fijo: la misma entrada da el mismo tar (y el mismo digest de capa).
"""

import argparse
import io
import os
import sys
import tarfile

APP = "app"


def entrada(nombre: str, tipo: bytes, modo: int, tam: int = 0) -> tarfile.TarInfo:
    info = tarfile.TarInfo(nombre)
    info.type = tipo
    info.mode = modo
    info.uid = info.gid = 0
    info.uname = info.gname = ""
    info.mtime = 0
    info.size = tam
    return info


def main() -> None:
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--entrada", required=True)
    p.add_argument("--salida", required=True)
    a = p.parse_args()

    contenido = sorted(os.listdir(a.entrada)) if os.path.isdir(a.entrada) else []
    if contenido != ["servidor.mjs"] or not os.path.isfile(os.path.join(a.entrada, "servidor.mjs")):
        sys.exit(f"la entrada debe tener solo servidor.mjs (pnpm build de api/), y tiene: {contenido}")

    with open(os.path.join(a.entrada, "servidor.mjs"), "rb") as f:
        datos = f.read()
    with tarfile.open(a.salida, "w", format=tarfile.PAX_FORMAT) as tf:
        tf.addfile(entrada(APP, tarfile.DIRTYPE, 0o755))
        tf.addfile(entrada(f"{APP}/servidor.mjs", tarfile.REGTYPE, 0o644, len(datos)), io.BytesIO(datos))
    print(f"capa: /{APP}/servidor.mjs ({len(datos)} bytes)")


if __name__ == "__main__":
    main()
