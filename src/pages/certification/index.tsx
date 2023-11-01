import React from 'react'
import CertificationContent from '~/components/content/certification/CertificationContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Certification = () => <CertificationContent />

export default Certification
