import { useQuery } from '@tanstack/react-query'
import { Badge, Button, ToggleSwitch } from '@unlock-protocol/ui'
import { useState, useEffect } from 'react'
import { MAX_UINT } from '~/constants'
import useLock from '~/hooks/useLock'
import { useLockSettings } from '~/hooks/useLockSettings'
import { useTabSettings } from '..'
import { useTranslation } from 'next-i18next'

interface SubscriptionFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  lock?: any
}

export const SubscriptionForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  lock,
}: SubscriptionFormProps) => {
  const [isLoading, setLoading] = useState(false)
  const [recurring, setRecurring] = useState(false)
  const [isRecurring, setIsRecurring] = useState(false)
  const { setTab } = useTabSettings()
  const { getIsRecurringPossible } = useLockSettings()
  const { t } = useTranslation()

  const {
    data: { gasRefund = 0, isRecurringPossible = false } = {},
    isLoading: isLoadingRefund,
  } = useQuery(
    ['getIsRecurringPossible', lockAddress, network],
    async () => {
      return await getIsRecurringPossible({ lockAddress, network })
    },
    {
      enabled: lockAddress?.length > 0 && network != null,
    }
  )

  const { updateSelfAllowance } = useLock(
    {
      address: lockAddress,
      network,
    },
    network
  )

  useEffect(() => {
    setRecurring(isRecurring)
  }, [isRecurring])

  useEffect(() => {
    if (lock?.publicLockVersion >= 11) {
      // TODO: check gas refund
      setIsRecurring(isRecurringPossible)
    } else {
      setIsRecurring(isRecurringPossible && lock?.selfAllowance !== '0')
    }
  }, [lock?.publicLockVersion, lock?.selfAllowance, isRecurringPossible])

  const handleApproveRecurring = () => {
    if (!isManager) return null
    // We only need to do this for older versions
    if (lock?.publicLockVersion < 11) {
      setLoading(true)
      updateSelfAllowance(MAX_UINT, () => {
        setIsRecurring(true)
        setLoading(false)
      })
    } else {
      setIsRecurring(true)
    }
  }

  if (isRecurring) {
    return (
      <Badge variant="green" className="flex justify-center w-full md:w-1/3">
        <span>{t("events.settings.payments.renewal.enabled")}</span>
      </Badge>
    )
  }

  const RecurringDescription = () => {
    if (isLoading) return null
    if (isRecurringPossible) return null

    if (lock?.publicLockVersion >= 10) {
      return (
        <div className="grid  gap-1.5">
          <small className="text-sm text-brand-dark">
            {t("events.settings.payments.renewal.desc1")}
          </small>
          <ul className="ml-2 list-disc">
            {gasRefund <= 0 && (
              <li>
                <span className="text-red-500">
                  {t("events.settings.payments.renewal.desc2")}{' '}
                  <button
                    onClick={(event) => {
                      event.preventDefault()
                      setTab(1)
                    }}
                    className="font-semibold text-brand-ui-primary hover:underline"
                  >
                    {t("events.settings.payments.renewal.desc3")}
                  </button>
                </span>
              </li>
            )}
            {lock?.expirationDuration == -1 && (
              <li>
                <span className="text-red-500">
                  {t("events.settings.payments.renewal.desc4")}{' '}
                  <button
                    onClick={(event) => {
                      event.preventDefault()
                      setTab(1)
                    }}
                    className="font-semibold text-brand-ui-primary hover:underline"
                  >
                    {t("events.settings.payments.renewal.desc5")}
                  </button>
                </span>
              </li>
            )}
            {(lock?.currencyContractAddress ?? '')?.length === 0 && (
              <li>
                <span className="text-red-500">
                  {t("events.settings.payments.renewal.desc6")}
                </span>
              </li>
            )}
          </ul>
        </div>
      )
    }

    return null
  }

  const disabledInput =
    isRecurring ||
    !isRecurringPossible ||
    disabled ||
    isLoading ||
    isLoadingRefund

  return (
    <div className="flex flex-col gap-6">
      <ToggleSwitch
        title={t("events.settings.payments.renewal.enable")}
        description={<RecurringDescription />}
        disabled={disabledInput}
        enabled={recurring}
        setEnabled={setRecurring}
      />
      {isManager && (
        <Button
          disabled={disabledInput}
          className="w-full md:w-1/2"
          onClick={handleApproveRecurring}
          loading={isLoading}
        >
          {t("common.apply")}
        </Button>
      )}
    </div>
  )
}
