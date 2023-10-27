import * as rtl from '@testing-library/react'

import Home from '../../pages/index'

import { expect, vi } from 'vitest'
import configure from '../../config'
import { ETHEREUM_NETWORKS_NAMES, pageTitle } from '../../constants'
import { ConfigContext } from '../../utils/withConfig'

const config = configure()

vi.mock('../../constants')

const network = {
  name: 4,
}
const router = {
  location: {
    pathname: '/',
    search: '',
    hash: '',
  },
}
const account = {
  address: '0xabc',
  privateKey: 'deadbeef',
  balance: '200',
}

ETHEREUM_NETWORKS_NAMES[network.name] = 'A Name'

const ConfigProvider = ConfigContext.Provider

describe('Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Home', () => {
    it.skip('should render title correctly', () => {
      expect.assertions(1)
      rtl.render(
        <ConfigProvider value={config}>
          <Home />
        </ConfigProvider>
      )
      expect(pageTitle).toBeCalled()
    })
  })
})
