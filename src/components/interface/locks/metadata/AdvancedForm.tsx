import { Input, Disclosure } from '@unlock-protocol/ui'
import { useFormContext } from 'react-hook-form'
import { MetadataFormData } from './utils'
import { useTranslation } from 'next-i18next'

interface Props {
  disabled?: boolean
}

export function AdvancedForm({ disabled }: Props) {
  const {
    register,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const { t } = useTranslation()

  return (
    <Disclosure label={t("events.metadata.form.advanced.title")}>
      <div className="grid gap-6">
        <p>
          {t("events.metadata.form.advanced.desc")}
        </p>
        <Input
          {...register('animation_url')}
          type="url"
          disabled={disabled}
          placeholder="https://"
          label={t("events.metadata.form.advanced.animation.title")}
          error={errors.animation_url?.message}
          description={t("events.metadata.form.advanced.animation.desc")}
        />
        <Input
          {...register('youtube_url')}
          type="url"
          disabled={disabled}
          placeholder="https://example.com"
          label={t("events.metadata.form.advanced.youtube.title")}
          error={errors.youtube_url?.message}
          description={t("events.metadata.form.advanced.youtube.desc")}
        />
        <Input
          {...register('background_color')}
          description={t("events.metadata.form.advanced.bgColor.desc")}
          label={t("events.metadata.form.advanced.bgColor.title")}
          disabled={disabled}
          placeholder={t("events.metadata.form.advanced.bgColor.placeholder")}
          type="color"
          error={errors.background_color?.message}
        />
      </div>
    </Disclosure>
  )
}
