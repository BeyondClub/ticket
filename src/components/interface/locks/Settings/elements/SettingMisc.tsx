import { useState } from 'react'
import { UpdateHooksForm } from '../forms/UpdateHooksForm'
import { UpdateReferralFee } from '../forms/UpdateReferralFee'
import { UpdateVersionForm } from '../forms/UpdateVersionForm'
import { SettingCard } from './SettingCard'
import { useTranslation } from 'next-i18next'

interface SettingMiscProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  publicLockVersion?: number
  publicLockLatestVersion?: number
}

const UpgradeCard = ({ isLastVersion }: { isLastVersion: boolean }) => {
  const { t } = useTranslation()
  if (isLastVersion) {
    return (
      <span className="text-base">{t("events.settings.advanced.version.latest")}</span>
    )
  }

  return (
    <div className="flex flex-col gap-1 p-4 bg-gray-100 rounded-lg ">
      <span className="text-base font-bold text-brand-ui-primary">
        {t("events.settings.advanced.version.upgrade")} 🔆
      </span>
      <span className="text-base text-brand-dark">
        {t("events.settings.advanced.version.upgradeDesc")}
      </span>
    </div>
  )
}

export const SettingMisc = ({
  isManager,
  lockAddress,
  network,
  isLoading,
  publicLockVersion,
  publicLockLatestVersion,
}: SettingMiscProps) => {
  const [updatedVersion, setUpdatedVersion] = useState(publicLockVersion)
  const { t } = useTranslation()

  const isLastVersion =
    updatedVersion !== undefined &&
    publicLockLatestVersion !== undefined &&
    updatedVersion === publicLockLatestVersion

  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label={t("events.settings.advanced.referral.title")}
        description={t("events.settings.advanced.referral.desc")}
        isLoading={isLoading}
      >
        <UpdateReferralFee
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.advanced.hooks.title")}
        description={
          <span>
            {t("events.settings.advanced.hooks.desc1")}{' '}
            <a
              href="https://docs.unlock-protocol.com/core-protocol/public-lock/hooks"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-brand-ui-primary"
            >
              {t("events.settings.advanced.hooks.desc2")}
            </a>
          </span>
        }
        isLoading={isLoading}
      >
        <UpdateHooksForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
          version={updatedVersion!}
        />
      </SettingCard>

      {(updatedVersion ?? 0) >= 10 && (
        <SettingCard
          label={t("events.settings.advanced.version.title")}
          description={<UpgradeCard isLastVersion={isLastVersion} />}
          isLoading={isLoading}
          disabled={isLastVersion}
        >
          <UpdateVersionForm
            lockAddress={lockAddress}
            network={network}
            isManager={isManager}
            disabled={!isManager}
            version={updatedVersion ?? 0}
            isLastVersion={isLastVersion}
            onUpdatedVersion={setUpdatedVersion}
          />
        </SettingCard>
      )}
    </div>
  )
}
