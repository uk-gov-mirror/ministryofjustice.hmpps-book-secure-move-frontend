const { cloneDeep } = require('lodash')

const transformResource = require('./transform-resource')

describe('API Client', function () {
  describe('Transformers', function () {
    describe('#transformResource', function () {
      let output, _this, item, included

      beforeEach(function () {
        _this = {
          models: {
            book: {
              options: {},
            },
          },
          pluralize: {
            singular: sinon.stub().returnsArg(0),
          },
          deserialize: {
            cache: {
              clear: sinon.stub(),
              set: sinon.stub().returnsArg(1),
            },
            resource: sinon.stub().returnsArg(0),
          },
        }
        included = []
        item = {
          id: '12345',
          type: 'book',
          foo: 'bar',
        }
      })

      context('without transformer', function () {
        beforeEach(function () {
          output = transformResource().call(_this, item, included)
        })

        it('should not transform output', function () {
          expect(output).to.deep.equal({
            id: '12345',
            type: 'book',
            foo: 'bar',
          })
        })

        it('should call original deserializer', function () {
          expect(_this.deserialize.resource).to.be.calledOnceWithExactly(
            item,
            included
          )
        })

        it('should not adjust cache', function () {
          expect(_this.deserialize.cache.clear).not.to.be.called
          expect(_this.deserialize.cache.set).not.to.be.called
        })
      })

      context('with transformer', function () {
        let transformer

        beforeEach(function () {
          transformer = sinon.stub().returns({
            ...item,
            _fizz: 'buzz',
          })

          _this.models.book.options.deserializer = transformer

          output = transformResource(transformer).call(_this, item, included)
        })

        it('should call transformer', function () {
          expect(transformer).to.have.been.calledWithExactly(item)
        })

        it('should return transformed resource', function () {
          expect(output).to.deep.equal({
            id: '12345',
            type: 'book',
            foo: 'bar',
            _fizz: 'buzz',
          })
        })

        it('should not mutate original item', function () {
          expect(item).to.deep.equal({
            id: '12345',
            type: 'book',
            foo: 'bar',
          })
        })

        it('should deserialize model', function () {
          expect(_this.deserialize.resource).to.have.been.calledWithExactly(
            item,
            included
          )
        })

        it('should adjust devour cache', function () {
          expect(_this.deserialize.cache.clear).to.have.been.calledWithExactly()
          expect(_this.deserialize.cache.set).to.have.been.calledWithExactly(
            'book',
            '12345',
            {
              id: '12345',
              type: 'book',
              foo: 'bar',
              _fizz: 'buzz',
            }
          )
        })

        it.skip('should delete model deserializer', function () {
          const _that = cloneDeep(_this)
          delete _that.models.book.options.deserializer

          expect(_this.deserialize.resource).to.have.been.calledOn(_that)
        })
      })
    })
  })
})
