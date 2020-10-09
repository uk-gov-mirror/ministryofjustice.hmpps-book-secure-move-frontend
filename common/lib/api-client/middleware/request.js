const HttpAgent = require('agentkeepalive')
const axios = require('axios')
const debug = require('debug')('app:api-client:axios-request')

const { HttpsAgent } = HttpAgent

const axiosInstance = axios.create({
  httpAgent: new HttpAgent(),
  httpsAgent: new HttpsAgent(),
  // follow up to 10 HTTP 3xx redirects
  maxRedirects: 10,
})

const cache = require('../cache')

function requestMiddleware({ cacheExpiry = 60, useRedisCache = false } = {}) {
  return {
    name: 'axios-request',
    req: async function req(payload) {
      if (payload.res) {
        return payload.res
      }

      const { req, cacheKey } = payload

      debug('API REQUEST', req.url)

      const response = await axiosInstance(req)
        .then(async response => {
          if (cacheKey) {
            debug('CACHEING API RESPONSE', cacheKey)
            await cache.set(cacheKey, response.data, cacheExpiry, useRedisCache)
          }

          return response
        })
        .catch(error => {
          debug('API ERROR', req.url, error)
          throw error
        })

      return response
    },
  }
}

module.exports = requestMiddleware
