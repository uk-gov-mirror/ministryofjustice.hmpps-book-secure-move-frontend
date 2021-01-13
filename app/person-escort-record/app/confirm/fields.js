const { time: timeFormatter } = require('../../../../common/formatters')
const {
  datetime: datetimeValidator,
  after,
} = require('../../../move/validators')

const confirmPersonEscortRecord = {
  id: 'confirm_person_escort_record',
  name: 'confirm_person_escort_record',
  component: 'govukCheckboxes',
  items: [
    {
      text: 'fields::confirm_person_escort_record.label',
      value: 'yes',
    },
  ],
  validate: 'required',
}
const dispatchingOfficer = {
  id: 'dispatching_officer',
  name: 'dispatching_officer',
  component: 'govukInput',
  classes: 'govuk-input--width-10',
  label: {
    text: 'Dispatching officer ID',
    classes: 'govuk-label--s',
  },
  validate: 'required',
}
const dispatchingOfficerName = {
  id: 'dispatching_officer_name',
  name: 'dispatching_officer_name',
  component: 'govukInput',
  classes: 'govuk-input--width-20',
  label: {
    text: 'Dispatching officer name',
    classes: 'govuk-label--s',
  },
  validate: 'required',
}
const receivingOfficer = {
  id: 'receiving_officer',
  name: 'receiving_officer',
  component: 'govukInput',
  classes: 'govuk-input--width-10',
  label: {
    text: 'Receiving officer ID',
    classes: 'govuk-label--s',
  },
  validate: 'required',
}
const receivingOfficerName = {
  id: 'receiving_officer_name',
  name: 'receiving_officer_name',
  component: 'govukInput',
  classes: 'govuk-input--width-20',
  label: {
    text: 'Receiving officer name',
    classes: 'govuk-label--s',
  },
  validate: 'required',
}
const orgCustom = {
  id: 'org_custom',
  name: 'org_custom',
  component: 'govukInput',
  label: {
    text: 'Handed over to',
    classes: 'govuk-label--s',
  },
  validate: 'required',
}
const receivingOfficerOrg = {
  name: 'receiving_officer_organisation',
  component: 'govukRadios',
  fieldset: {
    legend: {
      text: 'Organisation',
      classes: 'govuk-fieldset__legend--s',
    },
  },
  items: [
    {
      id: 'receiving_officer_organisation',
      value: 'now',
      text: 'Supplier',
    },
    {
      value: 'custom',
      text: 'Luton Crown Court',
    },
    {
      value: 'custom',
      text: 'Another party',
      conditional: 'org_custom',
    },
  ],
  validate: 'required',
}
const propertyReceived = {
  name: 'property_received',
  component: 'govukCheckboxes',
  fieldset: {
    legend: {
      text: 'Property received for this person',
      classes: 'govuk-fieldset__legend--s',
    },
  },
  hint: {
    text: 'Select all that apply',
  },
  items: [
    {
      id: 'property_received',
      value: 'now',
      text: 'Bag 1 — 12345',
      hint: {
        text: 'Contents: ',
      },
    },
    {
      value: 'custom',
      text: 'Bag 2 — 67890',
    },
  ],
  validate: 'required',
}
const handoverTimeType = {
  validate: 'required',
  name: 'handover_time_type',
  component: 'govukRadios',
  fieldset: {
    legend: {
      text: 'Handover time',
      classes: 'govuk-fieldset__legend--s',
    },
  },
  items: [
    {
      id: 'handover_time_type',
      value: 'now',
      text: 'Now',
    },
    {
      value: 'custom',
      text: 'Enter manually',
      conditional: 'handover_time_custom',
    },
  ],
}
const handoverTimeCustom = {
  id: 'handover_time_custom',
  name: 'handover_time_custom',
  validate: ['required', datetimeValidator, after],
  formatter: [timeFormatter],
  component: 'govukInput',
  classes: 'govuk-input--width-10',
  autocomplete: 'off',
  label: {
    html: 'Time of handover',
    classes: 'govuk-label--s',
  },
}

module.exports = {
  confirm_person_escort_record: confirmPersonEscortRecord,
  dispatching_officer: dispatchingOfficer,
  dispatching_officer_name: dispatchingOfficerName,
  receiving_officer: receivingOfficer,
  receiving_officer_name: receivingOfficerName,
  receiving_officer_organisation: receivingOfficerOrg,
  property_received: propertyReceived,
  org_custom: orgCustom,
  handover_time_type: handoverTimeType,
  handover_time_custom: handoverTimeCustom,
}
