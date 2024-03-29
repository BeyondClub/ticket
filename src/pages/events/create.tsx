import React from 'react'
import type { NextPage } from 'next'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import CreateLockPage from '~/components/interface/locks/Create'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}

const Create: NextPage = () => {
  return (
    <BrowserOnly>
      <AppLayout>
        <CreateLockPage />
      </AppLayout>
    </BrowserOnly>
  )
}

export default Create
