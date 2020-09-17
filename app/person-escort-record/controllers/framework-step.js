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

  if (!alerts) {
    fields[key].hint = {
      html:
        (fields[key].hint?.html || '') +
        `
        <div class="app-message app-message--muted govuk-!-margin-top-2 govuk-!-margin-bottom-4" data-module="app-message" tabindex="-1" role="alert" aria-labelledby="app-message__heading">
            <div class="app-message__content govuk-!-font-size-16">
              No active NOMIS information
            </div>
        </div>
      `,
    }

    return
  }

  fields[key].hint = {
    html:
      (fields[key].hint?.html || '') +
      `
      <h4 class="govuk-heading-s govuk-!-margin-top-0 govuk-!-padding-top-0 govuk-!-margin-bottom-1">
        Active NOMIS information to be included
      </h4>
      <div class="govuk-caption-s govuk-!-margin-top-0 govuk-!-margin-bottom-2 govuk-!-font-size-16">
        Last updated ${filters.relativeTime(createdDate)}
      </div>

      <div class="govuk-!-margin-bottom-4">
        ${alerts}
      </div>
    `,
    //   `
    //   <h4 class="govuk-heading-s govuk-!-margin-top-0 govuk-!-padding-top-0 govuk-!-margin-bottom-2">
    //     Active NOMIS information to be included (updated ${filters.relativeTime(
    //       createdDate
    //     )})
    //   </h4>

    //   <div class="govuk-!-margin-bottom-4">
    //     ${alerts}
    //   </div>
    // `,
  }
}

class FrameworkStepController extends FormWizardController {
  middlewareChecks() {
    super.middlewareChecks()
    this.use(this.checkEditable)
  }

  checkEditable(req, res, next) {
    const isEditable = req.personEscortRecord?.isEditable
    const userPermissions = req.user?.permissions
    const canEdit = permissionsControllers.check(
      'person_escort_record:update',
      userPermissions
    )

    if (!isEditable || !canEdit) {
      return res.redirect(req.baseUrl)
    }

    next()
  }

  middlewareSetup() {
    // This also needs to be called before setInitialValues otherwise
    // the nested conditional fields don't exist and won't get populated
    // TODO: Find a more efficient way to solve this ordering issue
    this.use(this.setupConditionalFields)
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
        const field = fields[response.question?.key]

        if (
          isEmpty(response.question.last_response?.value) ||
          !isEmpty(response.value)
        ) {
          if (response.value?.details === 'n/a') {
            response.value.details = ''
          }

          return response
        }

        if (response.question.last_response?.value?.details === 'n/a') {
          response.question.last_response.value.details = ''
        }

        req.form.options.prefilled = true

        const hint = field.hint?.html || ''

        field.formGroup = {
          classes: ' govuk-form-group--message',
        }

        if (!hint.includes('This answer')) {
          const datetime =
            response.question.last_response?.person_escort_record?.confirmed_at
          const relativeTime = filters.timeAgo(datetime).replace('about ', '')
          const actualDate = filters.formatDate(datetime)

          console.log(response.question.last_response)

          field.hint = {
            html:
              hint +
              `<span class="govuk-prefill-message">This answer is from the <a href="#">last PER</a> <span class="app-secondary-text-colour app-font-weight-normal govuk-!-font-size-16 govuk-!-display-block">Confirmed ${actualDate}, ${relativeTime}</span></span>`,
            // `<span class="govuk-prefill-message">This answer is from the <a href="#">last PER</a> confirmed on ${actualDate}, ${relativeTime}</span>`,
          }
        }

        return {
          ...response,
          value: response.question.last_response?.value,
        }
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
    const { route } = req?.form?.options || {}
    const goToOverview = req.body.save_and_return_to_overview
    const nextStep = this.getNextStep(req, res)
    const currentStep = route
    const isLastStep = nextStep.endsWith(currentStep)

    if (isLastStep || goToOverview) {
      return res.redirect(req.baseUrl)
    }

    super.successHandler(req, res, next)
  }
}

module.exports = FrameworkStepController
