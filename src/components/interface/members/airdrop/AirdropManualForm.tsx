import {
  AddressInput,
  Button,
  Input,
  Toggle,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import { KeyManager } from '@unlock-protocol/unlock-js'
import { ChangeEvent, useCallback, useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useList } from 'react-use'
import { twMerge } from 'tailwind-merge'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getAddressForName } from '~/hooks/useEns'
import { Lock } from '~/unlockTypes'
import { formatDate } from '~/utils/lock'
import { onResolveName } from '~/utils/resolvers'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { AirdropListItem, AirdropMember } from './AirdropElements'
import { useTranslation } from 'next-i18next'
export interface Props {
  add(member: AirdropMember): void
  lock: Lock
  list: AirdropMember[]
  defaultValues?: Partial<AirdropMember>
  emailRequired?: boolean
}

export function AirdropForm({
  add,
  defaultValues,
  lock,
  emailRequired = false,
}: Props) {
  const config = useConfig()
  const [useEmail, setUseEmail] = useState(false)
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    control,
    formState: { errors, isSubmitting },
  } = useForm<AirdropMember>({
    defaultValues,
    mode: 'onSubmit',
  })

  const formValues = watch()
  const { wallet } = useWatch({
    control,
  })
  const { t } = useTranslation()

  const addressFieldChanged = (name: keyof AirdropMember) => {
    return async (event: React.ChangeEvent<HTMLInputElement>) => {
      const address = await getAddressForName(event.target.value)
      if (address) {
        return setValue(name as string, address, {
          shouldValidate: true,
          shouldDirty: true,
        })
      }
    }
  }

  const required = useEmail ? t("airdrop.email.required") : t("airdrop.address.required")
  const label = useEmail ? t("common.email") : t("airdrop.address.title")

  const description = useEmail
    ? t("airdrop.email.desc.1")
    : t("airdrop.address.desc")
  const error = errors?.wallet?.message
  const placeholder = useEmail ? 'user@email.com' : '0x...'
  const inputClass = twMerge(
    'box-border flex-1 block w-full transition-all border pl-4 py-2 text-base border-gray-400 rounded-lg shadow-sm hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none disabled:bg-gray-100',
    error &&
    'border-brand-secondary hover:border-brand-secondary focus:border-brand-secondary focus:ring-brand-secondary'
  )

  const maxKeysPerAddress = lock?.maxKeysPerAddress || 1
  const web3Service = useWeb3Service()
  const networkConfig = config.networks[lock.network]

  const onWalletChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value
      if (useEmail && networkConfig.keyManagerAddress) {
        const keyManager = new KeyManager(config.networks)
        const address = keyManager.createTransferAddress({
          params: {
            email: event.target.value,
            lockAddress: lock!.address,
          },
        })
        setValue('email', value)
        setValue('manager', networkConfig.keyManagerAddress)
        return address
      }
      return value
    },
    [setValue, useEmail, lock, config.networks, networkConfig]
  )

  const onSubmitHandler = useCallback(
    async (member: AirdropMember) => {
      const address = await getAddressForName(member.wallet)
      member.wallet = address
      const parsed = AirdropMember.parse(member)
      add(parsed)
      reset()
      setValue('wallet', '')
    },
    [add, reset, setValue]
  )

  return (
    <form onSubmit={handleSubmit(onSubmitHandler)} className="grid gap-6">
      <Controller
        name="wallet"
        control={control}
        rules={{
          required,
          validate: {
            max_keys: async (address: string) => {
              if (!address) {
                return true
              }

              try {
                const numberOfMemberships = await web3Service.balanceOf(
                  lock!.address,
                  address,
                  lock!.network
                )
                return numberOfMemberships < (lock?.maxKeysPerAddress || 1)
                  ? true
                  : t("airdrop.address.error")
              } catch (error) {
                console.error(error)
                return '' // error already handle by the component
              }
            },
          },
        }}
        render={({ field: { onChange, ref, onBlur } }) => {
          return (
            <div className="grid gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-base" htmlFor={label}>
                  {label}
                </label>
                <div className="flex items-center gap-2">
                  <div className="text-base">{t("airdrop.address.noAddress")}</div>
                  <Toggle
                    value={useEmail}
                    onChange={(value: boolean) => {
                      setUseEmail(value)
                    }}
                  />
                </div>
              </div>
              {useEmail ? (
                <input
                  className={inputClass}
                  placeholder={placeholder}
                  name={label}
                  id={label}
                  type="email"
                  onChange={(event) => {
                    onChange(onWalletChange(event))
                  }}
                  ref={ref}
                  onBlur={onBlur}
                />
              ) : (
                <Controller
                  name="wallet"
                  control={control}
                  rules={{
                    required: true,
                  }}
                  render={() => {
                    return (
                      <>
                        <AddressInput
                          withIcon
                          value={wallet}
                          onChange={(value: any) => {
                            setValue('wallet', value)
                          }}
                          onResolveName={onResolveName}
                        />
                      </>
                    )
                  }}
                />
              )}
              {description && !error && (
                <p className="text-sm text-gray-600"> {description} </p>
              )}
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
          )
        }}
      />
      {!useEmail && (
        <Input
          type="email"
          label={t("airdrop.email.title")}
          {...register('email', {
            required: {
              value: useEmail || emailRequired,
              message: t("airdrop.email.required"),
            },
          })}
          description={
            t("airdrop.email.desc.2")
          }
          error={errors.email?.message}
        />
      )}
      <Input
        pattern="\d+"
        label={t("airdrop.no.title")}
        {...register('count', {
          valueAsNumber: true,
          validate: (item) => {
            if (!Number.isInteger(item)) {
              return t("airdrop.no.error.1")
            }
          },
          max: {
            value: maxKeysPerAddress,
            message: `${t("airdrop.no.error.2")} ${maxKeysPerAddress}.`,
          },
        })}
        error={errors.count?.message}
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span>{t("common.expiration")}</span>
          <ToggleSwitch
            enabled={formValues.neverExpire}
            setEnabled={() => setValue('neverExpire', !formValues.neverExpire)}
            onChange={(enabled: boolean) => {
              if (enabled) {
                setValue('expiration', undefined)
              }
            }}
            title={t("events.extend.form.neverExp")}
          />
        </div>
        <div className="relative">
          <Input
            disabled={formValues.neverExpire}
            label=""
            type="datetime-local"
            required={!formValues.neverExpire}
            {...register('expiration')}
          />
          {errors?.expiration && (
            <span className="absolute text-xs text-red-700">
              {t("common.fieldReq")}
            </span>
          )}
        </div>
      </div>
      {!useEmail && (
        <Input
          label={t("airdrop.manager.title")}
          {...register('manager', {
            onChange: addressFieldChanged('manager'),
          })}
          description={t("airdrop.manager.desc")}
          error={errors.manager?.message}
        />
      )}
      <Button loading={isSubmitting} disabled={isSubmitting} type="submit">
        {t("airdrop.addRecp")}
      </Button>
    </form>
  )
}

