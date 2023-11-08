import { useTranslation } from "next-i18next"

export function PoweredByUnlock() {
  const { t } = useTranslation()
  return (
    <div className="flex justify-center py-4">
      <a
        className="inline-flex items-center gap-1 text-sm font-medium"
        href="https://unlock-protocol.com/"
        target="_blank"
        rel="noopener noreferrer"
      >
        {t("common.poweredByUnlock")}
      </a>
    </div>
  )
}
