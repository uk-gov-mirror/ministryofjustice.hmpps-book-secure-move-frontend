const { filter } = require('lodash')

const FormWizardController = require('../../../common/controllers/form-wizard')
const presenters = require('../../../common/presenters')
const filters = require('../../../config/nunjucks/filters')

const mockAlerts = require('./mock-alerts')

function appendAlerts(fields, key, alerts, createdDate) {
  if (!fields[key]) {
    return
  }

  fields[key].alerts = `
    <h4 class="govuk-heading-s govuk-!-font-size-16 govuk-!-margin-top-0 govuk-!-padding-top-0 govuk-!-margin-bottom-2">
      Active NOMIS information included
    </h4>

    ${alerts}
  `
}

class FrameworkSectionController extends FormWizardController {
  middlewareLocals() {
    super.middlewareLocals()
    this.use(this.setSectionSummary)
    this.use(this.setMoveId)
    this.use(this.setEditableStatus)
  }

  middlewareSetup() {
    this.use(this.setNomisAlerts)
    super.middlewareSetup()
  }

  setNomisAlerts(req, res, next) {
    mockAlerts.forEach(alert => {
      appendAlerts(
        req.form.options.allFields,
        alert.key,
        alert.html,
        req.personEscortRecord.created_at
      )
    })

    next()
  }

  setMoveId(req, res, next) {
    // TODO: Make available when accessing PER without a move based URLs
    res.locals.moveId = req.move?.id

    next()
  }

  setEditableStatus(req, res, next) {
    res.locals.isEditable = req.personEscortRecord?.isEditable
    next()
  }

  setSectionSummary(req, res, next) {
    const { frameworkSection, personEscortRecord, baseUrl, form } = req
    const { name, steps } = frameworkSection
    const stepSummaries = Object.entries(steps).map(
      presenters.frameworkStepToSummary(
        form.options.allFields,
        personEscortRecord.responses,
        `${baseUrl}/`
      )
    )

    res.locals.sectionTitle = name
    res.locals.summarySteps = filter(stepSummaries)

    next()
  }
}

module.exports = FrameworkSectionController
