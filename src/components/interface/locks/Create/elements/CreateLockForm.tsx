import { useQuery } from '@tanstack/react-query'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { networks } from '@unlock-protocol/networks'
import { Button, Input, Select, ToggleSwitch } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getAccountTokenBalance } from '~/hooks/useAccount'
import { Token } from '~/types'
import { lockTickerSymbol } from '~/utils/checkoutLockUtils'
import { useAvailableNetworks } from '~/utils/networks'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SelectCurrencyModal } from '../modals/SelectCurrencyModal'
import { BalanceWarning } from './BalanceWarning'
import { useTranslation } from 'next-i18next'

export interface LockFormProps {
  name: string
  keyPrice?: number
  expirationDuration?: number
  maxNumberOfKeys?: number
  network: number
  unlimitedDuration: boolean
  unlimitedQuantity: boolean
  isFree: boolean
  currencyContractAddress?: string
  symbol?: string
}

interface CreateLockFormProps {
  onSubmit: any
  defaultValues: LockFormProps
}

export const networkDescription = (network: number) => {
  const { description, url, faucet, nativeCurrency } = networks[network!]
  const { t } = useTranslation()

  return (
    <>
      {t(`networks.description.${(description as string).trim().toLowerCase().replace(/[ .]/g, "_")}`)} {' '}
      {url && (
        <>
          <Link className="underline" href={url} target="_blank">
            {t("networks.description.learnMore")}
          </Link>
        </>
      )}
      {faucet && (
        <>
          {' '}
          <br />
          {t("networks.description.faucet.1")} {nativeCurrency.name} {t("networks.description.faucet.2")}{' '}
          <Link className="underline" href={faucet} target="_blank">
            {t("networks.description.faucet.3")}
          </Link>
          .
        </>
      )}
    </>
  )
}

