import React, { useContext } from 'react'
import { Item } from './styles'
import { AuthenticationContext } from '../../../contexts/AuthenticationContext'
import useEns from '../../../hooks/useEns'
import { useTranslation } from 'next-i18next'

export const AccountInfo = () => {
  const { account, email } = useContext(AuthenticationContext)
  const name = useEns(account || '')
  const { t } = useTranslation()

  return (
    <div className="grid max-w-4xl gap-4 grid-cols-[repeat(12,[col-start]_1fr)">
      <div className="col-span-12 text-base font-bold leading-5">{t("wallet.acc")}</div>
      {email && (
        <Item title={t("common.email")} count="half">
          <span className="flex h-5 mx-1 my-3 text-black">{email}</span>
        </Item>
      )}
      <Item title={t("common.walletAddress")} count="half">
        <span className="flex h-5 mx-1 my-3 text-black">{name}</span>
      </Item>
    </div>
  )
}
export default AccountInfo
