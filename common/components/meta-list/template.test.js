const { render, getExamples } = require('../../../test/unit/component-helpers')

const examples = getExamples('meta-list')

describe('Meta list component', function () {
  context('default', function () {
    let $, $component, $items

    beforeEach(function () {
      $ = render('meta-list', examples.default)
      $component = $('.app-meta-list')
      $items = $component.find('.app-meta-list__item')
    })

    it('should render', function () {
      expect($component.length).to.equal(1)
    })

    it('should render correct number of items', function () {
      expect($items.length).to.equal(2)
    })
  })

  context('with classes', function () {
    it('should render classes', function () {
      const $ = render('meta-list', {
        classes: 'app-meta-list--custom-class',
      })

      const $component = $('.app-meta-list')
      expect($component.hasClass('app-meta-list--custom-class')).to.be.true
    })
  })

  context('items with text', function () {
    let $, $items

    beforeEach(function () {
      $ = render('meta-list', {
        items: [
          {
            key: {
              text: 'From',
            },
            value: {
              text: 'Home',
            },
          },
          {
            key: {
              text: '<span>To</span>',
            },
            value: {
              text: '<em>Work</em>',
            },
          },
        ],
      })
      $items = $('.app-meta-list').find('.app-meta-list__item')
    })

    it('should render text', function () {
      const $item1 = $($items[0])
      const $key = $item1.find('.app-meta-list__key')
      const $value = $item1.find('.app-meta-list__value')

      expect($key.html().trim()).to.equal('From')
      expect($value.html().trim()).to.equal('Home')
    })

    it('should escape HTML', function () {
      const $item2 = $($items[1])
      const $key = $item2.find('.app-meta-list__key')
      const $value = $item2.find('.app-meta-list__value')

      expect($key.html().trim()).to.equal('&lt;span&gt;To&lt;/span&gt;')
      expect($value.html().trim()).to.equal('&lt;em&gt;Work&lt;/em&gt;')
    })
  })

  context('items with html', function () {
    let $, $items

    beforeEach(function () {
      $ = render('meta-list', {
        items: [
          {
            key: {
              html: '<span>To</span>',
            },
            value: {
              html: '<em>Work</em>',
            },
          },
        ],
      })
      $items = $('.app-meta-list').find('.app-meta-list__item')
    })

    it('should render HTML', function () {
      const $item1 = $($items[0])
      const $key = $item1.find('.app-meta-list__key')
      const $value = $item1.find('.app-meta-list__value')

      expect($key.html().trim()).to.equal('<span>To</span>')
      expect($value.html().trim()).to.equal('<em>Work</em>')
    })
  })
})
