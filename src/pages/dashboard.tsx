import React from 'react'
import DashboardContent from '../components/content/DashboardContent'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale)),
    },
  }
}


const Dashboard = () => <DashboardContent />

export default Dashboard
