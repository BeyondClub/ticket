import { Disclosure, Input } from '@unlock-protocol/ui'
import { useFormContext, useWatch } from 'react-hook-form'
import { MetadataFormData } from './utils'
import Link from 'next/link'
import { RiExternalLinkLine as ExternalLinkIcon } from 'react-icons/ri'
import { getCertificationPath } from '~/components/content/certification/utils'
import { useTranslation } from 'next-i18next'

interface Props {
  disabled?: boolean
  lockAddress: string
  network: number
}

export function CertificationMetadataForm({
  disabled,
  lockAddress,
  network,
}: Props) {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext<MetadataFormData>()

  const { t } = useTranslation()

  const { slug } = useWatch({
    control,
  })

  const certificationPageUrl = new URL(
    `${window.location.origin}${getCertificationPath({
      lockAddress,
      network,
      metadata: {
        slug,
      },
    })}`
  )

  return (
    <div>
      <Disclosure label={t("events.metadata.form.certification.title")}>
        <>
          <p>
            {t("events.metadata.form.certification.desc.1")}
          </p>
          <p className="">
            {t("events.metadata.form.certification.desc.2")}{' '}
            <Link
              className="inline-flex items-center underline "
              target="newline"
              href={certificationPageUrl}
            >
              {t("events.metadata.form.certification.desc.3")} <ExternalLinkIcon className="ml-1" />
            </Link>
            .
          </p>
          <div className="grid items-center gap-4 mt-4">
            <div className="flex flex-col self-start justify-top">
              <Input
                {...register('certification.certification_issuer')}
                disabled={disabled}
                type="text"
                label={t("events.metadata.form.certification.issuer.title")}
                description={t("events.metadata.form.certification.issuer.desc")}
                error={errors.certification?.certification_issuer?.message}
              />
            </div>
          </div>
        </>
      </Disclosure>
    </div>
  )
}
