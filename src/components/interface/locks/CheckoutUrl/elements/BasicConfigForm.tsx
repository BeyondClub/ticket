import { BasicPaywallConfigSchema } from '~/unlockTypes'
import { useForm } from 'react-hook-form'
import {
  Input,
  FieldLayout,
  TextBox,
  Button,
  ImageUpload,
  Modal,
} from '@unlock-protocol/ui'
import { z } from 'zod'
import { InputHTMLAttributes, forwardRef, useState } from 'react'
import { useImageUpload } from '~/hooks/useImageUpload'
import { useTranslation } from 'next-i18next'

interface CheckBoxInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  description?: string
}

export const CheckBoxInput = forwardRef<HTMLInputElement, CheckBoxInputProps>(
  ({ label, error, description, ...rest }, ref) => {
    return (
      <FieldLayout size="small" description={description} error={error}>
        <div className="flex items-center gap-3">
          <input
            ref={ref}
            type="checkbox"
            className="cursor-pointer focus:outline-0 hover:outline-0 outline-0 focus:ring-transparent"
            {...rest}
          />
          <label className="text-sm" htmlFor={label}>
            {label}
          </label>
        </div>
      </FieldLayout>
    )
  }
)

CheckBoxInput.displayName = 'CheckBoxInput'

interface Props {
  onChange: (values: z.infer<typeof BasicPaywallConfigSchema>) => void
  defaultValues?: z.infer<typeof BasicPaywallConfigSchema>
}
export const BasicConfigForm = ({ onChange, defaultValues }: Props) => {
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()

  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useForm<z.infer<typeof BasicPaywallConfigSchema>>({
    reValidateMode: 'onChange',
    defaultValues: defaultValues as any,
  })

  const image = watch('icon')
  // Define an onChange handler for each input field
  const handleInputChange = () => {
    const updatedValues = watch() // Get all form values
    onChange(updatedValues) // Call the onChange prop with updated values
  }

  return (
    <form
      className="grid gap-6"
      onChange={() => {
        handleInputChange()
      }}
    >
      <Button
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setIsOpen(true)
        }}
      >
        {t("checkout.config.basic.changeIcon")}
      </Button>
      <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
        <div className="p-2">
          <ImageUpload
            size="full"
            className="mx-auto"
            description={t("checkout.config.basic.changeIconDesc")}
            isUploading={isUploading}
            preview={image!}
            onChange={async (fileOrFileUrl: any) => {
              let icon = fileOrFileUrl
              if (typeof fileOrFileUrl !== 'string') {
                const items = await uploadImage(fileOrFileUrl[0])
                icon = items?.[0]?.publicUrl
                if (!icon) {
                  return
                }
              }
              setValue('icon', icon)
              handleInputChange()
            }}
          />
        </div>
      </Modal>
      <Input
        label={t("checkout.config.basic.form.title.title")}
        size="small"
        description={t("checkout.config.basic.form.title.desc")}
        {...register('title', {
          required: t("checkout.config.basic.form.title.error"),
        })}
        error={errors.title?.message}
      />
      <Input
        label={t("checkout.config.basic.form.redirectUrl.title")}
        size="small"
        description={t("checkout.config.basic.form.redirectUrl.desc")}
        {...register('redirectUri', {
          required: t("checkout.config.basic.form.redirectUrl.error"),
        })}
        error={errors.redirectUri?.message}
      />
      <Input
        label={t("checkout.config.basic.form.redirectBtn.title")}
        size="small"
        description={
          t("checkout.config.basic.form.redirectBtn.desc")
        }
        {...register('endingCallToAction', {
          required: t("checkout.config.basic.form.redirectBtn.error"),
        })}
        error={errors.endingCallToAction?.message}
      />
      <Input
        label={t("checkout.config.basic.form.refAddr.title")}
        size="small"
        description={t("checkout.config.basic.form.refAddr.desc")}
        error={errors.referrer?.message}
        {...register('referrer', {})}
      />
      <TextBox
        label={t("checkout.config.basic.form.msgToSign.title")}
        size="small"
        description={t("checkout.config.basic.form.msgToSign.desc")}
        {...register('messageToSign', {
          required: t("checkout.config.basic.form.msgToSign.error"),
        })}
        error={errors.messageToSign?.message}
      />
      <CheckBoxInput
        label={t("checkout.config.basic.form.persCheckout.title")}
        description={
          t("checkout.config.basic.form.persCheckout.desc")
        }
        error={errors.persistentCheckout?.message}
        {...register('persistentCheckout')}
      />
      <CheckBoxInput
        label={t("checkout.config.basic.form.hide.title")}
        description={t("checkout.config.basic.form.hide.desc")}
        error={errors.hideSoldOut?.message}
        {...register('hideSoldOut')}
      />
      <CheckBoxInput
        label={t("checkout.config.basic.form.skipRecp.title")}
        description={t("checkout.config.basic.form.skipRecp.desc")}
        error={errors.skipRecipient?.message}
        {...register('skipRecipient')}
      />
      <CheckBoxInput
        label={t("checkout.config.basic.form.skipSelect.title")}
        description={t("checkout.config.basic.form.skipSelect.desc")}
        error={errors.skipSelect?.message}
        {...register('skipSelect')}
      />
      <CheckBoxInput
        label={t("checkout.config.basic.form.pessimistic.title")}
        description={t("checkout.config.basic.form.pessimistic.desc")}
        error={errors.pessimistic?.message}
        {...register('pessimistic')}
      />
    </form>
  )
}
