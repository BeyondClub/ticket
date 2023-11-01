import React from 'react'
import { useRouter } from 'next/router'
import RecoverContent from '../components/content/RecoverContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Recover = () => {
  const { query } = useRouter()
  return <RecoverContent query={query} />
}

export default Recover
