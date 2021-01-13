// NPM dependencies
const router = require('express').Router()

const { protectRoute } = require('../../../../common/middleware/permissions')
const wizard = require('../../../../common/middleware/unique-form-wizard')

const config = require('./config')
const fields = require('./fields')
const steps = require('./steps')

// Define shared middleware
router.use(protectRoute('person_escort_record:confirm'))
router.use((req, res, next) => {
  res.breadcrumb({
    text: 'Record handover',
    href: '',
  })
  next()
})

// Define routes
router.use(wizard(steps, fields, config, 'assessment.id'))

// Export
module.exports = {
  router,
  mountpath: '/confirm',
}
