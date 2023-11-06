import { useMutation } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useSaveLockSettings } from '~/hooks/useLockSettings'

interface EmailReplyToFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
  lockSettings?: FormProps
}

interface FormProps {
  replyTo?: string
  emailSender?: string
}

export const EmailSettingsForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
  lockSettings,
}: EmailReplyToFormProps) => {
  const { handleSubmit, register } = useForm<FormProps>({
    defaultValues: {
      replyTo: lockSettings?.replyTo,
      emailSender: lockSettings?.emailSender,
    },
  })
  const { t } = useTranslation()

  const { mutateAsync: saveSettingsMutation } = useSaveLockSettings()

  const updateReplyTo = async (config: FormProps) => {
    if (!isManager) return
    return await saveSettingsMutation({
      lockAddress,
      network,
      ...config,
    })
  }

  const updateReplyToMutation = useMutation(updateReplyTo)

  const disabledInput = !isManager || disabled

  const onSubmit = async (fields: FormProps) => {
    await updateReplyToMutation.mutateAsync(fields)
    ToastHelper.success(t("events.settings.emails.options.settings.success"))
  }

  return (
    <div className="relative">
      {isManager && (
        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <Input
              type="email"
              placeholder="your@email.com"
              label={t("events.settings.emails.options.settings.replyTo")}
              disabled={disabledInput}
              {...register('replyTo')}
            />
            <span className="text-sm text-gray-600">
              {t("events.settings.emails.options.settings.replyDesc")}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <Input
              type="text"
              placeholder={t("events.settings.emails.options.settings.name.placeholder")}
              label={t("events.settings.emails.options.settings.name.title")}
              disabled={disabledInput}
              autoComplete="off"
              description={t("events.settings.emails.options.settings.name.desc")}
              {...register('emailSender')}
            />
          </div>
          <Button
            className="w-full md:w-1/3"
            type="submit"
            disabled={disabledInput}
            loading={updateReplyToMutation.isLoading}
            size="small"
          >
            {t("common.apply")}
          </Button>
        </form>
      )}
    </div>
  )
}
