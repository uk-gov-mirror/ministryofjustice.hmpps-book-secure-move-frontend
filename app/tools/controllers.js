const faker = require('faker')
const { uniq } = require('lodash')

const { permissionsByRole } = require('../../common/lib/permissions')

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

async function createPER(req, res, next) {
  try {
    const assessmentId = req.params.assessmentId
    const type = req.params.type
    let assessment

    if (type === 'person-escort-record') {
      assessment = await req.services.personEscortRecord.getById(assessmentId)
    } else if (type === 'youth-risk-assessment') {
      assessment = await req.services.youthRiskAssessment.getById(assessmentId)
    }

    const responses = assessment.responses.map(response => {
      const options = response.question.options
      let value

      if (response.value_type === 'string') {
        if (options.length > 0) {
          value = options.includes('No')
            ? 'No'
            : faker.random.arrayElement(options)
        } else {
          value = faker.lorem.sentence()
        }
      }

      if (response.value_type === 'array') {
        value = [faker.random.arrayElement(options)]
      }

      if (response.value_type === 'object::followup_comment') {
        value = {
          option: faker.random.arrayElement(options),
          details: faker.lorem.sentence(),
        }
      }

      if (response.value_type === 'collection::followup_comment') {
        value = options.map(option => {
          return {
            option,
            details: faker.lorem.sentence(),
          }
        })
      }

      return {
        value,
        id: response.id,
      }
    })

    if (type === 'person-escort-record') {
      await req.services.personEscortRecord.respond(assessment.id, responses)
    } else if (type === 'youth-risk-assessment') {
      await req.services.youthRiskAssessment.respond(assessment.id, responses)
    }

    res.redirect(`/move/${assessment.move.id}`)
  } catch (error) {
    next(error)
  }
}

module.exports = {
  renderPermissions,
  updatePermissions,
  createPER,
}
