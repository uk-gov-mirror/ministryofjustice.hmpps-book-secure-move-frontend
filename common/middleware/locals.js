const { startOfTomorrow } = require('date-fns')

const movesApp = require('../../app/moves')

module.exports = function setLocals(req, res, next) {
  const protocol = req.encrypted ? 'https' : req.protocol
  const baseUrl = `${protocol}://${req.get('host')}`
  const locals = {
    CANONICAL_URL: baseUrl + req.path,
    TODAY: new Date(),
    TOMORROW: startOfTomorrow(),
    REQUEST_PATH: req.path,
    USER: req.user,
    CURRENT_LOCATION: req.session.currentLocation,
    CURRENT_REGION: req.session.currentRegion,
    MOVES_URL: req.session.movesUrl || movesApp.mountpath,
    getLocal: key => res.locals[key],
    getMessages: () => req.flash(),
    canAccess: permission => {
      if (!req.canAccess) {
        return false
      }

      return req.canAccess(permission)
    },
    getBreadcrumbs() {
      if (!res.breadcrumb) {
        return []
      }

      const breadcrumbs = res.breadcrumb()
      return breadcrumbs.map(({ text, href }, i) => {
        return {
          text,
          href: i === breadcrumbs.length - 1 ? null : href,
        }
      })
    },
  }

  res.locals = {
    ...res.locals,
    ...locals,
  }

  next()
}
