import React from 'react'
import EventContent from '../components/content/EventContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Event = () => <EventContent />

export default Event
