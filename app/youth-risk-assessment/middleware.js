const frameworksService = require('../../common/services/frameworks')
const youthRiskAssessmentService = require('../../common/services/youth-risk-assessment')

function setFramework(req, res, next) {
  if (!req.youthRiskAssessment) {
    return next()
  }

  try {
    req.framework = frameworksService.getYouthRiskAssessment(
      req.youthRiskAssessment?.version
    )

    next()
  } catch (error) {
    next(error)
  }
}

function setFrameworkSection(req, res, next, key) {
  const section = req.framework?.sections[key]

  if (section) {
    req.frameworkSection = section
    return next()
  }

  const error = new Error('Framework section not found')
  error.statusCode = 404

  next(error)
}

async function setAssessment(req, res, next) {
  const recordId = req.params?.assessmentId

  if (req.youthRiskAssessment) {
    return next()
  }

  if (!recordId) {
    const error = new Error('Youth risk assessment not found')
    error.statusCode = 404
    return next(error)
  }

  try {
    req.youthRiskAssessment = await youthRiskAssessmentService.getById(recordId)

    next()
  } catch (error) {
    next(error)
  }
}

module.exports = {
  setFramework,
  setFrameworkSection,
  setAssessment,
}
