import React from 'react'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import { useTranslation } from 'next-i18next'
interface KeyPriceProps {
  price?: number
  symbol?: string
}

export const KeyPrice = ({ price, symbol = '' }: KeyPriceProps) => {
  const { t } = useTranslation()
  if (price == undefined) return null
  const keyPrice = price ? parseFloat(`${price}`)?.toFixed(2) : null

  const isFree = price == 0

  return (
    <div className="flex items-center gap-2">
      <CryptoIcon symbol={symbol} />
      <span className="text-xl font-bold">{isFree ? t("common.free") : keyPrice}</span>
    </div>
  )
}
