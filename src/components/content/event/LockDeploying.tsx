import { Button } from '@unlock-protocol/ui'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'

import {
  AnimationContent,
  DeployStatus,
} from '~/components/interface/locks/Create/elements/CreateLockFormSummary'
import { useConfig } from '~/utils/withConfig'
import { TransactionDetails } from './NewEvent'
import { useEffect } from 'react'
import { getEventPath } from './utils'
import { useTranslation } from 'next-i18next'

interface LockDeployingProps {
  transactionDetails: TransactionDetails
  lockAddress?: string
  slug?: string
}

export const LockDeploying = ({
  transactionDetails,
  lockAddress,
  slug,
}: LockDeployingProps) => {
  const config = useConfig()
  const router = useRouter()
  const { hash: transactionHash, network } = transactionDetails
  const { t } = useTranslation()

  let status: DeployStatus = 'progress'
  let title = t("events.creation.waitingDesc")
  let message = t("events.creation.plsDntClose")

  useEffect(() => {
    window?.scrollTo(0, 0) // force scroll start of page
  }, [])

  if (lockAddress) {
    status = 'deployed'
    title = `🚀​ ${t("events.creation.deploySuccess")}`
    message =
      t("events.creation.deploySuccessMsg")
  }

  const goToEventPage = () => {
    if (lockAddress && network) {
      router.push(
        getEventPath({
          lockAddress,
          network,
          metadata: {
            slug,
          },
        })
      )
    }
  }

  return (
    <div>
      <div className="flex flex-col items-stretch p-4 border border-gray-400 rounded-xl">
        <AnimationContent status={status} />
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="flex flex-col">
            <span className="text-base">{t("events.creation.status")}</span>
            <span className="text-lg font-bold">
              {status === 'progress' ? t("events.creation.inProgress") : t("events.creation.deployed")}
            </span>
          </div>
          {config.networks[network].explorer?.urls?.transaction && (
            <Link
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 mt-3 text-lg font-bold lg:mt-auto lg:ml-auto text-brand-ui-primary"
              href={config.networks[network].explorer.urls.transaction(
                transactionHash
              )}
            >
              {t("events.creation.viewBlockExp")}
              <ExternalLinkIcon size={20} />
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-col items-center my-12 text-center">
        <h3 className="block mb-4 text-2xl font-bold md:text-4xl">{title}</h3>
        <span className="mb-4 font-base">{message}</span>
        {status === 'deployed' && (
          <div className="flex flex-col items-center content-center text-center">
            <p>{t("events.creation.checkPg")}</p>
            <Button className="my-4" onClick={goToEventPage}>
              {t("events.creation.viewEventPg")}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
