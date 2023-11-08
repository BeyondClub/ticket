import { useMutation } from '@tanstack/react-query'
import { Button, Select } from '@unlock-protocol/ui'
import { useRef, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { DEFAULT_USER_ACCOUNT_ADDRESS } from '~/constants'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useCustomHook } from '~/hooks/useCustomHooks'
import { Hook, HookName, HookType } from '~/types'
import { useConfig } from '~/utils/withConfig'
import { ConnectForm } from '../../CheckoutUrl/ChooseConfiguration'
import { CaptchaContractHook } from './hooksComponents/CaptchaContractHook'
import { CustomContractHook } from './hooksComponents/CustomContractHook'
import { GuildContractHook } from './hooksComponents/GuildContractHook'
import { PasswordContractHook } from './hooksComponents/PasswordContractHook'
import { TFunction, useTranslation } from 'next-i18next'

interface UpdateHooksFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  version?: number
}

interface FormProps {
  keyPurchase: string
  keyCancel: string
  validKey?: string
  tokenURI?: string
  keyTransfer?: string
  keyExtend?: string
  keyGrant?: string
}

type FormPropsKey = keyof FormProps

interface OptionProps {
  label: string
  value: HookType | string
  component: (args: CustomComponentProps) => JSX.Element
}
interface HookValueProps {
  label: string
  fromPublicLockVersion: number
  hookName: HookName
  options?: OptionProps[]
}

export interface CustomComponentProps {
  name: string
  disabled: boolean
  selectedOption?: string
  lockAddress: string
  network: number
  hookAddress: string
  defaultValue?: string
}

const GENERAL_OPTIONS: OptionProps[] = [
  {
    label: 'Custom Contract',
    value: HookType.CUSTOM_CONTRACT,
    component: (args) => <CustomContractHook {...args} />,
  },
]

export const HookMapping: (t: TFunction) => Record<FormPropsKey, HookValueProps> = (t) => {
  return {
    keyPurchase: {
      label: t("events.settings.advanced.hooks.keyPurchase"),
      fromPublicLockVersion: 7,
      hookName: 'onKeyPurchaseHook',
      options: [
        {
          label: 'Password',
          value: HookType.PASSWORD,
          component: (args) => <PasswordContractHook {...args} />,
        },
        {
          label: 'Captcha required',
          value: HookType.CAPTCHA,
          component: (args) => <CaptchaContractHook {...args} />,
        },
        {
          label: 'Guild.xyz',
          value: HookType.GUILD,
          component: (args) => <GuildContractHook {...args} />,
        },
      ],
    },
    keyCancel: {
      label: t("events.settings.advanced.hooks.keyCancel"),
      fromPublicLockVersion: 7,
      hookName: 'onKeyCancelHook',
    },
    validKey: {
      label: t("events.settings.advanced.hooks.validKey"),
      fromPublicLockVersion: 9,
      hookName: 'onValidKeyHook',
    },
    tokenURI: {
      label: t("events.settings.advanced.hooks.tokenUri"),
      fromPublicLockVersion: 9,
      hookName: 'onTokenURIHook',
    },
    keyTransfer: {
      label: t("events.settings.advanced.hooks.keyTransfer"),
      fromPublicLockVersion: 11,
      hookName: 'onKeyTransferHook',
    },
    keyExtend: {
      label: t("events.settings.advanced.hooks.keyExtend"),
      fromPublicLockVersion: 12,
      hookName: 'onKeyExtendHook',
    },
    keyGrant: {
      label: t("events.settings.advanced.hooks.keyGrant"),
      fromPublicLockVersion: 12,
      hookName: 'onKeyGrantHook',
    },
  }
}

interface HookSelectProps {
  label: string
  name: FormPropsKey
  disabled: boolean
  network: number
  lockAddress: string
  defaultValues?: HooksFormProps
}

