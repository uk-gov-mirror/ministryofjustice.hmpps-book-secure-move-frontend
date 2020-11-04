// NPM dependencies
const router = require('express').Router()
const wizard = require('hmpo-form-wizard')

const config = require('./config')
const steps = require('./steps')

// Define shared middleware

// Define routes
router.use(wizard(steps, {}, config))

// Export
module.exports = {
  router,
  mountpath: '/new',
}
