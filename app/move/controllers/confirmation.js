const { filter, get, map, reject } = require('lodash')

function confirmation(req, res) {
  const {
    hearings,
    move_type: moveType,
    to_location: toLocation,
  } = res.locals.move
  const suppliers = get(res.locals, 'move.from_location.suppliers')
  const supplierNames =
    suppliers && suppliers.length
      ? map(suppliers, 'name')
      : [req.t('supplier_fallback')]
  const savedHearings = map(filter(hearings, 'saved_to_nomis'), 'case_number')
  const unsavedHearings = map(reject(hearings, 'saved_to_nomis'), 'case_number')

  const locals = {
    supplierNames,
    savedHearings,
    unsavedHearings,
    location:
      moveType === 'prison_recall'
        ? req.t('fields::move_type.items.prison_recall.label')
        : toLocation.title,
  }

  res.render('move/views/confirmation', locals)
}

module.exports = confirmation
