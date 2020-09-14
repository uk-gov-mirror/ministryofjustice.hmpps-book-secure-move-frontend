const heldSeparatelyAlerts = `<div class="app-panel govuk-!-margin-bottom-0" id="escape">
<dl class="app-meta-list app-meta-list--divider govuk-!-font-size-16">
  <div class="app-meta-list__item ">
    <dd class="app-meta-list__value">
      <div>
        <h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">Risk to certain ethnic groups</h4>
        <span class="">Arrested for verbally abusing ethnic groups</span>
        <div class="app-secondary-text-colour govuk-!-margin-top-2 govuk-!-font-size-14">
          Alert created on Tuesday 16 Jun 2020
        </div>
      </div>
    </dd>
  </div>
  <div class="app-meta-list__item ">
    <dd class="app-meta-list__value">
      <div>
        <h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">Risk to lesbian/gay/bisexual people</h4>
        <span class="">Charged with verbal assault to lesbian/gay/bisexual people</span>
        <div class="app-secondary-text-colour govuk-!-margin-top-2 govuk-!-font-size-14">
          Alert created on Friday 27 Apr 2018
        </div>
      </div>
    </dd>
  </div>
</dl>
</div>`

module.exports = [
  {
    key: 'violent-or-dangerous',
    html: `<div class="app-panel govuk-!-margin-bottom-0" id="violent">
  <dl class="app-meta-list app-meta-list--divider govuk-!-font-size-16">
    <div class="app-meta-list__item ">
      <dd class="app-meta-list__value">
        <div>
          <h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">Staff Assaulter</h4>
          <span class="">Verbally abused staff and spat in their face</span>
          <div class="app-secondary-text-colour govuk-!-margin-top-2 govuk-!-font-size-14">
            Alert created on Thursday 8 Aug 2019
          </div>
        </div>
      </dd>
    </div>
    <div class="app-meta-list__item ">
      <dd class="app-meta-list__value">
        <div>
          <h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">Domestic Violence Perpetrator</h4>
          <span class="">Absued spouse</span>
          <div class="app-secondary-text-colour govuk-!-margin-top-2 govuk-!-font-size-14">
            Alert created on Thursday 8 Dec 2019
          </div>
        </div>
      </dd>
    </div>
  </dl>
</div>`,
  },
  {
    key: 'escape-risk',
    html: `<div class="app-panel govuk-!-margin-bottom-0" id="escape">
    <dl class="app-meta-list app-meta-list--divider govuk-!-font-size-16">
      <div class="app-meta-list__item ">
        <dd class="app-meta-list__value">
          <div>
            <h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">Climber</h4>
            <span class="">Took a climbing course</span>
            <div class="app-secondary-text-colour govuk-!-margin-top-2 govuk-!-font-size-14">
              Alert created on Monday 8 Feb 2001
            </div>
          </div>
        </dd>
      </div>
    </dl>
  </div>`,
  },
  {
    key: 'high-public-interest',
    html: undefined,
  },
  {
    key: 'gang-member-or-organised-crime',
    html: undefined,
  },
  {
    key: 'stalker-harasser-or-intimidator',
    html: undefined,
  },
  {
    key: 'held-separately',
    html: heldSeparatelyAlerts,
  },
  {
    key: 'risk-to-other-people',
    html: heldSeparatelyAlerts,
  },
  {
    key: 'requires-special-vehicle',
    html: `
    <div class="app-panel govuk-!-margin-bottom-0" id="special-vehicle">
      <dl class="app-meta-list app-meta-list--divider govuk-!-font-size-16">
        <div class="app-meta-list__item ">
          <dd class="app-meta-list__value">
            <div>
              <h4 class="govuk-!-margin-top-0 govuk-!-margin-bottom-2">False Limbs</h4>
              <span class="">Has a false left hand</span>
              <div class="app-secondary-text-colour govuk-!-margin-top-2 govuk-!-font-size-14">
                Personal care need created on Monday 16 June 2016
              </div>
            </div>
          </dd>
        </div>
      </dl>
    </div>
  `,
  },
]
