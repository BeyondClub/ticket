import { NextPage } from 'next'
import { AppLayout } from '~/components/interface/layouts/AppLayout'
import { Transfer } from '~/components/interface/transfer'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const TransferPage: NextPage = () => {
  return (
    <AppLayout>
      <Transfer />
    </AppLayout>
  )
}

export default TransferPage
