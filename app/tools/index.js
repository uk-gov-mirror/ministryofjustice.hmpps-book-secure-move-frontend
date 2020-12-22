// NPM dependencies
const router = require('express').Router()

const { ENABLE_DEVELOPMENT_TOOLS } = require('../../config')

const routes = {
  permissions: '/permissions',
}

// Local dependencies
const {
  updatePermissions,
  renderPermissions,
  createPER,
} = require('./controllers')

// Define routes
router.route(routes.permissions).get(renderPermissions).post(updatePermissions)
router.route('/complete/:type/:assessmentId').get(createPER)

// Export
module.exports = {
  router,
  routes,
  mountpath: '/tools',
  // Only load app when enabled
  skip: !ENABLE_DEVELOPMENT_TOOLS,
}
