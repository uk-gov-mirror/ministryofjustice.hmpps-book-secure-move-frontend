const { kebabCase } = require('lodash')

const FormWizardController = require('../../../common/controllers/form-wizard')
const responseService = require('../../../common/services/framework-response')

class FrameworksController extends FormWizardController {
  middlewareSetup() {
    super.middlewareSetup()
    this.use(this.setButtonText)
  }

  setButtonText(req, res, next) {
    const { stepType } = req.form.options
    const isInterruptionCard = stepType === 'interruption-card'
    const buttonText = isInterruptionCard
      ? 'actions::continue'
      : 'actions::save_and_continue'

    req.form.options.buttonText = buttonText

    next()
  }

  reduceResponses(accumulator, { value, value_type: valueType, question }) {
    const field = question.key

    if (valueType === 'object') {
      accumulator[field] = value.option
      accumulator[`${field}--${kebabCase(value.option)}`] = value.details
    }

    if (valueType === 'collection') {
      accumulator[field] = value.map(item => item.option)
      value.forEach(item => {
        accumulator[`${field}--${kebabCase(item.option)}`] = item.details
      })
    }

    if (valueType === 'string' || valueType === 'array') {
      accumulator[field] = value
    }

    return accumulator
  }

  getValues(req, res, callback) {
    const fields = req.form.options.fields
    const responses = req.personEscortRecord.responses
    const savedValues = responses
      .filter(response => fields[response.question?.key])
      .filter(response => response.value)
      .reduce(this.reduceResponses, {})

    super.getValues(req, res, (err, values) => {
      if (err) {
        return callback(err)
      }

      callback(null, {
        ...savedValues,
        ...values,
      })
    })
  }

  getResponses(formValues, allResponses) {
    return allResponses
      .filter(response => formValues[response.question.key])
      .reduce((accumulator, { question, id }) => {
        const fieldName = question.key
        const value = formValues[fieldName]

        accumulator.push({ id, value })

        return accumulator
      }, [])
  }

  async saveValues(req, res, next) {
    const formValues = req.form.values
    const allResponses = req.personEscortRecord.responses
    const responsePromises = this.getResponses(
      formValues,
      allResponses
    ).map(response => responseService.update(response))

    try {
      // wait for all responses to resolve first
      await Promise.all(responsePromises)
      // call parent saveValues to handle storing new values in the session
      super.saveValues(req, res, next)
    } catch (error) {
      next(error)
    }
  }

  successHandler(req, res, next) {
    if (req.body.save_and_return_to_overview) {
      return res.redirect(req.baseUrl)
    }

    super.successHandler(req, res, next)
  }
}

module.exports = FrameworksController
