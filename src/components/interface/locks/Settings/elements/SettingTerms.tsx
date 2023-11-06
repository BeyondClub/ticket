import { ReactNode } from 'react'
import { Lock } from '~/unlockTypes'
import { CancellationForm } from '../forms/CancellationForm'
import { UpdateDurationForm } from '../forms/UpdateDurationForm'
import { UpdateMaxKeysPerAddress } from '../forms/UpdateMaxKeysPerAddress'
import { UpdateQuantityForm } from '../forms/UpdateQuantityForm'
import { UpdateTransferFee } from '../forms/UpdateTransferFee'
import { SettingCard } from './SettingCard'
import { UNLIMITED_KEYS_DURATION } from '~/constants'
import { useTranslation } from 'next-i18next'

interface SettingTermsProps {
  lockAddress: string
  network: number
  isManager: boolean
  lock: Lock
  isLoading: boolean
  publicLockVersion?: number
}

interface SettingProps {
  label: string
  description?: string
  children: ReactNode
  active?: boolean
}

export const SettingTerms = ({
  lockAddress,
  network,
  isManager,
  lock,
  isLoading,
  publicLockVersion,
}: SettingTermsProps) => {
  const unlimitedDuration = lock?.expirationDuration === UNLIMITED_KEYS_DURATION
  const { t } = useTranslation()

  const settings: SettingProps[] = [
    {
      label: t("events.settings.memTerms.transfers.title"),
      description:
        t("events.settings.memTerms.transfers.desc"),
      children: (
        <UpdateTransferFee
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
          unlimitedDuration={unlimitedDuration}
        />
      ),
    },
    {
      label: t("events.settings.memTerms.duration.title"),
      description: t("events.settings.memTerms.duration.desc"),
      children: (
        <UpdateDurationForm
          lockAddress={lockAddress}
          network={network}
          duration={lock?.expirationDuration}
          isManager={isManager}
          disabled={!isManager}
        />
      ),
    },
    {
      label: t("events.settings.memTerms.quantity.title"),
      description:
        t("events.settings.memTerms.quantity.desc"),
      children: (
        <UpdateQuantityForm
          lockAddress={lockAddress}
          maxNumberOfKeys={lock?.maxNumberOfKeys ?? 0}
          isManager={isManager}
          disabled={!isManager}
          network={network}
        />
      ),
    },
    {
      label: t("events.settings.memTerms.no.title"),
      description:
        t("events.settings.memTerms.no.desc"),
      children: (
        <UpdateMaxKeysPerAddress
          isManager={isManager}
          disabled={!isManager}
          maxKeysPerAddress={lock?.maxKeysPerAddress ?? 1}
          lockAddress={lockAddress}
          network={network}
          publicLockVersion={publicLockVersion}
        />
      ),
    },
    {
      label: t("events.settings.memTerms.cancellation.title"),
      description:
        t("events.settings.memTerms.cancellation.desc"),
      children: (
        <CancellationForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-6">
      {settings?.map(
        ({ label, description, children, active = true }, index) => {
          if (!active) return null
          return (
            <SettingCard
              key={index}
              label={label}
              description={description}
              isLoading={isLoading}
            >
              {children}
            </SettingCard>
          )
        }
      )}
    </div>
  )
}