export const CreateLockForm = ({
  onSubmit,
  defaultValues,
}: CreateLockFormProps) => {
  const { networks } = useConfig()
  const web3Service = useWeb3Service()
  const { account, network } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [unlimitedDuration, setUnlimitedDuration] = useState(
    defaultValues?.unlimitedDuration ?? false
  )
  const [unlimitedQuantity, setUnlimitedQuantity] = useState(
    defaultValues?.unlimitedQuantity
  )
  const [isFree, setIsFree] = useState(defaultValues?.isFree ?? false)
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isValid, errors },
  } = useForm<LockFormProps>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      network,
      maxNumberOfKeys: undefined,
      expirationDuration: undefined,
      keyPrice: undefined,
      unlimitedDuration,
      unlimitedQuantity,
      isFree,
    },
  })
  const { t } = useTranslation()
  const { network: selectedNetwork } = useWatch({
    control,
  })

  const baseCurrencySymbol = networks[selectedNetwork!].nativeCurrency.symbol

  const getBalance = async () => {
    const balance = await getAccountTokenBalance(
      web3Service,
      account!,
      null,
      selectedNetwork || 1
    )
    return parseFloat(balance)
  }

  const { isLoading: isLoadingBalance, data: balance } = useQuery(
    ['getBalance', selectedNetwork, account],
    () => getBalance()
  )

  useEffect(() => {
    reset(defaultValues)
  }, [defaultValues, reset])

  const onHandleSubmit = (values: LockFormProps) => {
    if (isValid) {
      if (typeof onSubmit === 'function') {
        onSubmit(values)
      }
    } else {
      ToastHelper.error('Form is not valid')
    }
  }

  const onSelectToken = (token: Token) => {
    setSelectedToken(token)
    setValue('currencyContractAddress', token.address)
    setValue('symbol', token.symbol)
  }

  const noBalance = balance === 0 && !isLoadingBalance
  const submitDisabled = isLoadingBalance || noBalance
  const selectedCurrency = (
    selectedToken?.symbol ||
    defaultValues?.symbol ||
    baseCurrencySymbol
  )?.toLowerCase()

  const symbol = lockTickerSymbol(networks[selectedNetwork!], selectedCurrency)

  const networkOptions = useAvailableNetworks()

  const onChangeNetwork = useCallback(
    (network: number | string) => {
      setSelectedToken(null)
      setValue('network', parseInt(`${network}`))
    },
    [setValue, setSelectedToken]
  )

  useEffect(() => {
    if (network) {
      onChangeNetwork(network)
    }
  }, [onChangeNetwork, network])

  return (
    <>
      <SelectCurrencyModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        network={selectedNetwork!}
        onSelect={onSelectToken}
      />
      <div className="mb-4">
        {noBalance && (
          <BalanceWarning network={selectedNetwork!} balance={balance!} />
        )}
      </div>
      <div className="overflow-hidden bg-white rounded-xl">
        <div className="px-3 py-8 md:py-4">
          <form
            className="flex flex-col w-full gap-6"
            onSubmit={handleSubmit(onHandleSubmit)}
          >
            <Select
              label={`${t("common.network")}:`}
              tooltip={
                <>
                  Unlock supports{' '}
                  <Link
                    target="_blank"
                    className="underline"
                    href="https://docs.unlock-protocol.com/core-protocol/unlock/networks"
                  >
                    {Object.keys(networks).length} networks
                  </Link>
                  .
                  <br />
                  If yours is not in the list below, switch your wallet to it{' '}
                  <br />
                  and you will be able to deploy your contract on it.
                </>
              }
              defaultValue={selectedNetwork}
              options={networkOptions}
              onChange={onChangeNetwork}
              description={networkDescription(selectedNetwork!)}
            />
            <div className="relative">
              <Input
                label={`${t("common.name")}:`}
                autoComplete="off"
                placeholder={t("events.deploy.form.name.placeholder")}
                {...register('name', {
                  required: true,
                  minLength: 3,
                })}
              />
              {errors?.name && (
                <span className="absolute text-xs text-red-700">
                  {t("events.deploy.form.name.error")}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="block px-1 text-base" htmlFor="">
                  {t("events.deploy.form.duration.title")}:
                </label>
                <ToggleSwitch
                  title={t("common.unlimited")}
                  enabled={unlimitedDuration}
                  setEnabled={setUnlimitedDuration}
                  onChange={(enable: boolean) => {
                    if (enable) {
                      setValue('expirationDuration', undefined)
                    }
                    setValue('unlimitedDuration', enable, {
                      shouldValidate: true,
                    })
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  tabIndex={-1}
                  autoComplete="off"
                  step="any"
                  disabled={unlimitedDuration}
                  {...register('expirationDuration', {
                    min: 0,
                    required: !unlimitedDuration,
                  })}
                  placeholder={t("events.deploy.form.duration.placeholder")}
                  type="number"
                />
                {errors?.expirationDuration && (
                  <span className="absolute mt-1 text-xs text-red-700">
                    {t("events.deploy.form.duration.error")}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="block px-1 text-base" htmlFor="">
                  {t("events.deploy.form.no.title")}:
                </label>
                <ToggleSwitch
                  title={t("common.unlimited")}
                  enabled={unlimitedQuantity}
                  setEnabled={setUnlimitedQuantity}
                  onChange={(enable: boolean) => {
                    if (enable) {
                      setValue('maxNumberOfKeys', undefined)
                    }
                    setValue('unlimitedQuantity', enable, {
                      shouldValidate: true,
                    })
                  }}
                />
              </div>
              <div className="relative">
                <Input
                  placeholder={t("events.deploy.form.no.placeholder")}
                  type="number"
                  autoComplete="off"
                  step={1}
                  disabled={unlimitedQuantity}
                  {...register('maxNumberOfKeys', {
                    valueAsNumber: true,
                    min: 0,
                    required: !unlimitedQuantity,
                  })}
                />
                {errors?.maxNumberOfKeys && (
                  <span className="absolute mt-1 text-xs text-red-700">
                    {t("events.deploy.form.no.error")}
                  </span>
                )}
              </div>
            </div>

            <div className="relative flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="px-1 mb-2 text-base" htmlFor="">
                  {t("events.deploy.form.price.title")}:
                </label>
                <ToggleSwitch
                  title={t("common.free")}
                  enabled={isFree}
                  setEnabled={setIsFree}
                  onChange={(enable: boolean) => {
                    setValue('keyPrice', enable ? 0 : undefined)
                    setValue('isFree', enable, {
                      shouldValidate: true,
                    })
                  }}
                />
              </div>
              <div className="relative">
                <div className="grid grid-cols-2 gap-2 justify-items-stretch">
                  <div className="flex flex-col gap-1.5">
                    <div
                      onClick={() => setIsOpen(true)}
                      className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                    >
                      <CryptoIcon symbol={symbol} />
                      <span>{symbol}</span>
                    </div>
                    <div className="pl-1"></div>
                  </div>

                  <Input
                    type="number"
                    autoComplete="off"
                    placeholder="0.00"
                    step="any"
                    disabled={isFree}
                    {...register('keyPrice', {
                      valueAsNumber: true,
                      required: !isFree,
                    })}
                  />
                </div>
                {errors?.keyPrice && (
                  <span className="absolute text-xs text-red-700 ">
                    {t("events.deploy.form.price.error")}
                  </span>
                )}
              </div>
            </div>
            <Button
              className="mt-8 md:mt-0"
              type="submit"
              disabled={submitDisabled}
            >
              {t("common.next")}
            </Button>
          </form>
        </div>
      </div>
    </>
  )
}