interface AirdropManualFormProps {
  lock: Lock
  onConfirm(members: AirdropMember[]): void | Promise<void>
  emailRequired?: boolean
}

export function AirdropManualForm({
  onConfirm,
  lock,
  emailRequired = false,
}: AirdropManualFormProps) {
  const [list, { push, removeAt, clear }] = useList<AirdropMember>([])
  const { account } = useAuth()
  const expiration = new Date(
    formatDate(lock.expirationDuration || 0)
  ).getTime()
  const [isConfirming, setIsConfirming] = useState(false)
  const { t } = useTranslation()

  return (
    <div className="space-y-6 overflow-y-auto">
      <AirdropForm
        emailRequired={emailRequired}
        lock={lock}
        add={(member) => push(member)}
        list={list}
        defaultValues={{
          expiration,
          manager: account,
          neverExpire: lock.expirationDuration === -1,
          count: 1,
        }}
      />
      {list.length > 0 && (
        <div className="grid gap-6">
          <div className="p-2 space-y-2">
            {list.map((value, index) => (
              <AirdropListItem
                key={index}
                value={value}
                onRemove={(event) => {
                  event.preventDefault()
                  removeAt(index)
                }}
              />
            ))}
          </div>
          <Button
            loading={isConfirming}
            disabled={isConfirming}
            onClick={async (event: any) => {
              event.preventDefault()
              setIsConfirming(true)
              try {
                await onConfirm(list)
                clear()
              } catch (error) {
                if (error instanceof Error) {
                  ToastHelper.error(error.message)
                }
              }
              setIsConfirming(false)
            }}
          >
            {t("airdrop.confDrop")}
          </Button>
        </div>
      )}
    </div>
  )
}
