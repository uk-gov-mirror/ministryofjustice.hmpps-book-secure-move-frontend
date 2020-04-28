const { cloneDeep } = require('lodash')

const additionalInformation = require('./additional-information')
const cancellationReason = require('./cancellation-reason')
const cancellationReasonComment = require('./cancellation-reason-comment')
const assessmentAnswer = require('./common.assessment-answer')
const courtHearingComments = require('./court-hearing-comments')
const courtHearingCourtCase = require('./court-hearing-court-case')
const courtHearingStartTime = require('./court-hearing-start-time')
const date = require('./date')
const dateCustom = require('./date-custom')
const dateFrom = require('./date-from')
const dateOfBirth = require('./date-of-birth')
const dateTo = require('./date-to')
const dateType = require('./date-type')
const documents = require('./documents')
const ethnicity = require('./ethnicity')
const filterPoliceNationalComputer = require('./filter.police-national-computer')
const filterPrisonNumber = require('./filter.prison-number')
const firstNames = require('./first-names')
const gender = require('./gender')
const genderAdditionalInformation = require('./gender-additional-information')
const hasCourtCase = require('./has-court-case')
const hasDateTo = require('./has-date-to')
const lastName = require('./last-name')
const moveAgreed = require('./move-agreed')
const moveAgreedBy = require('./move-agreed-by')
const moveType = require('./move-type')
const people = require('./people')
const policeNationalComputer = require('./police-national-computer')
const policeNationalComputerUpdate = require('./police-national-computer.update')
const prisonTransferReason = require('./prison-transfer-reason')
const prisonTransferReasonComments = require('./prison-transfer-reason-comments')
const shouldSaveCourtHearings = require('./should-save-court-hearings')
const toLocation = require('./to-location')
const toLocationCourtAppearance = require('./to-location-court-appearance')
const toLocationPrisonTransfer = require('./to-location-prison-transfer')

const cancel = {
  cancellation_reason: cancellationReason,
  cancellation_reason_comment: cancellationReasonComment,
}
const create = {
  additional_information: additionalInformation,
  concealed_items: assessmentAnswer(),
  court_hearing__comments: courtHearingComments,
  court_hearing__court_case: courtHearingCourtCase,
  court_hearing__start_time: courtHearingStartTime,
  date,
  date_custom: dateCustom,
  date_from: dateFrom,
  date_of_birth: dateOfBirth,
  date_to: dateTo,
  date_type: dateType,
  documents,
  escape: assessmentAnswer(),
  ethnicity,
  'filter.police_national_computer': filterPoliceNationalComputer,
  'filter.prison_number': filterPrisonNumber,
  first_names: firstNames,
  gender,
  gender_additional_information: genderAdditionalInformation,
  has_court_case: hasCourtCase,
  has_date_to: hasDateTo,
  health_issue: assessmentAnswer(),
  hold_separately: assessmentAnswer(),
  interpreter: assessmentAnswer(),
  last_name: lastName,
  medication: assessmentAnswer(),
  move_agreed: moveAgreed,
  move_agreed_by: moveAgreedBy,
  move_type: moveType,
  not_to_be_released: assessmentAnswer({
    isRequired: true,
    isExplicit: true,
  }),
  other_court: assessmentAnswer({ isRequired: true }),
  other_health: assessmentAnswer({ isRequired: true }),
  other_risks: assessmentAnswer({ isRequired: true }),
  people,
  police_national_computer: policeNationalComputer,
  pregnant: assessmentAnswer(),
  prison_transfer_reason: prisonTransferReason,
  prison_transfer_reason_comments: prisonTransferReasonComments,
  self_harm: assessmentAnswer(),
  solicitor: assessmentAnswer(),
  special_diet_or_allergy: assessmentAnswer(),
  special_vehicle: assessmentAnswer({
    isRequired: true,
    isExplicit: true,
  }),
  should_save_court_hearings: shouldSaveCourtHearings,
  to_location: toLocation,
  to_location_court_appearance: toLocationCourtAppearance,
  to_location_prison_transfer: toLocationPrisonTransfer,
  wheelchair: assessmentAnswer(),
  violent: assessmentAnswer(),
}
const update = {
  ...cloneDeep(create),
  police_national_computer: policeNationalComputerUpdate,
}

module.exports = {
  cancel,
  create,
  update,
}
