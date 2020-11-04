const { get } = require('lodash')

const FormWizardController = require('../../../../common/controllers/form-wizard')
const youthRiskAssessmentService = require('../../../../common/services/youth-risk-assessment')

class NewYouthRiskAssessmentController extends FormWizardController {
  middlewareChecks() {
    super.middlewareChecks()
    this.use(this.checkProfileExists)
  }

  checkProfileExists(req, res, next) {
    if (req.move?.profile?.id) {
      return next()
    }

    const error = new Error('Move profile not found')
    error.statusCode = 404

    next(error)
  }

  async saveValues(req, res, next) {
    try {
      req.record = await youthRiskAssessmentService.create(req.move.id)
      next()
    } catch (err) {
      const apiErrorCode = get(err, 'errors[0].code')

      if (err.statusCode === 422 && apiErrorCode === 'taken') {
        return this.successHandler(req, res)
      }

      next(err)
    }
  }

  successHandler(req, res) {
    req.journeyModel.reset()
    req.sessionModel.reset()

    res.redirect(`/move/${req.move.id}`)
  }
}

module.exports = {
  NewYouthRiskAssessmentController,
}
