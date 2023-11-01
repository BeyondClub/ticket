import React from 'react'
import NewEventContent from '~/components/content/event/NewEvent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const NewEvent = () => <NewEventContent />

export default NewEvent
