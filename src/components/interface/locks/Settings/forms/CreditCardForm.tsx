import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Badge, Select, Placeholder } from '@unlock-protocol/ui'
import { useState } from 'react'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useStorageService } from '~/utils/withStorageService'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { BsCheckCircle as CheckCircleIcon } from 'react-icons/bs'
import { SettingCardDetail } from '../elements/SettingCard'
import Link from 'next/link'
import {
  useGetLockStripeConnectionDetails,
  useStripeConnect,
  useStripeDisconnect,
} from '~/hooks/useStripeConnect'
import { storage } from '~/config/storage'
import { useUSDPricing } from '~/hooks/useUSDPricing'
import { useLockData } from '~/hooks/useLockData'
import CreditCardCustomPrice from './CreditCardCustomPrice'
import CreditCardUnlockFee from './CreditCardUnlockFee'
import { useTranslation } from 'next-i18next'

enum ConnectStatus {
  CONNECTED = 1,
  NOT_READY = 0,
  NO_ACCOUNT = -1,
}

interface CardPaymentProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface ConnectStripe {
  onConnectStripe: (stripeAccount?: string) => void
  onDisconnect: any
}

interface ConnectStripeProps {
  lockAddress: string
  network: number
  keyGranter: string
  isManager: boolean
  disabled: boolean
}

interface DisconnectStripeProps {
  isManager: boolean
  disabled: boolean
  onDisconnect: any
}

const DisconnectStripe = ({
  isManager,
  onDisconnect,
  disabled,
}: DisconnectStripeProps) => {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-4">
      <span className="text-xs">
        <SettingCardDetail
          title={t("events.settings.payments.credit.ready")}
          description={t("events.settings.payments.credit.readyDesc")}
        />
      </span>
      <div className="flex flex-col items-center gap-4 md:gap-8 md:flex-row">
        <Badge variant="green" className="justify-center w-full md:w-1/3">
          <div className="flex items-center gap-2">
            <span>{t("events.settings.payments.credit.enabled")}</span>
            <CheckCircleIcon />
          </div>
        </Badge>
        {isManager && (
          <Button
            size="small"
            variant="borderless"
            className="text-brand-ui-primary"
            disabled={disabled}
            onClick={onDisconnect}
          >
            {t("events.settings.payments.credit.stripe.disconnect")}
          </Button>
        )}
      </div>
    </div>
  )
}

