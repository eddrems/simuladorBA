// ParsleyConfig definition if not already set
window.ParsleyConfig = window.ParsleyConfig || {};
window.ParsleyConfig.i18n = window.ParsleyConfig.i18n || {};

window.ParsleyConfig.i18n.es = $.extend(window.ParsleyConfig.i18n.es || {}, {
  defaultMessage: "Este valor parece ser inv�lido.",
  type: {
    email:        "Este valor debe ser un correo v�lido.",
    url:          "Este valor debe ser una URL v�lida.",
    number:       "Este valor debe ser un n�mero v�lido.",
    integer:      "Este valor debe ser un n�mero v�lido.",
    digits:       "Este valor debe ser un d�gito v�lido.",
    alphanum:     "Este valor debe ser alfanum�rico."
  },
  notblank:       "Este valor no debe estar en blanco.",
  required:       "Este valor es requerido.",
  pattern:        "Este valor es incorrecto.",
  min:            "Este valor no debe ser menor que %s.",
  max:            "Este valor no debe ser mayor que %s.",
  range:          "Este valor debe estar entre %s y %s.",
  minlength:      "Este valor es muy corto. La longitud m�nima es de %s caracteres.",
  maxlength:      "Este valor es muy largo. La longitud m�xima es de %s caracteres.",
  length:         "La longitud de este valor debe estar entre %s y %s caracteres.",
  mincheck:       "Debe seleccionar al menos %s opciones.",
  maxcheck:       "Debe seleccionar %s opciones o menos.",
  rangecheck:     "Debe seleccionar entre %s y %s opciones.",
  equalto:        "Este valor debe ser id�ntico."
});

// If file is loaded after Parsley main file, auto-load locale
if ('undefined' !== typeof window.ParsleyValidator)
  window.ParsleyValidator.addCatalog('es', window.ParsleyConfig.i18n.es, true);