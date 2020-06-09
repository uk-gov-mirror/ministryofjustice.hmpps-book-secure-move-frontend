const { get } = require('lodash')

module.exports = {
  name: 'req-include',
  req: function req(payload = {}) {
    if (!payload.req) {
      return payload
    }

    const { req, jsonApi = {} } = payload
    const defaultInclude = get(
      jsonApi,
      `models.${req.model}.options.defaultInclude`
    )

    let include = req.params.include || defaultInclude

    if (Array.isArray(include)) {
      include = include.sort().join(',')
    }

    req.params.include = include

    return payload
  },
}
