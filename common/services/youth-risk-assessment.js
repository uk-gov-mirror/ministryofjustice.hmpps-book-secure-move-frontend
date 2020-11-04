const { FRAMEWORKS } = require('../../config')
const apiClient = require('../lib/api-client')()
const profileService = require('../services/profile')

const noIdMessage = 'No resource ID supplied'

const personEscortRecordService = {
  transformResponse({ data = {} } = {}) {
    return {
      ...data,
      profile: profileService.transform(data.profile),
    }
  },

  create(moveId) {
    return apiClient
      .create('youth_risk_assessment', {
        version: FRAMEWORKS.CURRENT_VERSION,
        move: {
          id: moveId,
        },
      })
      .then(response => response.data)
  },

  confirm(id) {
    if (!id) {
      return Promise.reject(new Error(noIdMessage))
    }

    return apiClient
      .update('youth_risk_assessment', {
        id,
        status: 'confirmed',
      })
      .then(this.transformResponse)
  },

  getById(id) {
    if (!id) {
      return Promise.reject(new Error(noIdMessage))
    }

    return apiClient
      .find('youth_risk_assessment', id)
      .then(this.transformResponse)
  },

  respond(id, data = []) {
    if (!id) {
      return Promise.reject(new Error(noIdMessage))
    }

    if (data.length === 0) {
      return Promise.resolve([])
    }

    return apiClient
      .one('youth_risk_assessment', id)
      .all('framework_response')
      .patch(data)
  },
}

module.exports = personEscortRecordService
