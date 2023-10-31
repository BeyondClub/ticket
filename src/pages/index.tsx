import React from 'react'
import { HomeContent } from '../components/content/HomeContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { LanguageContext } from '~/contexts/LanguageContext'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}

const Home = (props) => {
  const { t } = useTranslation()

  return (
    <LanguageContext.Provider value={{ t }}>
      <HomeContent />
    </LanguageContext.Provider>
  )
}

export default Home
