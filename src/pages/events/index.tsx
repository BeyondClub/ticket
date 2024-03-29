import React from 'react'
import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import LocksListPage from '~/components/interface/locks/List'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Button } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Launcher } from '~/components/interface/Launcher'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import Head from 'next/head'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}

const Events: NextPage = () => {
  const { account } = useAuth()
  const [showLauncher, setShowLauncher] = React.useState(false)
  const { t } = useTranslation()
  const router = useRouter()

  const Description = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
        <span className="w-full max-w-lg text-base text-gray-700">
          {t('events.description')}
        </span>
        {account && (
          <Button
            // onClick={() => setShowLauncher(true)}
            onClick={() => router.push('/event/new')}
            className="md:auto"
            size="large"
          >
            {t('events.create')}
          </Button>
        )}
      </div>
    )
  }
  if (showLauncher) {
    return (
      <AppLayout authRequired={false} showLinks={false}>
        <Launcher />
      </AppLayout>
    )
  }
  return (
    <AppLayout title={t("menu.events")} description={<Description />}>
      <Head>
        <title>{t("common.appTitle")}</title>
        <meta name="description" content={t("common.appDesc")} />
      </Head>
      <LocksListPage />
    </AppLayout>
  )
}

export default Events
