import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'

interface UpdateNameFormProps {
  disabled: boolean
  isManager: boolean
  lockAddress: string
  lockName: string
  network: number
}

interface FormProps {
  name: string
}

export const UpdateNameForm = ({
  disabled,
  isManager,
  lockAddress,
  lockName,
  network,
}: UpdateNameFormProps) => {
  const { getWalletService } = useAuth()
  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    defaultValues: {
      name: lockName,
    },
  })
  const { t } = useTranslation()

  const changeName = async (name: string) => {
    const walletService = await getWalletService(network)
    return await walletService.updateLockName({
      lockAddress,
      name,
    })
  }

  const changeNameMutation = useMutation(changeName)

  const onChangeName = async ({ name }: FormProps) => {
    if (!isManager) return
    if (isValid) {
      const changeNamePromise = changeNameMutation.mutateAsync(name)
      await ToastHelper.promise(changeNamePromise, {
        loading: t("events.settings.general.contractName.form.loading"),
        success: t("events.settings.general.contractName.form.success"),
        error: t("events.settings.general.contractName.form.error1"),
      })
    } else {
      ToastHelper.error(t("common.formNotValid"))
      reset()
    }
  }

  const disabledInput = disabled || changeNameMutation.isLoading
  const updateMetadataUrl = `/events/metadata?lockAddress=${lockAddress}&network=${network}`
  return (
    <form className="flex flex-col gap-6" onSubmit={handleSubmit(onChangeName)}>
      <div className="relative">
        <Input
          {...register('name', {
            minLength: 3,
            required: true,
          })}
          error={errors?.name && t("events.settings.general.contractName.form.error3")}
          autoComplete="off"
          disabled={disabledInput}
          description={
            <span>
              <span className="flex gap-1">
                <span>
                  {t("events.settings.general.contractName.form.desc1")}
                </span>
                <Link
                  href={updateMetadataUrl}
                  className="font-bold cursor-pointer text-brand-ui-primary"
                >
                  {t("events.settings.general.contractName.form.desc2")}
                </Link>
              </span>
            </span>
          }
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={changeNameMutation.isLoading}
        >
          {t("common.update")}
        </Button>
      )}
    </form>
  )
}
