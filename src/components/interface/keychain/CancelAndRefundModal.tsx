import { Button, Modal, Placeholder } from '@unlock-protocol/ui'
import React from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { ToastHelper } from '../../helpers/toast.helper'
import { useKeychain } from '~/hooks/useKeychain'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useTranslation } from 'next-i18next'

export interface CancelAndRefundProps {
  isOpen: boolean
  lock: any
  setIsOpen: (open: boolean) => void
  account: string
  currency: string
  tokenId: string
  network: number
  onExpireAndRefund?: () => void
}

const MAX_TRANSFER_FEE = 10000

export const CancelAndRefundModal = ({
  isOpen,
  lock,
  setIsOpen,
  account: owner,
  currency,
  tokenId,
  network,
  onExpireAndRefund,
}: CancelAndRefundProps) => {
  const { getWalletService } = useAuth()
  const { address: lockAddress, tokenAddress } = lock ?? {}
  const { t } = useTranslation()

  const { getAmounts } = useKeychain({
    lockAddress,
    network: parseInt(`${network}`),
    owner,
    keyId: tokenId,
    tokenAddress,
  })

  const { isInitialLoading: isLoading, data } = useQuery(
    ['getAmounts', lockAddress],
    getAmounts,
    {
      enabled: isOpen, // execute query only when the modal is open
      refetchInterval: false,
      meta: {
        errorMessage:
          t("ticket.options.cancelRefundError.2"),
      },
    }
  )

  const { refundAmount = 0, transferFee = 0, lockBalance = 0 } = data ?? {}

  const cancelAndRefund = async () => {
    const params = {
      lockAddress,
      tokenId,
    }
    const walletService = await getWalletService(network)

    return walletService.cancelAndRefund(
      params,
      {} /** transactionParams */,
      () => true
    )
  }

  const cancelRefundMutation = useMutation(cancelAndRefund, {
    onSuccess: () => {
      ToastHelper.success(t("ticket.options.cancelRefundSuccess"))
      setIsOpen(false)
      if (typeof onExpireAndRefund === 'function') {
        onExpireAndRefund()
      }
    },
    onError: (err: any) => {
      setIsOpen(false)
      ToastHelper.error(
        err?.error?.message ??
        err?.message ??
        t("ticket.options.cancelRefundError.1")
      )
    },
  })

  const hasMaxCancellationFee = Number(transferFee) >= MAX_TRANSFER_FEE
  const isRefundable =
    !hasMaxCancellationFee && refundAmount <= Number(lockBalance)

  const buttonDisabled =
    isLoading || !isRefundable || cancelRefundMutation?.isLoading

  if (!lock) return <span>{t("ticket.options.cancelRefundError.3")}</span>

  return (
    <Modal isOpen={isOpen} setIsOpen={setIsOpen}>
      {isLoading ? (
        <Placeholder.Root>
          <Placeholder.Line width="md" />
          <Placeholder.Line width="sm" size="sm" />
          <Placeholder.Line width="xl" size="sm" />
          <Placeholder.Line size="xl" />
        </Placeholder.Root>
      ) : (
        isOpen && (
          <div className="flex flex-col w-full gap-5">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-left text-black-500">
                {t("ticket.options.cancelRefund")}
              </h3>
              <p className="mt-2 text-md">
                {hasMaxCancellationFee ? (
                  <span>{t("ticket.options.cancelRefundDesc.1")}</span>
                ) : isRefundable ? (
                  <>
                    <span>
                      {currency} {parseFloat(`${refundAmount}`!).toFixed(3)}
                    </span>
                    {` ${t("ticket.options.cancelRefundDesc.2")}`}
                  </>
                ) : (
                  <span>
                    {t("ticket.options.cancelRefundDesc.3")}
                  </span>
                )}
              </p>
            </div>
            <Button
              type="button"
              onClick={() => cancelRefundMutation.mutate()}
              disabled={buttonDisabled}
              loading={cancelRefundMutation.isLoading}
            >
              {cancelRefundMutation.isLoading ? `${t("common.refunding")}...` : t("common.confirm")}
            </Button>
          </div>
        )
      )}
    </Modal>
  )
}
