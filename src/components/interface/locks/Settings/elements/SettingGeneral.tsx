import { Lock } from '~/types'
import { UpdateBaseTokenURI } from '../forms/UpdateBaseTokenURI'
import { UpdateNameForm } from '../forms/UpdateNameForm'
import { UpdateSymbolForm } from '../forms/UpdateSymbolForm'
import { SettingCard } from './SettingCard'
import { useTranslation } from 'next-i18next'

interface SettingGeneralProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  lock?: Lock
}

export const SettingGeneral = ({
  isManager,
  lockAddress,
  network,
  isLoading,
  lock,
}: SettingGeneralProps) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label={(t("events.settings.general.contractName.title"))}
        description={t("events.settings.general.contractName.desc")}
        isLoading={isLoading}
      >
        <UpdateNameForm
          lockAddress={lockAddress}
          isManager={isManager}
          disabled={!isManager}
          lockName={lock?.name ?? ''}
          network={network}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.general.ticker.title")}
        description={t("events.settings.general.ticker.desc")}
        isLoading={isLoading}
      >
        <UpdateSymbolForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.general.baseUri.title")}
        description={t("events.settings.general.baseUri.desc")}
        isLoading={isLoading}
      >
        <UpdateBaseTokenURI
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
