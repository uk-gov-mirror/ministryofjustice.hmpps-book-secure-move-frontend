// NPM dependencies
const router = require('express').Router({ mergeParams: true })

// Local dependencies
const { uuidRegex } = require('../../common/helpers/url')

const newApp = require('./app/new')
const { frameworkOverviewController } = require('./controllers')
const {
  setFramework,
  setFrameworkSection,
  setAssessment,
} = require('./middleware')
const { defineFormWizard } = require('./router')

router.param('section', setFrameworkSection)

// Define "create" sub-app before ID sepcific middleware
router.use(newApp.mountpath, newApp.router)

// Define shared middleware
router.use(setAssessment)
router.use(setFramework)

// Define sub-apps

// Define routes
router.get('/', frameworkOverviewController)
router.use('/:section', defineFormWizard)

// Export
module.exports = {
  router,
  mountpath: `/youth-risk-assessment/:assessmentId(${uuidRegex})?`,
}
