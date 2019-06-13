const FormController = require('./form')
const personService = require('../../../common/services/person')
const referenceDataService = require('../../../common/services/reference-data')

function _referenceToItem (item) {
  return {
    value: item.id,
    text: item.title,
  }
}

function _intialOption (label = 'option') {
  return {
    text: `--- Choose ${label} ---`,
  }
}

class PersonalDetailsController extends FormController {
  async configure (req, res, next) {
    try {
      const genders = await referenceDataService.getGenders()
      const ethnicities = await referenceDataService.getEthnicities()

      req.form.options.fields.gender.items = genders.map(_referenceToItem)
      req.form.options.fields.ethnicity.items = [_intialOption('ethnicity'), ...ethnicities.map(_referenceToItem)]

      super.configure(req, res, next)
    } catch (error) {
      next(error)
    }
  }

  async saveValues (req, res, next) {
    try {
      req.form.values.person = await personService.create(req.form.values)
      super.saveValues(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

module.exports = PersonalDetailsController