const ConnectStripe = ({
  lockAddress,
  network,
  keyGranter,
  isManager,
  disabled,
  onConnectStripe,
}: ConnectStripeProps & Pick<ConnectStripe, 'onConnectStripe'>) => {
  const [stripeAccount, setStripeAccount] = useState<string>()
  const { getWalletService, account } = useAuth()
  const web3Service = useWeb3Service()
  const { t } = useTranslation()

  const {
    data: stripeConnections = [],
    isLoading: isLoadingStripeConnections,
  } = useQuery(['stripeConnections', account], async () => {
    const response = await storage.getStripeConnections()
    if (response.data.error) {
      throw new Error(response.data.error)
    }
    return response.data.result || []
  })

  const checkIsKeyGranter = async (keyGranter: string) => {
    return await web3Service.isKeyGranter(lockAddress, keyGranter, network)
  }

  const {
    isLoading: isLoadingCheckGrantedStatus,
    data: isGranted,
    refetch: refetchCheckKeyGranter,
  } = useQuery(
    ['checkIsKeyGranter', lockAddress, network, keyGranter],
    async () => {
      return checkIsKeyGranter(keyGranter)
    }
  )

  const grantKeyGrantorRoleMutation = useMutation(async (): Promise<any> => {
    const walletService = await getWalletService(network)
    return walletService.addKeyGranter({
      lockAddress,
      keyGranter,
    })
  })

  const onGrantKeyRole = async () => {
    const keyGrantPromise = grantKeyGrantorRoleMutation.mutateAsync()
    await ToastHelper.promise(keyGrantPromise, {
      error: t("events.settings.payments.credit.grantKey.error"),
      success: t("events.settings.payments.credit.grantKey.success"),
      loading: t("events.settings.payments.credit.grantKey.loading"),
    })
    await refetchCheckKeyGranter()
  }

  const isLoading = isLoadingCheckGrantedStatus || isLoadingStripeConnections

  if (isLoading) {
    return (
      <Placeholder.Root>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line size="xl" width="sm" />
      </Placeholder.Root>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SettingCardDetail
        title={t("events.settings.payments.credit.form.title")}
        description={
          <div className="flex flex-col gap-2">
            <span>
              {t("events.settings.payments.credit.form.desc1")}
            </span>
            <span>
              {t("events.settings.payments.credit.form.desc2")}
            </span>
            <span>
              {t("events.settings.payments.credit.form.desc3")}{' '}
              <Link
                className="font-semibold text-brand-ui-primary"
                href="https://unlock-protocol.com/guides/enabling-credit-cards/"
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("events.settings.payments.credit.form.desc4")}
              </Link>
              .
            </span>
          </div>
        }
      />
      {isManager && (
        <div className="flex flex-col gap-3">
          {isGranted ? (
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                onConnectStripe(stripeAccount)
              }}
            >
              {(stripeConnections ?? [])?.length > 0 && (
                <Select
                  defaultValue={stripeAccount}
                  onChange={(value: any) => {
                    setStripeAccount(value.toString())
                  }}
                  options={(stripeConnections ?? [])
                    ?.map((connection: any) => {
                      return {
                        label: connection.settings.dashboard.display_name,
                        value: connection.id,
                      }
                    })
                    .concat({
                      label: t("events.settings.payments.credit.stripe.connectAcc"),
                      value: '',
                    })}
                  label={t("events.settings.payments.credit.stripe.connectAccDesc")}
                />
              )}
              <Button
                className="w-full md:w-1/3"
                type="submit"
                disabled={disabled}
              >
                {t("events.settings.payments.credit.stripe.connect")}
              </Button>
            </form>
          ) : (
            <Button
              size="small"
              variant="outlined-primary"
              className="w-full md:w-1/3"
              onClick={onGrantKeyRole}
              disabled={grantKeyGrantorRoleMutation.isLoading}
            >
              {t("common.accept")}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

const StripeNotReady = ({
  isManager,
  disabled,
  onDisconnect,
  onConnectStripe,
  connectedStripeAccount,
}: Pick<ConnectStripeProps, 'isManager' | 'disabled'> &
  ConnectStripe & {
    connectedStripeAccount?: any
  }) => {
  const { t } = useTranslation()

  return (
    <span className="grid gap-2 text-sm">
      <span className="font-semibold text-red-500">
        {t("events.settings.payments.credit.stripe.notReady")}
      </span>
      <div className="flex items-center gap-0.5">
        <div className="w-full md:w-1/3">
          <Button
            onClick={(e: any) => {
              e?.preventDefault()
              onConnectStripe(connectedStripeAccount)
            }}
            size="small"
          >
            {t("events.settings.payments.credit.stripe.resume")}
          </Button>
        </div>
        {isManager && (
          <div className="w-full md:w-1/3">
            <Button
              size="small"
              variant="borderless"
              className="text-brand-ui-primary"
              disabled={disabled}
              onClick={onDisconnect}
            >
              {t("events.settings.payments.credit.stripe.disconnect")}
            </Button>
          </div>
        )}
      </div>
    </span>
  )
}

export const CreditCardForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: CardPaymentProps) => {
  const storageService = useStorageService()
  const { t } = useTranslation()

  const {
    isLoading,
    data: stripeConnectionDetails,
    refetch: refetchStripeConnectionDetails,
  } = useGetLockStripeConnectionDetails({
    lockAddress,
    network,
  })

  const { isLoading: isLoadingKeyGranter, data: keyGranter } = useQuery(
    ['getKeyGranter', lockAddress, network],
    () => {
      return getKeyGranter()
    }
  )
  const stripeConnectionState = stripeConnectionDetails?.connected ?? 0
  const connectedStripeAccount = stripeConnectionDetails?.account
  const supportedCurrencies =
    stripeConnectionDetails?.countrySpec?.supported_payment_currencies ?? []

  const getKeyGranter = async () => {
    return await storageService.getKeyGranter(network)
  }

  const disconnectStipeMutation = useStripeDisconnect({
    lockAddress,
    network,
  })

  const connectStripeMutation = useStripeConnect({
    lockAddress,
    network,
  })

  const { lock } = useLockData({
    network,
    lockAddress,
  })

  const { isLoading: isLoadingPricing, data: fiatPricing } = useUSDPricing({
    network,
    lockAddress,
    currencyContractAddress: undefined,
    amount: Number(lock?.keyPrice),
    enabled: !!lock?.address,
  })

  const isPricingLow = (fiatPricing?.usd?.amount ?? 0) < 0.5

  const loading = isLoading || isLoadingKeyGranter || isLoadingPricing

  const onDisconnectStripe = async (event: any) => {
    event.preventDefault()
    const disconnectStripePromise = disconnectStipeMutation.mutateAsync()
    await ToastHelper.promise(disconnectStripePromise, {
      error: t("events.settings.payments.credit.disconn.error"),
      success: t("events.settings.payments.credit.disconn.success"),
      loading: t("events.settings.payments.credit.disconn.loading"),
    })
    await refetchStripeConnectionDetails()
  }

  const onConnectStripe = (stripeAccount?: string) => {
    connectStripeMutation.mutate(
      { stripeAccount },
      {
        onSuccess: (connect: any) => {
          if (connect?.url) {
            window.location.assign(connect.url)
          } else {
            ToastHelper.success(t("events.settings.payments.credit.conn.success"))
            refetchStripeConnectionDetails()
          }
        },
        onError: () => {
          ToastHelper.error(t("events.settings.payments.credit.conn.error"))
        },
      }
    )
  }

  const Status = () => {
    if (ConnectStatus.NO_ACCOUNT === stripeConnectionState) {
      return (
        <ConnectStripe
          onConnectStripe={onConnectStripe}
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
          keyGranter={keyGranter}
          disabled={disabled || connectStripeMutation.isLoading}
        />
      )
    }

    if (ConnectStatus.NOT_READY === stripeConnectionState) {
      return (
        <StripeNotReady
          isManager={isManager}
          disabled={
            disabled ||
            connectStripeMutation.isLoading ||
            disconnectStipeMutation.isLoading
          }
          onConnectStripe={onConnectStripe}
          onDisconnect={onDisconnectStripe}
          connectedStripeAccount={connectedStripeAccount}
        />
      )
    }

    if (ConnectStatus.CONNECTED === stripeConnectionState) {
      return (
        <div className="grid gap-4">
          <DisconnectStripe
            isManager={isManager}
            onDisconnect={onDisconnectStripe}
            disabled={disabled || disconnectStipeMutation.isLoading}
          />
          {connectedStripeAccount && (
            <span>
              {t("events.settings.payments.credit.conn.desc")}{' '}
              <code>{connectedStripeAccount.id}</code>
            </span>
          )}

          {isManager && (
            <>
              <CreditCardCustomPrice
                lockAddress={lockAddress}
                network={network}
                disabled={disabled}
                lock={lock}
                currencies={supportedCurrencies}
                connectedStripeAccount={connectedStripeAccount}
              />
              <CreditCardUnlockFee
                lockAddress={lockAddress}
                network={network}
                disabled={disabled}
              />
            </>
          )}
        </div>
      )
    }
    return null
  }

  if (loading)
    return (
      <Placeholder.Root>
        <Placeholder.Line width="sm" />
        <Placeholder.Line width="sm" />
        <Placeholder.Line size="xl" width="sm" />
      </Placeholder.Root>
    )

  return (
    <div className="flex flex-col gap-2">
      <Status />
      {isPricingLow && (
        <span className="text-sm text-red-600">
          {t("events.settings.payments.credit.priceLow")}
        </span>
      )}
    </div>
  )
}
