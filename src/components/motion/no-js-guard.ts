/** Script inline placé dans <head> : l'état masqué des animations n'existe que si JS tourne. */
export const NO_JS_GUARD = "document.documentElement.classList.add('js')"
