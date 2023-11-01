import React from 'react'
import { HomeContent } from '../components/content/HomeContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}

const Home = () => {

  return (
    <HomeContent />
  )
}

export default Home
