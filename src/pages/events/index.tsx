import React from 'react'
import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import LocksListPage from '~/components/interface/locks/List'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Button } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Launcher } from '~/components/interface/Launcher'
import { LanguageContext } from '~/contexts/LanguageContext'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const EventPageContent = () => {
  const { account } = useAuth()
  const [showLauncher, setShowLauncher] = React.useState(false)

  const Description = () => {
    return (
      <div className="flex flex-col gap-4 md:gap-0 md:justify-between md:flex-row">
        <span className="w-full max-w-lg text-base text-gray-700">
          A Lock is a membership smart contract you create, deploy, and own on
          Unlock Protocol
        </span>
        {account && (
          <Button
            onClick={() => setShowLauncher(true)}
            className="md:auto"
            size="large"
          >
            Create Lock
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
    <AppLayout title="Events" description={<Description />}>
      <LocksListPage />
    </AppLayout>
  )
}

const Events: NextPage = (props) => {
  const { t } = useTranslation()

  return (
    <LanguageContext.Provider value={{ t }}>
      <EventPageContent />
    </LanguageContext.Provider>
  )
}


export default Events
