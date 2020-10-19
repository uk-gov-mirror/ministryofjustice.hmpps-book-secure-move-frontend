const promster = require('@promster/express')

let prometheusClient

// Create noop version of Prometheus client
//
// Enables code with instrumentation to run
// even if metrics have not been initialized
// and avoid need for wrapping in conditionals
const emptyFn = () => {}

const inc = emptyFn
const dec = emptyFn
const set = emptyFn
const observe = emptyFn
const setToCurrentTime = emptyFn
const endTimer = emptyFn
const startTimer = () => endTimer

const observeValues = () => {
  return {
    observe,
    startTimer,
  }
}

prometheusClient = {
  Counter: function () {
    return {
      inc,
    }
  },
  Gauge: function () {
    return {
      inc,
      dec,
      set,
      setToCurrentTime,
      startTimer,
    }
  },
  Histogram: function () {
    return observeValues()
  },
  Summary: function () {
    return observeValues()
  },
}

/**
 * Normalise path
 *
 * @param {string} path
 * Path to normalise
 *
 * @return {string}
 */
const normalizePath = path => {
  const normalizedPath = path
    .replace(
      /\b[0-9a-f]{8}\b-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-\b[0-9a-f]{12}\b/gi,
      ':uuid'
    )
    .replace(/\d{4}-\d{2}-\d{2}/g, ':date')
  return normalizedPath
}

/**
 * Convert url to normalised path
 *
 * @param {string} url
 * URL to normalise
 *
 * @return {string}
 */
const normalizeUrlToPath = url => {
  return normalizePath(new URL(url).pathname)
}

const getDefaultLabels = config => {
  const {
    SENTRY,
    SERVER_HOST,
    API,
    APP_GIT_SHA,
    APP_VERSION,
    FEATURE_FLAGS,
  } = config

  // add feature flags if any to labels
  const flags = Object.keys(FEATURE_FLAGS).reduce((acc, key) => {
    acc[`FEATURE_FLAG_${key}`] = FEATURE_FLAGS[key]
    return acc
  }, {})

  return {
    ENVIRONMENT: SENTRY.ENVIRONMENT,
    SERVER_HOST,
    API_VERSION: API.VERSION,
    APP_GIT_SHA,
    APP_VERSION,
    ...flags,
  }
}

/**
 * Initialise metrics
 *
 * @param {object} app
 * Express instance
 *
 * @param {object} config
 * Configuration object
 *
 * @return {undefined}
 */
const init = (app, config) => {
  const { PROMETHEUS } = config

  const mountpath = PROMETHEUS.MOUNTPATH

  if (!mountpath) {
    return
  }

  const defaultLabels = getDefaultLabels(config)

  const options = {
    accuracies: ['ms', 's'],
    defaultLabels,
    normalizePath,
  }

  app.use(promster.createMiddleware({ app, options }))

  prometheusClient = app.locals.Prometheus

  prometheusClient.register.setDefaultLabels(defaultLabels)

  app.use(mountpath, summaryRoute)
}

/**
 * Get Prometheus client
 *
 * @return {object} prometheusClient
 */
const getClient = () => {
  return prometheusClient
}

/**
 * Prometheus metrics route middleware
 */
const summaryRoute = (req, res) => {
  if (req.get('x-forwarded-host')) {
    throw new Error(404)
  }

  const contentType = promster.getContentType()
  res.setHeader('Content-Type', contentType)
  const summary = promster.getSummary()
  res.end(summary)
}

module.exports = {
  init,
  getClient,
  summaryRoute,
  normalizePath,
  normalizeUrlToPath,
}
