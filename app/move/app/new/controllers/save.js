const Sentry = require('@sentry/node')
const { get, omit, capitalize, flatten, values, some } = require('lodash')

const { uuidRegex } = require('../../../../../common/helpers/url')
const analytics = require('../../../../../common/lib/analytics')
const filters = require('../../../../../config/nunjucks/filters')

const CreateBaseController = require('./base')

function filterAnswer(currentAssessment, searchKey) {
  return item => {
    return !(
      !some(currentAssessment, { key: searchKey }) && item.key === searchKey
    )
  }
}

class SaveController extends CreateBaseController {
  async saveValues(req, res, next) {
    const courtHearingService = req.services.courtHearing
    const profileService = req.services.profile

    try {
      const sessionData = req.sessionModel.toJSON()
      const assessment = sessionData.assessment
      const documents = sessionData.documents
      const data = omit(sessionData, [
        'csrf-secret',
        'errors',
        'errorValues',
        'assessment',
        'documents',
      ])
      const move = await req.services.move.create(data)
      const promises = [
        // create hearings
        ...(data.court_hearings || []).map(hearing =>
          courtHearingService.create(
            {
              ...hearing,
              move: move.id,
            },
            data.should_save_court_hearings === 'false'
          )
        ),
      ]

      if (data.profile?.person?.id) {
        promises.push(
          profileService.update({
            ...data.profile,
            requires_youth_risk_assessment: this.requiresYouthAssessment(req),
            assessment_answers: assessment,
            documents,
          })
        )
      } else {
        Sentry.withScope(scope => {
          scope.setExtra('Move ID', move.id)
          scope.setExtra('Profile ID', data.profile?.id)
          scope.setExtra('Person ID', data.person?.id)
          Sentry.captureException(new Error('No Person ID supplied'))
        })
      }

      await Promise.all(promises)

      req.sessionModel.set('move', move)

      next()
    } catch (error) {
      next(error)
    }
  }

  process(req, res, next) {
    const {
      assessment,
      from_location_type: fromLocationType,
      to_location_type: toLocationType,
    } = req.form.values
    const currentAssessment = flatten(values(assessment))

    const locationTypes = [
      'secure_childrens_home',
      'secure_training_centre',
      'prison',
    ]

    if (
      locationTypes.includes(fromLocationType) &&
      locationTypes.includes(toLocationType)
    ) {
      req.sessionModel.set('status', 'proposed')
    }

    if (fromLocationType !== 'prison') {
      req.sessionModel.set('assessment', currentAssessment)
      return super.process(req, res, next)
    }

    const profile = req.getProfile()

    const existingAssessment = profile.assessment_answers
      // keep all existing NOMIS alerts
      .filter(answer => answer.nomis_alert_code)
      // filter out requested answers
      .filter(filterAnswer(currentAssessment, 'not_to_be_released'))
      .filter(filterAnswer(currentAssessment, 'special_vehicle'))

    req.sessionModel.set('assessment', [
      ...existingAssessment,
      ...currentAssessment,
    ])

    super.process(req, res, next)
  }

  async successHandler(req, res, next) {
    const move = req.sessionModel.get('move')
    const timingCategory = capitalize(
      req.sessionModel.get('from_location_type')
    )
    const journeyDuration = Math.round(
      new Date().getTime() - req.sessionModel.get('journeyTimestamp')
    )
    const timingVariable = capitalize(
      req.form.options.name.replace(new RegExp(`-${uuidRegex}`, 'g'), '')
    )

    try {
      await analytics.sendJourneyTime({
        utv: timingVariable,
        utt: journeyDuration,
        utc: timingCategory,
      })

      req.journeyModel.reset()
      req.sessionModel.reset()

      res.redirect(`/move/${move.id}/confirmation`)
    } catch (err) {
      next(err)
    }
  }

  errorHandler(err, req, res, next) {
    const apiErrorCode = get(err, 'errors[0].code')

    if (err.statusCode === 422 && apiErrorCode === 'taken') {
      const existingMoveId = get(err, 'errors[0].meta.existing_id')
      const values = req.sessionModel.toJSON()

      return res.render('action-prevented', {
        pageTitle: req.t('validation::move_conflict.heading'),
        message: req.t('validation::move_conflict.message', {
          href: `/move/${existingMoveId}`,
          name: values.person._fullname,
          location:
            values.to_location?.title ||
            req.t('fields::move_type.items.prison_recall.label'),
          date: filters.formatDateWithDay(values.date),
        }),
        instruction: req.t('validation::move_conflict.instructions', {
          date_href: 'move-date/edit',
          location_href: 'move-details/edit',
        }),
      })
    }

    super.errorHandler(err, req, res, next)
  }
}

module.exports = SaveController
