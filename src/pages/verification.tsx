import React from 'react'
import VerificationContent from '../components/content/VerificationContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Verification = () => <VerificationContent />

export default Verification
