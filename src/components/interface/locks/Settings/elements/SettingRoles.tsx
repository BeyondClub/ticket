import { useTranslation } from 'next-i18next'
import { LockManagerForm } from '../forms/LockManagerForm'
import { VerifierForm } from '../forms/VerifierForm'
import { SettingCard } from './SettingCard'

interface SettingRolesProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
}

export const SettingRoles = ({
  lockAddress,
  network,
  isManager,
  isLoading,
}: SettingRolesProps) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label={t("events.settings.roles.evntMgr.title")}
        description={t("events.settings.roles.evntMgr.desc")}
        isLoading={isLoading}
      >
        <LockManagerForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.roles.verifier.title")}
        description={t("events.settings.roles.verifier.desc")}
        isLoading={isLoading}
      >
        <VerifierForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
