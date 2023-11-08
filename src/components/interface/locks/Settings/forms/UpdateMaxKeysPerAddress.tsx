import { useMutation } from '@tanstack/react-query'
import { Input, Button } from '@unlock-protocol/ui'
import React from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'

interface UpdateMaxKeysPerAddressProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  maxKeysPerAddress: number
  publicLockVersion?: number
}

interface FormProps {
  maxKeysPerAddress?: number
}

const DEFAULT_KEYS_PER_ADDRESS = 1
export const UpdateMaxKeysPerAddress = ({
  lockAddress,
  network,
  disabled,
  isManager,
  publicLockVersion,
  maxKeysPerAddress: maxKeysPerAddressValue = DEFAULT_KEYS_PER_ADDRESS,
}: UpdateMaxKeysPerAddressProps) => {
  const { getWalletService } = useAuth()
  const { t } = useTranslation()

  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    mode: 'onChange',
    defaultValues: {
      maxKeysPerAddress: maxKeysPerAddressValue,
    },
  })

  const updateMaxKeysPerAddress = async (): Promise<any> => {
    if (!isManager) return
    const { maxKeysPerAddress = 1 } = getValues()
    const walletService = await getWalletService(network)
    return await walletService.setMaxKeysPerAddress({
      lockAddress,
      maxKeysPerAddress: maxKeysPerAddress.toString(),
    })
  }

  const updateMaxKeysPerAddressMutation = useMutation(updateMaxKeysPerAddress)

  const onHandleSubmit = async () => {
    if (isValid) {
      await ToastHelper.promise(updateMaxKeysPerAddressMutation.mutateAsync(), {
        loading: t("events.settings.memTerms.no.form.loading"),
        success: t("events.settings.memTerms.no.form.success"),
        error: t("events.settings.memTerms.no.form.error1"),
      })
    } else {
      ToastHelper.error(t("common.formNotValid"))
      reset()
    }
  }

  const canUpdateMaxKeysPerAddress = (publicLockVersion ?? 0) >= 10

  const disabledInput =
    disabled ||
    updateMaxKeysPerAddressMutation.isLoading ||
    !canUpdateMaxKeysPerAddress

  const updateVersionUrl = `/events/settings?address=${lockAddress}&network=${network}&defaultTab=advanced`

  return (
    <form
      className="flex flex-col gap-6 text-left"
      onSubmit={handleSubmit(onHandleSubmit)}
    >
      <div className="flex flex-col gap-4">
        <div className="relative">
          <Input
            placeholder={t("events.settings.memTerms.no.form.title")}
            type="number"
            autoComplete="off"
            step={1}
            disabled={disabledInput}
            description={
              !canUpdateMaxKeysPerAddress && (
                <>
                  {t("events.settings.memTerms.no.form.desc1")}{' '}
                  <a
                    href={updateVersionUrl}
                    className="font-bold cursor-pointer text-brand-ui-primary"
                  >
                    {t("events.settings.memTerms.no.form.desc2")}{' '}
                  </a>
                </>
              )
            }
            min={1}
            error={
              errors?.maxKeysPerAddress &&
              t("events.settings.memTerms.no.form.error2")
            }
            {...register('maxKeysPerAddress', {
              valueAsNumber: true,
              min: 1,
            })}
          />
        </div>
      </div>

      <span className="text-red-500"></span>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={updateMaxKeysPerAddressMutation.isLoading}
        >
          {t("common.update")}
        </Button>
      )}
    </form>
  )
}
