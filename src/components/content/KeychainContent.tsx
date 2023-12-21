import React from 'react'
import Head from 'next/head'
import { pageTitle } from '../../constants'
import KeyDetails from '../interface/keychain/KeyDetails'
import { AppLayout } from '../interface/layouts/AppLayout'
import { TbWorld as WorldIcon } from 'react-icons/tb'
import { useAuth } from '~/contexts/AuthenticationContext'
import { OpenSeaIcon } from '../icons'
import { Tooltip } from '@unlock-protocol/ui'
import networks from '@unlock-protocol/networks'
import { useTranslation } from 'next-i18next'

export const KeychainContent = () => {
  const { account } = useAuth()
  const { t } = useTranslation()

  const networkConfig = networks[1]

  return (
    <AppLayout
      title={
        <div className="flex justify-between">
          <h1 className="text-4xl font-bold">{t("ticket.myTickets")}</h1>
          {networkConfig && account && (
            <div className="flex gap-3">
              {networkConfig.blockScan && networkConfig.blockScan.url && (
                <Tooltip tip={t("common.showBlockscan")} label={t("common.showBlockscan")}>
                  <a
                    href={networkConfig.blockScan.url(account!)}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-brand-ui-primary"
                  >
                    <WorldIcon size={25} />
                  </a>
                </Tooltip>
              )}

              {networkConfig.opensea && networkConfig.opensea.profileUrl && (
                <Tooltip
                  tip={t("common.viewOpenSea")}
                  label={t("common.viewOpenSea")}
                >
                  <a
                    href={networkConfig.opensea!.profileUrl(account!) ?? '#'}
                    rel="noreferrer"
                    target="_blank"
                    className="hover:text-brand-ui-primary"
                  >
                    <OpenSeaIcon size={23} />
                  </a>
                </Tooltip>
              )}
            </div>
          )}
        </div>
      }
      description=""
    >
      <Head>
        <title>{pageTitle('My Tickets')}</title>
      </Head>
      <KeyDetails />
    </AppLayout>
  )
}
export default KeychainContent
