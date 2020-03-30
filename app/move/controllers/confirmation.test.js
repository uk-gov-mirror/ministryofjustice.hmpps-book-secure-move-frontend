const controller = require('./confirmation')

const mockMove = {
  move_type: 'court_appearance',
  to_location: {
    title: 'Axminster Crown Court',
  },
}

describe('Move controllers', function() {
  describe('#confirmation()', function() {
    let req, res

    beforeEach(function() {
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

      it('should render confirmation template', function() {
        const template = res.render.args[0][0]

        expect(res.render.calledOnce).to.be.true
        expect(template).to.equal('move/views/confirmation')
      })

      it('should use to location title as location', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('location')
        expect(params.location).to.equal(mockMove.to_location.title)
      })

      it('should use supplier fallback as supplier name', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('supplierName')
        expect(params.supplierName).to.equal('supplier_fallback')
      })

      it('should translate supplier fallback key', function() {
        expect(req.t).to.have.been.calledOnceWithExactly('supplier_fallback')
      })
    })

    describe('with move_type "prison_recall"', function() {
      beforeEach(function() {
        res.locals.move = {
          ...mockMove,
          move_type: 'prison_recall',
        }

        controller(req, res)
      })

      it('should use translation key as location', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('location')
        expect(params.location).to.equal(
          'fields::move_type.items.prison_recall.label'
        )
        expect(req.t.secondCall).to.have.been.calledWithExactly(
          'fields::move_type.items.prison_recall.label'
        )
      })
    })

    describe('with empty supplier', function() {
      beforeEach(function() {
        res.locals.move = {
          ...mockMove,
          from_location: {
            suppliers: [],
          },
        }

        controller(req, res)
      })

      it('should use supplier fallback as supplier name', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('supplierName')
        expect(params.supplierName).to.equal('supplier_fallback')
      })

      it('should translate supplier fallback key', function() {
        expect(req.t).to.have.been.calledOnceWithExactly('supplier_fallback')
      })
    })

    describe('with one supplier', function() {
      beforeEach(function() {
        res.locals.move = {
          ...mockMove,
          from_location: {
            suppliers: [
              {
                name: 'Supplier one',
              },
            ],
          },
        }

        controller(req, res)
      })

      it('should use first supplier name as supplier param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('supplierName')
        expect(params.supplierName).to.equal('Supplier one')
      })
    })

    describe('with multiple suppliers', function() {
      beforeEach(function() {
        res.locals.move = {
          ...mockMove,
          from_location: {
            suppliers: [
              {
                name: 'Supplier one',
              },
              {
                name: 'Supplier two',
              },
            ],
          },
        }

        controller(req, res)
      })

      it('should join supplier names as supplier param', function() {
        const params = res.render.args[0][1]
        expect(params).to.have.property('supplierName')
        expect(params.supplierName).to.equal('Supplier one and Supplier two')
      })
    })
  })
})
