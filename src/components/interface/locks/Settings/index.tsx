import { Tab } from '@headlessui/react'
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SettingTerms } from './elements/SettingTerms'

import { SettingRoles } from './elements/SettingRoles'
import { useLockManager } from '~/hooks/useLockManager'
import { useAuth } from '~/contexts/AuthenticationContext'
import { addressMinify } from '~/utils/strings'
import { SettingHeader } from './elements/SettingHeader'
import { useQueries, useQuery } from '@tanstack/react-query'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SettingGeneral } from './elements/SettingGeneral'
import { SettingMisc } from './elements/SettingMisc'
import { SettingPayments } from './elements/SettingPayments'
import { SettingTab } from '~/pages/events/settings'
import { SettingEmail } from './elements/SettingEmail'
import { useTranslation } from 'next-i18next'

interface LockSettingsPageProps {
  lockAddress: string
  network: number
  defaultTab?: SettingTab
}

const NotManagerBanner = () => {
  const { account } = useAuth()
  const { t } = useTranslation()

  return (
    <div className="p-2 text-base text-center text-red-700 bg-red-100 border border-red-700 rounded-xl">
      {t("events.notManager.1")} {addressMinify(account!)} {t("events.notManager.2")}
    </div>
  )
}

export const SettingsContext = createContext<{
  setTab: (tab: number) => void
}>({
  setTab: () => {
    throw new Error('setTab is not passed')
  },
})

export const useTabSettings = () => {
  return useContext(SettingsContext)
}

const LockSettingsPage = ({
  lockAddress,
  network,
  defaultTab,
}: LockSettingsPageProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const { isManager, isLoading: isLoadingManager } = useLockManager({
    lockAddress,
    network,
  })

  const web3Service = useWeb3Service()

  const getLock = async () => {
    return web3Service.getLock(lockAddress, network)
  }

  const { isLoading: isLoadingLock, data: lock } = useQuery(
    ['getLock', lockAddress, network],
    async () => await getLock(),
    {
      enabled: lockAddress?.length > 0 && network !== undefined,
    }
  )

  const { t } = useTranslation()

  const [{ data: publicLockLatestVersion }, { data: publicLockVersion }] =
    useQueries({
      queries: [
        {
          queryKey: ['publicLockLatestVersion', network],
          queryFn: async () =>
            await web3Service.publicLockLatestVersion(network),
        },
        {
          queryKey: ['publicLockVersion', lockAddress, network],
          queryFn: async () =>
            await web3Service.publicLockVersion(lockAddress, network),
        },
      ],
    })

  const isLoading = isLoadingLock || isLoadingManager

  /**
   * Open default tab by id
   */
  useEffect(() => {
    if (!defaultTab) return
    const defaultTabIndex = tabs?.findIndex(({ id }) => id === defaultTab)
    if (defaultTabIndex === undefined) return

    setSelectedIndex(defaultTabIndex)
  }, [defaultTab])

  const tabs: {
    label: string
    description?: string
    id: SettingTab
    children: ReactNode
  }[] = [
      {
        id: 'general',
        label: t("events.settings.general.title"),
        children: (
          <SettingGeneral
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            isLoading={isLoading}
            lock={lock}
          />
        ),
      },
      {
        id: 'terms',
        label: t("events.settings.memTerms.title"),
        children: (
          <SettingTerms
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            lock={lock}
            isLoading={isLoading}
            publicLockVersion={publicLockVersion}
          />
        ),
        description:
          t("events.settings.memTerms.desc"),
      },
      {
        id: 'payments',
        label: t("events.settings.payments.title"),
        children: (
          <SettingPayments
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            lock={lock}
            isLoading={isLoading}
          />
        ),
        description:
          t("events.settings.payments.desc"),
      },
      {
        id: 'roles',
        label: t("events.settings.roles.title"),
        children: (
          <SettingRoles
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            isLoading={isLoading}
          />
        ),
        description: t("events.settings.roles.desc"),
      },
      {
        id: 'emails',
        label: t("events.settings.emails.title"),
        children: (
          <SettingEmail
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            isLoading={isLoading}
          />
        ),
        description:
          t("events.settings.emails.desc"),
      },
      {
        id: 'advanced',
        label: t("events.settings.advanced.title"),
        children: (
          <SettingMisc
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            isLoading={isLoading}
            publicLockLatestVersion={publicLockLatestVersion}
            publicLockVersion={publicLockVersion}
          />
        ),
        description:
          t("events.settings.advanced.desc"),
      },
    ]

  return (
    <SettingsContext.Provider
      value={{
        setTab: setSelectedIndex,
      }}
    >
      {!isManager && !isLoading && (
        <div className="mb-2">
          <NotManagerBanner />
        </div>
      )}
      <SettingHeader
        lockAddress={lockAddress}
        network={network}
        isLoading={isLoading}
        lock={lock}
      />
      <Tab.Group
        vertical
        defaultIndex={1}
        selectedIndex={selectedIndex}
        onChange={setSelectedIndex}
      >
        <div className="flex flex-col gap-6 my-8 md:gap-10 md:grid md:grid-cols-5">
          <div className="md:col-span-1">
            <Tab.List className="flex flex-col gap-4">
              {tabs?.map(({ label }, index) => {
                const isActive = index === selectedIndex
                return (
                  <Tab
                    className={`px-4 py-2 text-lg font-bold text-left rounded-lg outline-none ${isActive
                      ? 'bg-brand-primary text-brand-dark'
                      : 'text-gray-500'
                      }`}
                    key={index}
                  >
                    {label}
                  </Tab>
                )
              })}
            </Tab.List>
          </div>
          <div className="md:col-span-4">
            <div className="flex flex-col gap-10 md:grid md:grid-cols-4">
              <div className="md:col-span-4">
                <Tab.Panels>
                  {tabs?.map(({ label, description, children }, index) => {
                    return (
                      <Tab.Panel className="flex flex-col gap-10" key={index}>
                        <div className="flex flex-col gap-1">
                          <h2 className="text-2xl font-bold md:text-4xl text-brand-dark">
                            {label}
                          </h2>
                          <span className="text-base text-brand-dark">
                            {description}
                          </span>
                        </div>
                        <div>{children}</div>
                      </Tab.Panel>
                    )
                  })}
                </Tab.Panels>
              </div>
            </div>
          </div>
        </div>
      </Tab.Group>
    </SettingsContext.Provider>
  )
}

export default LockSettingsPage
