const { sortBy } = require('lodash')
const proxyquire = require('proxyquire').noCallThru()

const controllers = require('./controllers')

const mockUserLocations = [
  {
    id: '2c952ca0-f750-4ac3-ac76-fb631445f974',
    title: 'D location',
  },
  {
    id: '9b56ca31-222b-4522-9d65-4ef429f9081e',
    title: 'b location',
  },
  {
    id: 'd8e9cf86-55cd-4412-83b7-3562b7d1f8b6',
    title: 'A location',
  },
  {
    id: '10923762-bc17-4ea1-bae3-68ea709ee23e',
    title: 'C location',
    disabled_at: '123',
  },
]
const mockSupplierLocations = [
  ...mockUserLocations,
  {
    id: '70923762-bc17-4ea1-bae3-4ef429f9081e',
    title: 'a location',
  },
]

const mockSecondSupplierLocation = [
  {
    id: '0987654-bc17-4ea1-bae3-4ef429f9081e',
    title: 'b location',
  },
  {
    id: '70923762-bc17-4ea1-bae3-4ef429f9081e',
    title: 'A location',
  },
]

const mockSuppliers = [
  {
    id: 'b95bfb7c-18cd-419d-8119-2dee1506726f',
    name: 'GEOAmey',
  },
  {
    id: '35660b02-243f-4df2-9337-e3ec49b6d70d',
    name: 'Serco',
  },
]

describe('Locations controllers', function () {
  let req, res
  const mockReferenceData = {
    getRegions: sinon.fake.returns(Promise.resolve([])),
    getLocationsBySupplierId: sinon.stub().resolves(mockSupplierLocations),
    getSuppliers: sinon.stub().resolves(mockSuppliers),
  }
  const proxiedController = proxyquire('./controllers', {})
  let nextSpy

  describe('#locations', function () {
    beforeEach(function () {
      req = {
        session: {
          user: {
            permissions: [],
          },
        },
        userLocations: mockUserLocations,
        services: {
          referenceData: mockReferenceData,
        },
      }
      res = {
        render: sinon.spy(),
      }
      nextSpy = sinon.spy()
    })

    context(
      'when the user is assigned a `allocation:create` permission',
      function () {
        beforeEach(function () {
          req.session.user.permissions = ['allocation:create']
        })

        context('when the region API is available', function () {
          it('should retrieve all regions', async function () {
            mockReferenceData.getRegions = sinon.fake.returns(
              Promise.resolve([])
            )
            await proxiedController.locations(req, res, nextSpy)
            expect(res.render).to.be.calledOnce
          })
        })

        context('when the region API is *not* available', function () {
          it('should fail gracefully', async function () {
            req.services.referenceData.getRegions = sinon.fake.returns(
              Promise.reject(new Error())
            )
            await proxiedController.locations(req, res, nextSpy)
            expect(nextSpy).to.be.calledOnce
          })
        })
      }
    )

    context(
      'when the user is not assigned a `allocation:create` permission',
      function () {
        it('should render template', function () {
          controllers.locations(req, res)
          expect(res.render).to.be.calledOnce
        })

        it('should return locations sorted by title', function () {
          controllers.locations(req, res)
          const params = res.render.args[0][1]
          expect(params).to.have.property('activeLocations')
          expect(params.activeLocations).to.deep.equal(
            sortBy(
              mockUserLocations.filter(l => l.disabled_at === null),
              location => {
                return location?.title?.toLowerCase()
              }
            )
          )
          expect(params).to.have.property('inactiveLocations')
          expect(params.inactiveLocations).to.deep.equal(
            sortBy(
              mockUserLocations.filter(l => l.disabled_at !== null),
              location => {
                return location?.title?.toLowerCase()
              }
            )
          )
        })
      }
    )

    context('when the user is a supplier', function () {
      beforeEach(async function () {
        mockReferenceData.getLocationsBySupplierId = sinon
          .stub()
          .resolves(mockSupplierLocations)
        req.session.user.supplierId = 'aussiemanandvan'
        await proxiedController.locations(req, res)
      })
      it('should fetch user locations', async function () {
        expect(
          mockReferenceData.getLocationsBySupplierId
        ).to.be.calledOnceWithExactly('aussiemanandvan')
      })
      it('should render template', function () {
        expect(res.render).to.be.calledOnce
      })

      it('should return locations sorted by title', function () {
        const params = res.render.args[0][1]
        expect(params).to.have.property('activeLocations')
        expect(params.activeLocations).to.deep.equal(
          sortBy(
            mockSupplierLocations.filter(l => l.disabled_at === null),
            location => {
              return location?.title?.toLowerCase()
            }
          )
        )
        expect(params).to.have.property('inactiveLocations')
        expect(params.inactiveLocations).to.deep.equal(
          sortBy(
            mockSupplierLocations.filter(l => l.disabled_at !== null),
            location => {
              return location?.title?.toLowerCase()
            }
          )
        )
      })

      it('should set the location on the user session', function () {
        expect(req.session.user.locations).to.deep.equal(mockSupplierLocations)
      })
    })

    context('when the user is a Contract Delivery Manager', function () {
      beforeEach(async function () {
        req.session.user.permissions = ['locations:contract_delivery_manager']
        mockReferenceData.getSuppliers = sinon.stub().resolves(mockSuppliers)
        mockReferenceData.getLocationsBySupplierId = sinon
          .stub()
          .onFirstCall()
          .returns(mockSupplierLocations)
          .onSecondCall()
          .returns(mockSecondSupplierLocation)
        await proxiedController.locations(req, res)
      })
      it('should fetch locations for each supplier', async function () {
        expect(mockReferenceData.getLocationsBySupplierId).to.be.calledTwice
      })
      it('should render template', function () {
        expect(res.render).to.be.calledOnce
      })

      it('should set the location on the user session', function () {
        // The second location in the mockSecondSupplierLocation array
        // is a duplicate, so should not be included
        expect(req.session.user.locations).to.deep.equal(
          mockSupplierLocations.concat(mockSecondSupplierLocation[0])
        )
      })
    })
  })
})
