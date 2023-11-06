import { LockType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { SendEmailForm } from '../forms/SendEmailForm'
import { EmailTemplatePreview } from './EmailTemplatePreview'
import { SettingCard } from './SettingCard'
import { useMetadata } from '~/hooks/metadata'
import { SendCustomEmail } from '../forms/SendCustomEmail'
import { useTranslation } from 'next-i18next'

interface SettingEmailProps {
  lockAddress: string
  network: number
  isManager: boolean
  isLoading: boolean
  publicLockVersion?: number
  publicLockLatestVersion?: number
}

interface TemplateProps {
  label: string
  description: string
  templateId: string
  customize?: boolean
}

export const SettingEmail = ({
  isManager,
  lockAddress,
  network,
  isLoading,
}: SettingEmailProps) => {
  const { isLoading: isLoadingMetadata, data: metadata } = useMetadata({
    lockAddress,
    network,
  })
  const { t } = useTranslation()

  const types = getLockTypeByMetadata(metadata)

  const TemplateByLockType: Record<keyof LockType, TemplateProps[]> = {
    isEvent: [
      {
        label: t("events.settings.emails.keyPurchase.title"),
        description:
          t("events.settings.emails.keyPurchase.desc"),
        templateId: 'eventKeyMined',
      },
      {
        label: t("events.settings.emails.keyAirdrop.title"),
        description:
          t("events.settings.emails.keyAirdrop.desc"),
        templateId: 'eventKeyAirdropped',
      },
    ],
    isCertification: [
      {
        label: t("events.settings.emails.certKeyPurchase.title"),
        description:
          t("events.settings.emails.certKeyPurchase.desc"),
        templateId: 'certificationKeyMined',
      },
      {
        label: t("events.settings.emails.certKeyAirdrop.title"),
        description:
          t("events.settings.emails.certKeyAirdrop.desc"),
        templateId: 'certificationKeyAirdropped',
      },
    ],
    isStamp: [],
  }

  const DEFAULT_EMAIL_TEMPLATES: TemplateProps[] = [
    {
      label: t("events.settings.emails.keyPurchase.template"),
      description:
        t("Key airdropped template"),
      templateId: 'keyMined',
    },
    {
      label: t("events.settings.emails.keyAirdrop.template"),
      description:
        t("events.settings.emails.keyAirdrop.templateDesc"),
      templateId: 'keyAirdropped',
    },
  ]

  // find lock type
  const [template] =
    Object.entries(types ?? {}).find(([, value]) => value === true) ?? []

  // template based on lockType
  const emailTemplates =
    TemplateByLockType[template as keyof LockType] || DEFAULT_EMAIL_TEMPLATES

  return (
    <div className="grid grid-cols-1 gap-6">
      <SettingCard
        label={t("events.settings.emails.options.title")}
        description={t("events.settings.emails.options.desc")}
        isLoading={isLoading}
      >
        <SendEmailForm
          disabled={!isManager}
          lockAddress={lockAddress}
          network={network}
          isManager={isManager}
        />
      </SettingCard>
      {emailTemplates?.map(({ label, description, templateId }) => {
        return (
          <SettingCard
            key={templateId}
            label={label}
            description={description}
            isLoading={isLoading || isLoadingMetadata}
          >
            <EmailTemplatePreview
              templateId={templateId}
              disabled={!isManager}
              lockAddress={lockAddress}
              network={network}
              isManager={isManager}
            />
          </SettingCard>
        )
      })}
      <SettingCard
        disabled={!isManager}
        label={t("events.settings.emails.send.title")}
        description={t("events.settings.emails.send.desc")}
        isLoading={isLoading}
      >
        <SendCustomEmail lockAddress={lockAddress} network={network} />
      </SettingCard>
    </div>
  )
}
