import React, { useState } from 'react'
import { ToastHelper } from '../helpers/toast.helper'
import { Button, Input, Modal } from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useTranslation } from 'next-i18next'

interface ExpireAndRefundProps {
  isOpen: boolean
  lockAddress: string
  keyOwner: string
  tokenId: string
  setIsOpen: (open: boolean) => void
  network: number
}

export const ExpireAndRefundModal: React.FC<ExpireAndRefundProps> = ({
  isOpen,
  lockAddress,
  keyOwner,
  tokenId,
  setIsOpen,
  network,
}) => {
  const { getWalletService } = useAuth()
  const [refundAmount, setRefundAmount] = useState(0)
  const [loading, setLoading] = useState(false)

  const { t } = useTranslation()

  const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRefundAmount(parseFloat(e.target.value))
  }

  const onCloseCallback = () => {
    setIsOpen(false)
    setLoading(false)
  }

  const onExpireAndRefund = async () => {
    const amount = `${refundAmount}`
    setLoading(true)

    try {
      const walletService = await getWalletService(network)
      await walletService.expireAndRefundFor({
        lockAddress,
        keyOwner,
        tokenId,
        amount,
      })
      onCloseCallback()
      ToastHelper.success(t("events.cancel.success"))
      // reload page to show updated list of keys
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      onCloseCallback()
      ToastHelper.error(
        err?.error?.message ??
        err?.message ??
        t("events.cancel.error")
      )
    }
  }

  return (
    <Modal isOpen={isOpen} setIsOpen={onCloseCallback}>
      <div className="flex flex-col gap-3">
        <p className="text-sm">{t("events.cancel.title")}</p>
        <Input
          className="my-2 text-right"
          type="number"
          step="any"
          value={refundAmount}
          onChange={onAmountChange}
          min={0}
          disabled={loading}
        />
        <Button
          type="button"
          onClick={onExpireAndRefund}
          disabled={loading}
          loading={loading}
        >
          {t("events.cancel.btn")}
        </Button>
      </div>
    </Modal>
  )
}
