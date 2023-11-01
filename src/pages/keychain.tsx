import React from 'react'
import KeychainContent from '../components/content/KeychainContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Keychain = () => <KeychainContent />

export default Keychain
