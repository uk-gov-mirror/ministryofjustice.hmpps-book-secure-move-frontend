const presenters = require('../../presenters')

function frameworkOverview(req, res) {
  const { originalUrl, personEscortRecord = {}, move } = req
  const moveId = move?.id
  const profile = move?.profile || personEscortRecord?.profile
  const fullname = profile?.person?.fullname
  const taskList = presenters.frameworkToTaskListComponent({
    baseUrl: `${originalUrl}/`,
    frameworkSections: personEscortRecord._framework?.sections,
    sectionProgress: personEscortRecord?.meta?.section_progress,
  })

  res.render('framework-overview', {
    moveId,
    taskList,
    fullname,
  })
}

module.exports = frameworkOverview
