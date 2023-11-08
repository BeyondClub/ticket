import React from 'react'
import NewCertificationContent from '~/components/content/certification/NewCertification'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const NewCertification = () => <NewCertificationContent />

export default NewCertification
