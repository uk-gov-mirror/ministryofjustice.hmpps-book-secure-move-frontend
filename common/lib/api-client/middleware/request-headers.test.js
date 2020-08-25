const proxyquire = require('proxyquire')

const getRequestHeadersStub = sinon
  .stub()
  .returns({ mockHeader: 'header value' })

const middleware = proxyquire('./request-headers', {
  '../request-headers': getRequestHeadersStub,
})

describe('API Client', function () {
  describe('Request headers middleware', function () {
    describe('#req-headers', function () {
      context('when payload does not include a request', function () {
        it('should return default payload', function () {
          expect(middleware.req()).to.deep.equal({})
        })
      })

      context('when payload contains a request', function () {
        let request

        beforeEach(function () {
          request = {
            headers: {
              Accept: 'Something',
            },
          }
          middleware.req({ req: request })
        })

        it('should get the request headers', function () {
          expect(getRequestHeadersStub).to.be.calledOnceWithExactly()
        })

        it('should add the default request headers', function () {
          expect(request.headers).to.deep.equal({
            Accept: 'Something',
            mockHeader: 'header value',
          })
        })
      })
    })
  })
})
