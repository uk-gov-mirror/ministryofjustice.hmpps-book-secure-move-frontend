const presenters = require('../../../common/presenters')

function frameworkOverview(req, res) {
  const { originalUrl, framework, youthRiskAssessment = {}, move } = req
  const moveId = move?.id
  const profile = move?.profile || youthRiskAssessment?.profile
  const fullname = profile?.person?.fullname
  const taskList = presenters.frameworkToTaskListComponent({
    baseUrl: `${originalUrl}/`,
    frameworkSections: framework.sections,
    sectionProgress: youthRiskAssessment?.meta?.section_progress,
  })

  res.render('person-escort-record/views/framework-overview', {
    moveId,
    taskList,
    fullname,
  })
}

module.exports = frameworkOverview
