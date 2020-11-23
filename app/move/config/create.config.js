const CreateBaseController = require('../controllers/create/base')

module.exports = {
  controller: CreateBaseController,
  journeyName: 'create-a-move',
  journeyPageTitle: 'actions::create_move',
  name: 'create-a-move',
  template: '../../../form-wizard',
  templatePath: 'move/views/create/',
}
