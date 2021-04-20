const { uniq } = require('lodash')

const { permissionsByRole } = require('../../common/lib/permissions')

const permittedActions = {
  accept: {
    method: 'accept',
    data: null,
  },
  start: {
    method: 'start',
    data: null,
  },
  redirect: {
    method: 'redirect',
    data: null,
  },
  lockout: {
    method: 'lockout',
    data: null,
  },
  complete: {
    method: 'complete',
    data: {
      notes: 'Foo bar',
    },
  },
}

function renderPermissions(req, res) {
  res.render('tools/views/permissions', {
    activeRoles: req.session.activeRoles || [],
    roles: permissionsByRole,
  })
}

function updatePermissions(req, res) {
  const roles = req.body.roles || []
  const permissions = uniq(roles.map(role => permissionsByRole[role]).flat())

  req.session.activeRoles = roles

  req.session.user = req.session.user || {}
  req.session.user.permissions = permissions

  res.redirect('/')
}

async function updateMoveStatus(req, res, next) {
  try {
    const moveId = req.params.moveId
    // using both body and query means this controller will work for both
    // GET and POST requests
    const action = permittedActions[req.body.action || req.query.action]

    if (action) {
      await req.services.move[action.method](moveId, action.data)
    }

    res.redirect(`/move/${moveId}`)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  renderPermissions,
  updatePermissions,
  updateMoveStatus,
}
