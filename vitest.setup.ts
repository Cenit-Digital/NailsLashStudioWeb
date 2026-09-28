import '@testing-library/jest-dom/vitest'

// Doble PROTEGIDO de <dialog> (F-24, nailbot_flotante @s15): jsdom 25 no implementa showModal/close.
// Solo se instala si FALTAN: con un jsdom que los traiga, no se pisan. showModal pone el atributo open; close lo
// quita y despacha "close", como hace el navegador (Esc, gesto atrás). Lo nativo se verifica en vivo.
const prototipoDeDialogo = HTMLDialogElement.prototype as unknown as Record<string, unknown>
if (typeof prototipoDeDialogo.showModal !== 'function') {
  prototipoDeDialogo.showModal = function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  }
}
if (typeof prototipoDeDialogo.close !== 'function') {
  prototipoDeDialogo.close = function (this: HTMLDialogElement) {
    // Como el nativo: cerrar un diálogo ya cerrado no hace nada (ni despacha "close").
    if (!this.hasAttribute('open')) {
      return
    }
    this.removeAttribute('open')
    this.dispatchEvent(new Event('close'))
  }
}
