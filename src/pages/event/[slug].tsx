import React from 'react'
import { EventContentWithProps } from '~/components/content/EventContent'
import { storage } from '~/config/storage'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

interface Params {
  params: {
    slug: string
  },
  locale: string
}

interface EventPageProps {
  pageProps: {
    lockAddress: string
    network: number
    metadata?: any
  }
}

export const getServerSideProps = async ({ params, locale }: Params) => {
  const { data: lockSettings } = await storage.getLockSettingsBySlug(
    params.slug
  )
  if (lockSettings?.network && lockSettings?.lockAddress) {
    const lockMetadataResponse = await storage.lockMetadata(
      lockSettings.network,
      lockSettings.lockAddress
    )
    return {
      props: {
        lockAddress: lockSettings?.lockAddress,
        network: lockSettings?.network,
        metadata: lockMetadataResponse?.data,
        ...(await serverSideTranslations(locale)),
      },
    }
  }

  return {
    props: {
      lockAddress: lockSettings?.lockAddress,
      network: lockSettings?.network,
      ...(await serverSideTranslations(locale)),
    },
  }
}

const EventPage = (p: EventPageProps) => {
  const { lockAddress, network, metadata } = p.pageProps
  return (
    <EventContentWithProps
      lockAddress={lockAddress}
      network={network}
      metadata={metadata}
    ></EventContentWithProps>
  )
}

export default EventPage
