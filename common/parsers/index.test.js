const { expect } = require('chai')

const parse = require('./index')

const getExpectedDate = (
  year = new Date().getFullYear(),
  value = '10 March'
) => {
  const expectedDate = new Date(`${value} ${year}`)
  expectedDate.setHours(12)
  return expectedDate
}

const marchCurrentYear = getExpectedDate()
const octoberCurrentYear = getExpectedDate(undefined, '3 October')
const march2019 = getExpectedDate(2019)
const october2019 = getExpectedDate(2019, '3 October')
const currentYear = new Date(2020, 5, 1)
let clock

describe('Parsers', function () {
  describe('#date', function () {
    beforeEach(function () {
      clock = sinon.useFakeTimers({
        now: currentYear,
      })
    })

    afterEach(function () {
      clock.restore()
    })

    context('When passed non-string value', function () {
      it('should return undefined values as is', function () {
        expect(parse.date(undefined)).to.be.undefined
      })

      it('should return date values as is', function () {
        const d = new Date()
        expect(parse.date(d)).to.eql(d)
      })
    })

    context('When passed a valid en_GB format', function () {
      it('should treat dd/MM/yyyy dates as en_GB', function () {
        expect(parse.date('10/3/2019')).to.eql(march2019)
        expect(parse.date('10/03/2019')).to.eql(march2019)
        expect(parse.date('3/10/2019')).to.eql(october2019)
      })

      it('should treat dd/MM dates as en_GB', function () {
        expect(parse.date('10/3')).to.eql(marchCurrentYear)
        expect(parse.date('10/03')).to.eql(marchCurrentYear)
        expect(parse.date('3/10')).to.eql(octoberCurrentYear)
      })

      it('should treat dd-MM-yyyy dates as en_GB', function () {
        expect(parse.date('10-3-2019')).to.eql(march2019)
      })

      it('should treat dd-MM dates as en_GB', function () {
        expect(parse.date('10-3')).to.eql(marchCurrentYear)
      })
    })

    context('When passed an invalid en_GB format', function () {
      it('should not treat dd-MM dates as en_GB', function () {
        expect(parse.date('10-3-19')).to.be.null
      })
    })

    context('When passed an ISO-style format', function () {
      it('should treat date as ISO', function () {
        expect(parse.date('2019-3-10')).to.eql(march2019)
        expect(parse.date('2019-03-10')).to.eql(march2019)
      })
    })

    context('When passed an dd MMM format', function () {
      it('should treat date as dd MMM', function () {
        expect(parse.date('10 Mar')).to.eql(marchCurrentYear)
        expect(parse.date('10 March')).to.eql(marchCurrentYear)
        expect(parse.date('Mar 10')).to.eql(marchCurrentYear)
        expect(parse.date('March 10th')).to.eql(marchCurrentYear)
      })
    })
  })
})
