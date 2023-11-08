import { Lock } from '~/unlockTypes'
import { CreditCardForm } from '../forms/CreditCardForm'
import { ReceiptBaseForm } from '../forms/ReceiptBaseForm'
import { SubscriptionForm } from '../forms/SubscriptionForm'
import { UpdatePriceForm } from '../forms/UpdatePriceForm'
import { SettingCard } from './SettingCard'
import { UpdateGasRefundForm } from '../forms/UpdateGasRefundForm'
import { useTranslation } from 'next-i18next'

interface SettingPaymentsProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  lock?: Lock
}

export const SettingPayments = ({
  lockAddress,
  network,
  isManager,
  isLoading,
  lock,
}: SettingPaymentsProps) => {
  const { t } = useTranslation()

  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label={t("events.settings.payments.price.title")}
        description={t("events.settings.payments.price.desc")}
        isLoading={isLoading}
      >
        <UpdatePriceForm
          lockAddress={lockAddress}
          network={network}
          price={parseFloat(lock?.keyPrice ?? '0')}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.payments.credit.title")}
        description={t("events.settings.payments.credit.desc")}
        isLoading={isLoading}
      >
        <CreditCardForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.payments.refund.title")}
        description={t("events.settings.payments.refund.desc")}
      >
        <UpdateGasRefundForm
          lockAddress={lockAddress}
          network={network}
          disabled={!isManager}
        />
      </SettingCard>
      <SettingCard
        label={t("events.settings.payments.renewal.title")}
        description={t("events.settings.payments.renewal.desc")}
        isLoading={isLoading}
      >
        <SubscriptionForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
          lock={lock}
        />
      </SettingCard>

      <SettingCard
        label={t("events.settings.payments.receipt.title")}
        description={t("events.settings.payments.receipt.desc")}
        isLoading={isLoading}
      >
        <ReceiptBaseForm
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          disabled={!isManager}
        />
      </SettingCard>
    </div>
  )
}
