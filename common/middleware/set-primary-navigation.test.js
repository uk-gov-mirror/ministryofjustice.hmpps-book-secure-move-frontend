const proxyquire = require('proxyquire')

const mockConfig = {
  FEATURE_FLAGS: {},
}

const middleware = proxyquire('./set-primary-navigation', {
  '../../config': mockConfig,
})

describe('#setPrimaryNavigation()', function () {
  let req, res, nextSpy

  beforeEach(function () {
    nextSpy = sinon.spy()
    req = {
      canAccess: sinon.stub().returns(false),
      path: '',
      t: sinon.stub().returnsArg(0),
    }
    res = {
      locals: {},
    }
  })

  context('with no permissions', function () {
    beforeEach(function () {
      middleware(req, res, nextSpy)
    })

    it('should set navigation to empty array', function () {
      expect(res.locals.primaryNavigation).to.deep.equal([])
    })

    it('should call next', function () {
      expect(nextSpy).to.be.calledOnceWithExactly()
    })
  })

  context('with all permissions', function () {
    beforeEach(function () {
      req.canAccess.returns(true)
    })

    describe('navigation items', function () {
      beforeEach(function () {
        mockConfig.FEATURE_FLAGS.POPULATION_DASHBOARD = false
        middleware(req, res, nextSpy)
      })

      it('should set items correctly', function () {
        expect(res.locals.primaryNavigation).to.deep.equal([
          {
            active: false,
            href: '/',
            text: 'primary_navigation.home',
          },
          {
            active: false,
            href: '/moves/outgoing',
            text: 'primary_navigation.outgoing',
          },
          {
            active: false,
            href: '/moves/incoming',
            text: 'primary_navigation.incoming',
          },
          {
            active: false,
            href: '/moves/requested',
            text: 'primary_navigation.single_requests',
          },
          {
            active: false,
            href: '/allocations',
            text: 'primary_navigation.allocations',
          },
        ])
      })
    })

    describe('active state', function () {
      context('on home page', function () {
        beforeEach(function () {
          req.path = '/'
          middleware(req, res, nextSpy)
        })

        it('should only set one active state', function () {
          const inactive = res.locals.primaryNavigation.filter(
            item => !item.active
          )
          expect(inactive).to.have.length(
            res.locals.primaryNavigation.length - 1
          )
        })

        it('should set correct active state', function () {
          const active = res.locals.primaryNavigation.filter(
            item => item.active
          )
          expect(active).to.deep.equal([
            {
              active: true,
              href: '/',
              text: 'primary_navigation.home',
            },
          ])
        })
      })

      context('on requested page', function () {
        beforeEach(function () {
          req.path = '/moves/day/2020-04-16/requested'
          middleware(req, res, nextSpy)
        })

        it('should only set one active state', function () {
          const inactive = res.locals.primaryNavigation.filter(
            item => !item.active
          )
          expect(inactive).to.have.length(
            res.locals.primaryNavigation.length - 1
          )
        })

        it('should set correct active state', function () {
          const active = res.locals.primaryNavigation.filter(
            item => item.active
          )
          expect(active).to.deep.equal([
            {
              active: true,
              href: '/moves/requested',
              text: 'primary_navigation.single_requests',
            },
          ])
        })
      })

      context('on allocations page', function () {
        beforeEach(function () {
          req.path = '/allocations/week/2020-04-16/outgoing'
          middleware(req, res, nextSpy)
        })

        it('should only set one active state', function () {
          const inactive = res.locals.primaryNavigation.filter(
            item => !item.active
          )
          expect(inactive).to.have.length(
            res.locals.primaryNavigation.length - 1
          )
        })

        it('should set correct active state', function () {
          const active = res.locals.primaryNavigation.filter(
            item => item.active
          )
          expect(active).to.deep.equal([
            {
              active: true,
              href: '/allocations',
              text: 'primary_navigation.allocations',
            },
          ])
        })
      })

      context('on outgoing page', function () {
        beforeEach(function () {
          req.path = '/moves/day/2020-04-16/outgoing'
          middleware(req, res, nextSpy)
        })

        it('should only set one active state', function () {
          const inactive = res.locals.primaryNavigation.filter(
            item => !item.active
          )
          expect(inactive).to.have.length(
            res.locals.primaryNavigation.length - 1
          )
        })

        it('should set correct active state', function () {
          const active = res.locals.primaryNavigation.filter(
            item => item.active
          )
          expect(active).to.deep.equal([
            {
              active: true,
              href: '/moves/outgoing',
              text: 'primary_navigation.outgoing',
            },
          ])
        })
      })

      context('on incoming page', function () {
        beforeEach(function () {
          req.path = '/moves/day/2020-04-16/incoming'
          middleware(req, res, nextSpy)
        })

        it('should only set one active state', function () {
          const inactive = res.locals.primaryNavigation.filter(
            item => !item.active
          )
          expect(inactive).to.have.length(
            res.locals.primaryNavigation.length - 1
          )
        })

        it('should set correct active state', function () {
          const active = res.locals.primaryNavigation.filter(
            item => item.active
          )
          expect(active).to.deep.equal([
            {
              active: true,
              href: '/moves/incoming',
              text: 'primary_navigation.incoming',
            },
          ])
        })
      })
    })

    it('should call next', function () {
      middleware(req, res, nextSpy)
      expect(nextSpy).to.be.calledOnceWithExactly()
    })
  })

  describe('permissions', function () {
    beforeEach(function () {
      mockConfig.FEATURE_FLAGS.POPULATION_DASHBOARD = false
      req.canAccess.returns(true)
      middleware(req, res, nextSpy)
    })

    it('should check for dashboard permission', function () {
      expect(req.canAccess).to.be.calledWithExactly('dashboard:view')
    })

    it('should check for single request permission', function () {
      expect(req.canAccess).to.be.calledWithExactly('moves:view:proposed')
    })

    it('should check for allocation permission', function () {
      expect(req.canAccess).to.be.calledWithExactly('allocations:view')
    })

    it('should check for outgoing moves permission', function () {
      expect(req.canAccess).to.be.calledWithExactly('moves:view:outgoing')
    })

    it('should check for incoming moves permission', function () {
      expect(req.canAccess).to.be.calledWithExactly('moves:view:incoming')
    })

    it('should check for population permission', function () {
      expect(req.canAccess).to.be.calledWithExactly('dashboard:view:population')
    })

    it('should check for permissions correct number of times', function () {
      expect(req.canAccess.callCount).to.equal(6)
    })
  })

  describe('feature flags', function () {
    context('with no feature flags used', function () {
      it('should')
    })
    context('with feature flag enabled', function () {
      beforeEach(function () {
        mockConfig.FEATURE_FLAGS.POPULATION_DASHBOARD = true
        req.canAccess.returns(true)
        middleware(req, res, nextSpy)
      })

      it('should have the correct number of menu options', function () {
        expect(res.locals.primaryNavigation.length).to.equal(6)
      })

      it('should include flagged menu options', function () {
        expect(res.locals.primaryNavigation).to.deep.include({
          text: req.t('primary_navigation.population'),
          href: '/population',
          active: req.path.startsWith('/population'),
        })
      })
    })
    context('with feature flag disabled', function () {
      beforeEach(function () {
        mockConfig.FEATURE_FLAGS.POPULATION_DASHBOARD = false
        req.canAccess.returns(true)
        middleware(req, res, nextSpy)
      })

      it('should have the correct number of menu options', function () {
        expect(res.locals.primaryNavigation.length).to.equal(5)
      })

      it('should include flagged menu options', function () {
        expect(res.locals.primaryNavigation).to.not.deep.include({
          text: req.t('primary_navigation.population'),
          href: '/population',
          active: req.path.startsWith('/population'),
        })
      })
    })
  })
})
