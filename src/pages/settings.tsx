import React from 'react'
import SettingsContent from '../components/content/SettingsContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Settings = () => <SettingsContent />

export default Settings
