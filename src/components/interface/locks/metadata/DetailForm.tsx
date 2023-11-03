import { Disclosure, Input, TextBox, ImageUpload } from '@unlock-protocol/ui'
import { useFormContext, useWatch } from 'react-hook-form'
import { MetadataFormData } from './utils'
import { useImageUpload } from '~/hooks/useImageUpload'
import { SLUG_REGEXP } from '~/constants'
import { storage } from '~/config/storage'
import { useTranslation } from 'next-i18next'

interface Props {
  disabled?: boolean
  defaultValues?: any
}

export function DetailForm({ disabled, defaultValues }: Props) {
  const {
    register,
    setValue,
    control,
    formState: { errors },
  } = useFormContext<MetadataFormData>()
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const { t } = useTranslation()

  const { image } = useWatch({
    control,
  })

  const NameDescription = () => (
    <p>
      {t("events.metadata.form.basic.name.desc.1")}{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.youtube.com/watch?v=s_Lo2RxPYGA"
      >
        {t("events.metadata.form.basic.name.desc.2")}
      </a>
    </p>
  )

  const DescDescription = () => (
    <p>
      {t("events.metadata.form.basic.desc.desc.1")}{' '}
      <a
        className="text-brand-ui-primary hover:underline"
        target="_blank"
        rel="noopener noreferrer"
        href="https://www.markdownguide.org/cheat-sheet"
      >
        {t("events.metadata.form.basic.desc.desc.2")}
      </a>
    </p>
  )

  return (
    <Disclosure label={t("events.metadata.form.basic.title")} defaultOpen>
      <div className="grid gap-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <ImageUpload
              description={t("events.metadata.form.basic.imgDesc")}
              isUploading={isUploading}
              preview={image!}
              onChange={async (fileOrFileUrl: any) => {
                if (typeof fileOrFileUrl === 'string') {
                  setValue('image', fileOrFileUrl)
                } else {
                  const items = await uploadImage(fileOrFileUrl[0])
                  const image = items?.[0]?.publicUrl
                  if (!image) {
                    return
                  }
                  setValue('image', image)
                }
              }}
            />
          </div>
          <div className="grid order-1 gap-6 md:order-2">
            <Input
              {...register('name', {
                required: {
                  value: true,
                  message: t("events.metadata.form.basic.name.error"),
                },
              })}
              error={errors.name?.message}
              disabled={disabled}
              type="text"
              placeholder={t("events.metadata.form.basic.name.title")}
              label={t("events.metadata.form.basic.name.title")}
              description={<NameDescription />}
            />
            <TextBox
              {...register('description')}
              disabled={disabled}
              label={t("events.metadata.form.basic.desc.title")}
              placeholder={t("events.metadata.form.basic.desc.placeholder")}
              description={<DescDescription />}
              error={errors.description?.message}
              rows={4}
            />
            <Input
              {...register('slug', {
                pattern: {
                  value: SLUG_REGEXP,
                  message: t("events.metadata.form.basic.slug.error.1"),
                },
                validate: async (slug: string | undefined) => {
                  const slugChanged = defaultValues?.slug !== slug
                  if (slugChanged && slug) {
                    const data = (await storage.getLockSettingsBySlug(slug))
                      .data
                    return data
                      ? t("events.metadata.form.basic.slug.error.2")
                      : true
                  }
                  return true
                },
              })}
              disabled={disabled || defaultValues?.slug}
              type="text"
              label={t("events.metadata.form.basic.slug.title")}
              error={errors.slug?.message}
              description={t("events.metadata.form.basic.slug.desc")}
            />
            <Input
              {...register('external_url')}
              disabled={disabled}
              type="url"
              placeholder="https://"
              label={t("events.metadata.form.basic.extUrl.title")}
              error={errors.external_url?.message}
              description={t("events.metadata.form.basic.extUrl.desc")}
            />
          </div>
        </div>
      </div>
    </Disclosure>
  )
}
