import React from 'react'
import type { NextPage } from 'next'
import { CheckoutPage } from '~/components/interface/checkout'
import BrowserOnly from '~/components/helpers/BrowserOnly'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Checkout: NextPage = () => {
  return (
    <BrowserOnly>
      <CheckoutPage />
    </BrowserOnly>
  )
}

export default Checkout
