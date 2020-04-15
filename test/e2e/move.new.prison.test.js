import { Selector } from 'testcafe'

import { FEATURE_FLAGS } from '../../config'
import { newMove } from './_routes'
import { ocaUser, prisonUser } from './_roles'
import { createPersonFixture } from './_helpers'
import { page, moveDetailPage, createMovePage } from './pages'

fixture('New move from Prison to Court').beforeEach(async t => {
  await t.useRole(prisonUser).navigateTo(newMove)
})

test('With unfound person', async t => {
  const searchTerm = 'UNKNOWN_PRISONER'

  // PNC lookup
  await createMovePage.fillInPrisonNumberSearch(searchTerm)
  await page.submitForm()

  // PNC lookup results
  await createMovePage.checkPersonLookupResults(0, searchTerm)

  await t.expect(page.nodes.submitButton.exists).notOk()

  await t
    .expect(
      createMovePage.steps.personLookupResults.nodes.searchAgainLink.exists
    )
    .ok()

  await t.click(createMovePage.steps.personLookupResults.nodes.searchAgainLink)

  await t
    .expect(page.getCurrentUrl())
    .contains('/move/new/person-lookup-prison-number')
})

test('With existing person', async t => {
  const personalDetails = await createPersonFixture()

  // PNC lookup
  await createMovePage.fillInPrisonNumberSearch(personalDetails.prisonNumber)
  await page.submitForm()

  // PNC lookup results
  await createMovePage.checkPersonLookupResults(1, personalDetails.prisonNumber)
  await createMovePage.selectSearchResults(personalDetails.fullname)
  await page.submitForm()

  // Move details
  const moveDetails = await createMovePage.fillInMoveDetails('Court')
  await page.submitForm()

  // Move date
  await createMovePage.fillInDate()
  await page.submitForm()

  // Court information
  // TODO: Remove this logic when we release the journey to all users
  let courtHearings, courtInformation
  if (FEATURE_FLAGS.PRISON_COURT_HEARINGS) {
    courtHearings = await createMovePage.fillInCourtHearings()
  } else {
    courtInformation = await createMovePage.fillInCourtInformation()
  }
  await page.submitForm()

  // Risk information
  const riskInformation = await createMovePage.fillInReleaseStatus()
  await page.submitForm()

  // Health information
  const healthInformation = await createMovePage.fillInSpecialVehicle()
  await page.submitForm()

  // Confirmation page
  await createMovePage.checkConfirmationStep({
    fullname: personalDetails.fullname,
    location: moveDetails.courtLocation,
  })
  await t.click(Selector('a').withExactText(personalDetails.fullname))

  // Move detail assertions
  await moveDetailPage.checkHeader(personalDetails)

  // Personal details assertions
  await moveDetailPage.checkPersonalDetails(personalDetails)

  // Check assessment
  if (FEATURE_FLAGS.PRISON_COURT_HEARINGS) {
    await moveDetailPage.checkCourtHearings(courtHearings)
  } else {
    await moveDetailPage.checkCourtInformation(courtInformation)
  }
  await moveDetailPage.checkRiskInformation(riskInformation)
  await moveDetailPage.checkHealthInformation(healthInformation)
})

fixture('New move from Prison to Prison').beforeEach(async t => {
  await t.useRole(ocaUser).navigateTo(newMove)
})

test('With existing person', async t => {
  const personalDetails = await createPersonFixture()

  // PNC lookup
  await createMovePage.fillInPrisonNumberSearch(personalDetails.prisonNumber)
  await page.submitForm()

  // PNC lookup results
  await createMovePage.checkPersonLookupResults(1, personalDetails.prisonNumber)
  await createMovePage.selectSearchResults(personalDetails.fullname)
  await page.submitForm()

  // Move details
  const moveDetails = await createMovePage.fillInMoveDetails('Prison')
  await page.submitForm()

  // Move date
  await createMovePage.fillInDateRange()
  await page.submitForm()

  // Transfer reason
  await createMovePage.fillInPrisonTransferReasons()
  await page.submitForm()

  // Agreement status
  await createMovePage.fillInAgreementStatus()
  await page.submitForm()

  // Health information
  await createMovePage.fillInSpecialVehicle()
  await page.submitForm()

  // Confirmation page
  await createMovePage.checkConfirmationStep({
    fullname: personalDetails.fullname,
    location: moveDetails.prisonLocation,
  })
  await t.click(Selector('a').withExactText(personalDetails.fullname))

  // Move detail assertions
  await moveDetailPage.checkHeader(personalDetails)

  // Personal details assertions
  await moveDetailPage.checkPersonalDetails(personalDetails)
})
