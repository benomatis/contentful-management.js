import { expect } from 'chai'
import { before, describe, test, after } from 'mocha'
import {
  createAppDefinition,
  getAppDefinition,
  getTestOrganization,
  createAppInstallation,
} from '../helpers'

describe('AppDefinition api', function () {
  let organization

  before(async () => {
    organization = await getTestOrganization()
  })

  after(async () => {
    const { items: appDefinitions } = await organization.getAppDefinitions()
    for (const appDefinition of appDefinitions) {
      await appDefinition.delete()
    }
  })

  test('createAppDefinition', async () => {
    const appDefinition = await organization.createAppDefinition({
      name: 'Test App',
      src: 'http://localhost:3000',
      locations: [
        {
          location: 'app-config',
        },
      ],
    })

    expect(appDefinition.sys.type).equals('AppDefinition', 'type')
    expect(appDefinition.name).equals('Test App', 'name')
  })

  test('getAppDefintion', async () => {
    const appDefinition = await organization.createAppDefinition({
      name: 'Test App',
      src: 'http://localhost:3000',
      locations: [
        {
          location: 'app-config',
        },
      ],
    })

    const fetchedAppDefinition = await organization.getAppDefinition(appDefinition.sys.id)

    expect(appDefinition.sys.id).equals(fetchedAppDefinition.sys.id)
  })

  test('getAppDefinitions', async () => {
    const appDefinitions = await organization.getAppDefinitions()

    expect(appDefinitions.items).to.be.an('array')
    expect(appDefinitions.sys.type).equals('Array', 'type')
  })

  test('delete', async () => {
    const appDefinition = await organization.createAppDefinition({
      name: 'Test App',
      src: 'http://localhost:3000',
      locations: [
        {
          location: 'app-config',
        },
      ],
    })

    await appDefinition.delete()

    await expect(organization.getAppDefinition(appDefinition.sys.id)).to.be.rejectedWith(
      'The resource could not be found'
    )
  })

  test('update', async () => {
    const appDefinition = await organization.createAppDefinition({
      name: 'Test App',
      src: 'http://localhost:3000',
      locations: [
        {
          location: 'app-config',
        },
      ],
    })

    appDefinition.name = 'Test App Updated'

    await appDefinition.update()

    expect(appDefinition.name).equals('Test App Updated', 'name')
  })

  test('getAppDefinition (top level)', async () => {
    const { orgId, appId } = await createAppDefinition()
    const appDefinition = await getAppDefinition({ organizationId: orgId, appDefinitionId: appId })

    expect(appDefinition.sys.organization.sys.id).equals(orgId)
    expect(appDefinition.sys.id).equals(appId)
  })

  test('getInstallationsForOrg returns', async () => {
    const { orgId, appId } = await createAppDefinition()
    const appDefinition = await getAppDefinition({ organizationId: orgId, appDefinitionId: appId })
    const installationsForOrg = await appDefinition.getInstallationsForOrg({
      organizationId: orgId,
      appDefinitionId: appId,
    })
    expect(installationsForOrg.sys.type).equals('Array')
  })

  test('getInstallationsForOrg throws if missing org Id', async () => {
    const { orgId, appId } = await createAppDefinition()
    const appDefinition = await getAppDefinition({ organizationId: orgId, appDefinitionId: appId })

    try {
      await appDefinition.getInstallationsForOrg({
        appDefinitionId: appId,
      })
    } catch (e) {
      expect(e.toString()).to.equal(
        'ValidationError: Invalid "organizationId" provided, Please provide an object with the shape { appDefinitionId: string, organizationId: string } as argument when calling the getInstallationsForOrg method'
      )
    }
  })

  test('getInstallationsForOrg throws if missing app Id', async () => {
    const { orgId, appId } = await createAppDefinition()
    const appDefinition = await getAppDefinition({ organizationId: orgId, appDefinitionId: appId })

    try {
      await appDefinition.getInstallationsForOrg({
        organizationId: orgId,
      })
    } catch (e) {
      expect(e.toString()).to.equal(
        'ValidationError: Invalid "appDefinitionId" provided, Please provide argument of { appDefinitionId: string, organizationId: string } for the getInstallationsForOrg method'
      )
    }
  })

  test('getInstallationsForOrg returns installations', async () => {
    const { orgId, appId } = await createAppDefinition()
    const appInstallation = await createAppInstallation(appId)
    const appDefinition = await getAppDefinition({ organizationId: orgId, appDefinitionId: appId })
    const appInstallationsForOrg = await appDefinition.getInstallationsForOrg({
      appDefinitionId: appId,
      organizationId: orgId,
    })

    expect(appInstallationsForOrg.items.length).to.equal(1)
    await appInstallation.delete()
  })
})
