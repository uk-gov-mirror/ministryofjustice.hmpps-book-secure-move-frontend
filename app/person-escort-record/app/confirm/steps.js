const FormWizardController = require('../../../../common/controllers/form-wizard')
const ConfirmAssessmentController = require('../../../../common/controllers/framework/confirm-assessment')
const setMoveWithSummary = require('../../../../common/middleware/set-move-with-summary')

class BeforeController extends FormWizardController {
  middlewareLocals() {
    this.use(setMoveWithSummary)
    super.middlewareLocals()
  }
}

const single = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'before-you-start',
  },
  '/before-you-start': {
    controller: BeforeController,
    pageTitle: 'Before you start handover',
    beforeFieldsContent: 'person-escort-record::journeys.confirm.before',
    next: 'handover-details',
    templatePath: 'person-escort-record/app/confirm',
    template: 'before',
  },
  '/handover-details': {
    checkJourney: false,
    controller: ConfirmAssessmentController,
    fields: [
      'dispatching_officer',
      'dispatching_officer_name',
      'receiving_officer',
      'receiving_officer_name',
      // 'receiving_officer_organisation',
      // 'org_custom',
      // 'property_received',
      'handover_time_type',
      'handover_time_custom',
      'confirm_person_escort_record',
    ],
    buttonText: 'actions::confirm_and_complete_record',
    pageTitle: 'Handover',
    // beforeFieldsContent:
    // 'Check that:\n- the correct person is being move\n- property and cash\n- the risk',
    // afterFieldsContent: 'person-escort-record::journeys.confirm.content',
    templatePath: 'person-escort-record/app/confirm',
    template: 'handover-details',
  },
}

const multi = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'dispatching',
  },
  '/dispatching': {
    checkJourney: false,
    // controller: FormWizardController,
    fields: ['dispatching_officer'],
    pageTitle: 'Dispatching officer',
    template: 'form-wizard',
    next: 'receiving',
  },
  '/receiving': {
    checkJourney: false,
    // controller: ConfirmAssessmentController,
    fields: [
      'receiving_officer',
      'receiving_officer_organisation',
      'org_custom',
    ],
    pageTitle: 'Receiving officer',
    template: 'form-wizard',
    next: 'contents',
  },
  '/contents': {
    checkJourney: false,
    controller: ConfirmAssessmentController,
    fields: [
      'property_received',
      'handover_time_type',
      'handover_time_custom',
      'confirm_person_escort_record',
    ],
    buttonText: 'actions::confirm_and_complete_record',
    pageTitle: 'Handover details',
    afterFieldsContent: 'person-escort-record::journeys.confirm.content',
    template: 'form-wizard',
  },
}

module.exports = single
