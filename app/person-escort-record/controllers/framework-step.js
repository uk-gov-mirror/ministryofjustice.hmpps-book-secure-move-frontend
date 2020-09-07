const { isEmpty, get, set } = require('lodash')

const FormWizardController = require('../../../common/controllers/form-wizard')
const fieldHelpers = require('../../../common/helpers/field')
const frameworksHelpers = require('../../../common/helpers/frameworks')
const permissionsControllers = require('../../../common/middleware/permissions')
const responseService = require('../../../common/services/framework-response')
const filters = require('../../../config/nunjucks/filters')

const mockAlerts = require('./mock-alerts')

function appendAlerts(fields, key, alerts, createdDate) {
  if (!fields[key]) {
    return
  }

  fields[key].hint = {
    html:
      fields[key].hint.html +
      `
      <h4 class="govuk-heading-s govuk-!-margin-top-0 govuk-!-padding-top-0 govuk-!-margin-bottom-2">
        Information included from NOMIS as of ${filters.formatDateWithDay(
          createdDate
        )}
      </h4>

      <div class="govuk-!-margin-bottom-4">
        ${alerts}
      </div>
    `,
  }
}

class FrameworkStepController extends FormWizardController {
  middlewareChecks() {
    super.middlewareChecks()
    // TODO: Exist this logic to redirect to the overview path if
    // user does not have permission to update
    this.use(permissionsControllers.protectRoute('person_escort_record:update'))
    this.use(this.checkEditable)
  }

  checkEditable(req, res, next) {
    const { steps: wizardSteps = {} } = req?.form?.options || {}
    const steps = Object.keys(wizardSteps)
    const overviewStepPath = steps[steps.length - 1]
    const personEscortRecordIsConfirmed = ['confirmed'].includes(
      req.personEscortRecord?.status
    )

    if (personEscortRecordIsConfirmed) {
      return res.redirect(req.baseUrl + overviewStepPath)
    }

    next()
  }

  middlewareSetup() {
    this.use(this.setNomisAlerts)
    super.middlewareSetup()
    this.use(this.setButtonText)
    this.use(this.setConditionalValidation)
  }

  setNomisAlerts(req, res, next) {
    mockAlerts.forEach(alert => {
      appendAlerts(
        req.form.options.fields,
        alert.key,
        alert.html,
        req.personEscortRecord.created_at
      )
    })

    next()
  }

  setConditionalValidation(req, res, next) {
    const fields = req.form.options.fields
    mockAlerts.forEach(alert => {
      const label = get(fields, `${alert.key}--yes.label.text`, '')
      set(fields, `${alert.key}--yes.validate`, [])
      set(fields, `${alert.key}--yes.label.text`, label + ' (optional)')
    })

    next()
  }

  setInitialValues(req, res, next) {
    const fields = req.form.options.fields
    const responses = req.personEscortRecord.responses
    const savedValues = responses
      .filter(response => fields[response.question?.key])
      // TODO: TEMP for prototyping
      .map(response => {
        const value = !isEmpty(response.value)
          ? response.value
          : response.question.last_response?.value
        const field = fields[response.question?.key]

        if (value?.option === 'Yes' || value === 'Yes') {
          req.form.options.prefilled = true

          field.formGroup = {
            classes: ' govuk-form-group--message',
          }

          const hint = field?.hint?.html || ''

          if (!hint.includes('This answer')) {
            const relativeTime = filters.timeAgo(
              response.question.last_response?.person_escort_record?.created_at
            )

            field.hint = {
              html:
                hint +
                `<span class="govuk-prefill-message">This answer is from the last PER created ${relativeTime} ago</span>`,
            }
          }

          if (value.details === 'n/a') {
            value.details = ''
          }

          return {
            ...response,
            value,
          }
        }

        return response
      })
      .filter(response => !isEmpty(response.value))
      .reduce(frameworksHelpers.reduceResponsesToFormValues, {})

    if (req.form.options.fullPath !== req.journeyModel.get('lastVisited')) {
      req.sessionModel.set(savedValues)
    }

    next()
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

  middlewareLocals() {
    super.middlewareLocals()
    this.use(this.setPageTitleLocals)
  }

  setPageTitleLocals(req, res, next) {
    res.locals.frameworkSection = req.frameworkSection.name
    next()
  }

  async saveValues(req, res, next) {
    const { form, personEscortRecord } = req
    const responses = personEscortRecord.responses
      .filter(response =>
        fieldHelpers.isAllowedDependent(
          form.options.fields,
          response?.question?.key,
          form.values
        )
      )
      .reduce(frameworksHelpers.responsesToSaveReducer(form.values), [])

    try {
      // wait for all responses to resolve first
      await Promise.all(
        responses.map(response => responseService.update(response))
      )
      // call parent saveValues to handle storing new values in the session
      super.saveValues(req, res, next)
    } catch (error) {
      next(error)
    }
  }

  successHandler(req, res, next) {
    const { steps: wizardSteps = {}, route } = req?.form?.options || {}
    const goToOverview = req.body.save_and_return_to_overview
    const steps = Object.keys(wizardSteps)
    const overviewStepPath = steps[steps.length - 1]
    const nextStep = this.getNextStep(req, res)
    const currentStep = route
    const isLastStep = nextStep.endsWith(currentStep)

    if (isLastStep || goToOverview) {
      return res.redirect(req.baseUrl + overviewStepPath)
    }

    super.successHandler(req, res, next)
  }
}

module.exports = FrameworkStepController
