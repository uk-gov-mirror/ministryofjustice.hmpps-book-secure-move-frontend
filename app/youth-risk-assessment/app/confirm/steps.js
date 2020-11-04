const { ConfirmPersonEscortRecordController } = require('./controllers')

module.exports = {
  '/': {
    entryPoint: true,
    reset: true,
    resetJourney: true,
    skip: true,
    next: 'provide-confirmation',
  },
  '/provide-confirmation': {
    controller: ConfirmPersonEscortRecordController,
    fields: ['confirm_person_escort_record'],
    buttonText: 'actions::confirm_and_complete_record',
    pageTitle: 'youth-risk-assessment::journeys.confirm.heading',
    beforeFieldsContent: 'youth-risk-assessment::journeys.confirm.content',
    template: 'provide-confirmation',
  },
}
