import React, { useEffect } from 'react'

import Head from 'next/head'
import { pageTitle } from '../../constants'
import { useRouter } from 'next/router'
import { AppLayout } from '../interface/layouts/AppLayout'
import LoadingIcon from '../interface/Loading'
import EventDetails from './event/EventDetails'
import { useRouterQueryForLockAddressAndNetworks } from '~/hooks/useRouterQueryForLockAddressAndNetworks'
import { useMetadata } from '~/hooks/metadata'
import { useTranslation } from 'next-i18next'

export const EventContent = () => {
  const {
    lockAddress,
    network,
    isLoading: isLoadingQuery,
  } = useRouterQueryForLockAddressAndNetworks()
  const { data: metadata, isInitialLoading: isMetadataLoading } = useMetadata({
    lockAddress,
    network,
  })
  const isLoading = isLoadingQuery || isMetadataLoading
  return EventContentWithProps({ lockAddress, network, isLoading, metadata })
}

interface EventContentWithPropsProps {
  lockAddress: string
  network: number
  metadata?: any
  isLoading?: boolean
}

export const EventContentWithProps = ({
  lockAddress,
  network,
  isLoading,
  metadata,
}: EventContentWithPropsProps) => {
  const router = useRouter()
  const { t } = useTranslation()

  useEffect(() => {
    if (router.isReady && !(router.query.lockAddress && router.query.network)) {
      router.replace('/events')
    }
  }, [router])

  if (isLoading || !metadata) {
    return <LoadingIcon />
  }

  return (
    <AppLayout
      showFooter={!metadata}
      showLinks={false}
      authRequired={false}
      logoRedirectUrl="/event"
      logoImageUrl="/images/svg/logo-beyondclub.svg"
    >
      <Head>
        <title>{pageTitle(metadata.name, t)}</title>
        <meta name="description" content={metadata.description} />
      </Head>
      {!!metadata && lockAddress && network && (
        <EventDetails
          metadata={metadata}
          lockAddress={lockAddress}
          network={network}
        />
      )}
    </AppLayout>
  )
}

export default EventContent
