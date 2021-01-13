const { subMinutes, formatISO } = require('date-fns')

const moveHelpers = require('../../../common/helpers/move')
const presenters = require('../../../common/presenters')

module.exports = function view(req, res) {
  const { move = {} } = req

  const timeline = presenters.moveToTimelineComponent(move)

  if (move.profile?.person_escort_record?.status === 'confirmed') {
    timeline.items.unshift({
      byline: {
        html: '',
      },
      datetime: {
        timestamp: formatISO(subMinutes(new Date(), 5)),
        type: 'datetime',
      },
      html: `Person was handed over to John Smith (A18726) from ${move.supplier.name} by Andrew Jones (YAK817)`,
      label: {
        html: 'Handover completed',
      },
    })
  }

  const locals = {
    ...moveHelpers.getLocals(req),
    timeline,
    urls: {
      tabs: moveHelpers.getTabsUrls(move),
    },
  }

  res.render('move/views/timeline', locals)
}
