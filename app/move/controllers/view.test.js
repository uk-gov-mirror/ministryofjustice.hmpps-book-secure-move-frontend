const presenters = require('../../../common/presenters')

const controller = require('./view')

const mockMove = {
  status: 'requested',
  person: {
    assessment_answers: [],
  },
  documents: [],
}

describe('Move controllers', function() {
  describe('#view()', function() {
    let req, res

    beforeEach(function() {
      sinon.stub(presenters, 'moveToMetaListComponent').returnsArg(0)
      sinon.stub(presenters, 'personToSummaryListComponent').returnsArg(0)
      sinon.stub(presenters, 'assessmentToTagList').returnsArg(0)
      sinon.stub(presenters, 'assessmentByCategory').returnsArg(0)
      sinon.stub(presenters, 'assessmentToSummaryListComponent').returnsArg(0)

      req = {
        t: sinon.stub().returnsArg(0),
      }
      res = {
        render: sinon.spy(),
        locals: {
          move: mockMove,
        },
      }
    })

    context('by default', function() {
      beforeEach(function() {
        controller(req, res)
      })

      it('should render a template', function() {
        expect(res.render.calledOnce).to.be.true
      })

      it('should call moveToMetaListComponent presenter with correct args', function() {
        expect(presenters.moveToMetaListComponent).to.be.calledOnceWithExactly(
          mockMove
        )
      })

      it('should contain a move summary param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('moveSummary')
        expect(params.moveSummary).to.equal(mockMove)
      })

      it('should call personToSummaryListComponent presenter with correct args', function() {
        expect(
          presenters.personToSummaryListComponent
        ).to.be.calledOnceWithExactly(mockMove.person)
      })

      it('should contain personal details summary param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('personalDetailsSummary')
        expect(params.personalDetailsSummary).to.equal(mockMove.person)
      })

      it('should call assessmentToTagList presenter with correct args', function() {
        expect(presenters.assessmentToTagList).to.be.calledOnceWithExactly(
          mockMove.person.assessment_answers
        )
      })

      it('should contain tag list param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('tagList')
        expect(params.tagList).to.equal(mockMove.person.assessment_answers)
      })

      it('should call assessmentByCategory presenter with correct args', function() {
        expect(presenters.assessmentByCategory).to.be.calledOnceWithExactly(
          mockMove.person.assessment_answers
        )
      })

      it('should contain assessment param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('assessment')
        expect(params.assessment).to.equal(mockMove.person.assessment_answers)
      })

      it('should call assessmentToSummaryListComponent presenter with correct args', function() {
        expect(
          presenters.assessmentToSummaryListComponent
        ).to.be.calledOnceWithExactly(
          mockMove.person.assessment_answers,
          'court'
        )
      })

      it('should contain court summary param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('courtSummary')
        expect(params.courtSummary).to.equal(mockMove.person.assessment_answers)
      })

      it('should contain message title param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('messageTitle')
        expect(params.messageTitle).to.equal('statuses::requested')
      })

      it('should contain message content param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('messageContent')
        expect(params.messageContent).to.equal('statuses::description')
      })
    })

    context('when move is cancelled', function() {
      let params

      beforeEach(function() {
        res.locals.move = {
          ...mockMove,
          status: 'cancelled',
          cancellation_reason: 'made_in_error',
        }
      })

      context('when cancellation reason is not "other"', function() {
        beforeEach(function() {
          req.t.returns('__translated__')

          controller(req, res)
          params = res.render.args[0][1]
        })

        it('should contain a message title param', function() {
          expect(params).to.have.property('messageTitle')
        })

        it('should contain a message content param', function() {
          expect(params).to.have.property('messageContent')
          expect(params.messageContent).to.equal('statuses::description')
        })

        it('should call correct translation', function() {
          expect(req.t.thirdCall).to.be.calledWithExactly(
            'statuses::description',
            {
              context: 'cancelled',
              reason: 'fields::cancellation_reason.items.made_in_error.label',
            }
          )
        })
      })

      context('when cancellation reason is "other"', function() {
        beforeEach(function() {
          res.locals.move = {
            ...mockMove,
            status: 'cancelled',
            cancellation_reason: 'other',
            cancellation_reason_comments: 'Another reason for cancelling',
          }

          controller(req, res)
          params = res.render.args[0][1]
        })

        it('should contain a message title param', function() {
          expect(params).to.have.property('messageTitle')
        })

        it('should contain a message content param', function() {
          expect(params).to.have.property('messageContent')
          expect(params.messageContent).to.equal('statuses::description')
        })
      })
    })
  })
})
