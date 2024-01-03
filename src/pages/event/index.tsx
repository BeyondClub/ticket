import React from 'react'
import { EventContent, EventContentWithProps } from '~/components/content/EventContent'
import { storage } from '~/config/storage'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

interface Params {
  query: {
    lockAddress: string
    network: string
  },
  locale: string
}

interface EventPageProps {
  pageProps: {
    lockAddress: string
    network: string
    metadata?: any
  }
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}

const EventPage = (p: EventPageProps) => {
  return (
    <EventContent />
  )
}

// export const getServerSideProps = async ({ query, locale }: Params) => {
//   if (!(query.lockAddress && query.network)) {
//     return {
//       redirect: {
//         destination: '/events',
//         permanent: false,
//       },
//     }
//   }

//   const lockSettings = {
//     network: query.network,
//     lockAddress: query.lockAddress
//   }
//   if (lockSettings?.network && lockSettings?.lockAddress) {
//     const lockMetadataResponse = await storage.lockMetadata(
//       parseInt(lockSettings.network),
//       lockSettings.lockAddress
//     )
//     return {
//       props: {
//         lockAddress: lockSettings?.lockAddress,
//         network: lockSettings?.network,
//         metadata: lockMetadataResponse?.data,
//         ...(await serverSideTranslations(locale)),
//       },
//     }
//   }

//   return {
//     props: {
//       lockAddress: lockSettings?.lockAddress,
//       network: lockSettings?.network,
//       ...(await serverSideTranslations(locale)),
//     },
//   }
// }

// const EventPage = (p: EventPageProps) => {
//   const { lockAddress, network, metadata } = p.pageProps
//   return (
//     <EventContentWithProps
//       lockAddress={lockAddress}
//       network={parseInt(network)}
//       metadata={metadata}
//     ></EventContentWithProps>
//   )
// }

export default EventPage
