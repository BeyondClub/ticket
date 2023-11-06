import { Button, Input, Modal, TextBox } from '@unlock-protocol/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { useCustomEmailSend } from '~/hooks/useCustomEmail'

interface SendCustomEmailData {
  subject: string
  content: string
}

interface SendCustomEmailProps {
  lockAddress: string
  network: number
}
export function SendCustomEmail({
  lockAddress,
  network,
}: SendCustomEmailProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SendCustomEmailData>()
  const [confirm, setIsConfirm] = useState(false)
  const [customEmailData, setCustomEmailData] = useState<SendCustomEmailData>({
    subject: '',
    content: '',
  })
  const { mutateAsync: sendCustomEmail, isLoading: isSendingCustomEmail } =
    useCustomEmailSend()
  const onSubmit = (data: SendCustomEmailData) => {
    setCustomEmailData(data)
    setIsConfirm(true)
  }
  const { t } = useTranslation()
  return (
    <div>
      <Modal isOpen={confirm} setIsOpen={setIsConfirm}>
        <div className="flex flex-col gap-4">
          <header className="leading-relaxed">
            <h1 className="text-xl font-bold">{t("events.settings.emails.send.confirm")}</h1>
            <p className="text-gray-600">
              {t("events.settings.emails.send.confirmDesc")}
            </p>
          </header>
          <div className="flex justify-end gap-6">
            <Button
              disabled={isSendingCustomEmail}
              variant="outlined-primary"
              onClick={() => setIsConfirm(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button
              loading={isSendingCustomEmail}
              onClick={async (event) => {
                event.preventDefault()
                await sendCustomEmail({
                  lockAddress,
                  network,
                  ...customEmailData,
                })
                setIsConfirm(false)
              }}
            >
              {t("common.send")}
            </Button>
          </div>
        </div>
      </Modal>
      <form onSubmit={handleSubmit(onSubmit)} className="grid gap-2">
        <Input
          label={t("events.settings.emails.send.subject")}
          placeholder={t("events.settings.emails.send.subjectPlaceholder")}
          error={errors.subject?.message}
          {...register('subject', {
            required: t("common.fieldReq"),
          })}
        />
        <TextBox
          rows={5}
          error={errors.content?.message}
          label={t("events.settings.emails.send.content")}
          description={t("events.settings.emails.send.contentDesc")}
          placeholder={t("events.settings.emails.send.contentPlaceholder")}
          {...register('content', {
            required: t("common.fieldReq"),
          })}
        />
        <div className="flex justify-end gap-6">
          <Button type="submit">{t("common.send")}</Button>
        </div>
      </form>
    </div>
  )
}
