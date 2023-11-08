import Head from 'next/head'
import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { getMembershipVerificationConfig } from '~/utils/verification'
import { pageTitle } from '../../constants'
import LocksContext from '../../contexts/LocksContext'
import { AppLayout } from '../interface/layouts/AppLayout'
import { Scanner } from '../interface/verification/Scanner'
import VerificationStatus from '../interface/VerificationStatus'
import { useTranslation } from 'next-i18next'

export const VerificationContent: React.FC<unknown> = () => {
  const { query } = useRouter()
  const [locks, setLocks] = useState({})
  const router = useRouter()
  const { t } = useTranslation()

  const membershipVerificationConfig = getMembershipVerificationConfig({
    data: query.data?.toString(),
    sig: query.sig?.toString(),
  })

  if (!membershipVerificationConfig) {
    return (
      <AppLayout title={t("tools.verification.title")} showLinks={false} authRequired={false}>
        <Head>
          <title>{pageTitle(t("tools.verification.title"))}</title>
        </Head>
        <main>
          <Scanner />
        </main>
      </AppLayout>
    )
  }

  const addLock = (lock: any) => {
    return setLocks({
      ...locks,
      [lock.address]: lock,
    })
  }

  return (
    <AppLayout title={t("tools.verification.title")} showLinks={false} authRequired={false}>
      <Head>
        <title>{pageTitle(t("tools.verification.title"))}</title>
      </Head>
      <LocksContext.Provider
        value={{
          locks,
          addLock,
        }}
      >
        <VerificationStatus
          config={membershipVerificationConfig}
          onVerified={() => {
            router.push('/verification')
          }}
        />
      </LocksContext.Provider>
    </AppLayout>
  )
}

export default VerificationContent