const HookSelect = ({
  name,
  label,
  disabled,
  lockAddress,
  network,
  defaultValues,
}: HookSelectProps) => {
  const [selectedOption, setSelectedOption] = useState<string | null>('')
  const [defaultValue, setDefaultValue] = useState<string>('')
  const firstRender = useRef(false)
  const { networks } = useConfig()
  const hooks = networks?.[network]?.hooks ?? {}
  const { t } = useTranslation()

  const getHooks = () => {
    return hooks
  }

  const getHookIdByAddress = (name: HookName, address: string): string => {
    let id
    const idByAddress: string =
      hooks?.[name]?.find((hook: Hook) => hook.address === address)?.id ?? ''

    if (idByAddress) {
      id = idByAddress
    } else if (address !== DEFAULT_USER_ACCOUNT_ADDRESS) {
      id = HookType.CUSTOM_CONTRACT
    }
    return id as string
  }

  return (
    <ConnectForm>
      {({ setValue, getValues }: any) => {
        const value = getValues(name)
        const hookOptionsByName = HookMapping(t)[name]?.options ?? []
        const options = [...GENERAL_OPTIONS, ...hookOptionsByName]
        const Option = options.find((option) => option.value === selectedOption)

        const { hookName } = HookMapping(t)[name]

        let id = ''

        const handleSelectChange = (id: string) => {
          const hooks = getHooks()[hookName]

          // get hook value from hooks of default one
          const hookValue =
            hooks?.find((hook: Hook) => {
              return hook.id === id
            })?.address || value

          setSelectedOption(`${id}`)

          if (hookValue) {
            setValue(name, hookValue, {
              shouldValidate: true,
            })
          }
        }

        // set default value when present on render
        if (!firstRender.current && value?.length) {
          id = getHookIdByAddress(hookName, value)
          setDefaultValue(id)
          firstRender.current = true
        }

        return (
          <div className="flex flex-col gap-1">
            <Select
              options={options}
              label={label}
              defaultValue={defaultValue}
              disabled={disabled}
              onChange={(value) => {
                handleSelectChange(`${value}`)
              }}
            />
            {Option?.component && (
              <div className="w-full p-4 border border-gray-500 rounded-lg">
                {Option.component({
                  name,
                  disabled,
                  selectedOption: selectedOption ?? '',
                  lockAddress,
                  network,
                  hookAddress: value,
                  defaultValue: defaultValues?.[name] ?? '',
                })}
              </div>
            )}
          </div>
        )
      }}
    </ConnectForm>
  )
}

export type HooksFormProps = Partial<Record<FormPropsKey, string>>

export const UpdateHooksForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  version,
}: UpdateHooksFormProps) => {
  const { getWalletService } = useAuth()
  const { t } = useTranslation()
  const [defaultValues, setDefaultValues] = useState<HooksFormProps>()

  const { isLoading, refetch, getHookValues } = useCustomHook({
    lockAddress,
    network,
    version,
  })

  const methods = useForm<HooksFormProps>({
    defaultValues: async () => {
      const values = await getHookValues()
      setDefaultValues(values)
      return values
    },
  })

  const {
    formState: { isValid },
    reset,
  } = methods

  const setEventsHooks = async (fields: Partial<FormProps>) => {
    const walletService = await getWalletService(network)
    return await walletService.setEventHooks({
      lockAddress,
      ...fields,
    })
  }

  const setEventsHooksMutation = useMutation(setEventsHooks, {
    onSuccess: async () => {
      const values = await getHookValues()
      setDefaultValues(values)
      reset(values)
      refetch()
    },
  })

  const onSubmit = async (fields: Partial<FormProps>) => {
    if (isValid) {
      const setEventsHooksPromise = setEventsHooksMutation.mutateAsync(fields)
      await ToastHelper.promise(setEventsHooksPromise, {
        success: t("events.settings.advanced.hooks.update.success"),
        loading: t("events.settings.advanced.hooks.update.loading"),
        error: t("events.settings.advanced.hooks.update.error"),
      })
    } else {
      ToastHelper.error(t("common.formNotValid"))
    }
  }

  const disabledInput =
    disabled || setEventsHooksMutation.isLoading || isLoading

  return (
    <FormProvider {...methods}>
      <form
        className="grid gap-6"
        onSubmit={methods.handleSubmit(onSubmit)}
        onChange={() => {
          methods.trigger()
        }}
      >
        {Object.entries(HookMapping(t))?.map(
          ([field, { label, fromPublicLockVersion = 0, hookName }]) => {
            const fieldName = field as FormPropsKey
            const hasRequiredVersion =
              version && version >= fromPublicLockVersion

            if (!hasRequiredVersion) return null

            return (
              <HookSelect
                key={hookName}
                label={label}
                name={fieldName}
                disabled={disabledInput}
                lockAddress={lockAddress}
                network={network}
                defaultValues={defaultValues}
              />
            )
          }
        )}
        {isManager && (
          <Button
            className="w-full md:w-1/3"
            type="submit"
            loading={setEventsHooksMutation.isLoading}
          >
            {t("common.apply")}
          </Button>
        )}
      </form>
    </FormProvider>
  )
}
