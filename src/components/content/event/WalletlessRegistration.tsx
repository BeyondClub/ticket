import { z } from 'zod'
import { useClaim } from '~/hooks/useClaim'
import { ethers } from 'ethers'

import ReCaptcha from 'react-google-recaptcha'

import {
  Button,
  Input,
  AddressInput,
  isAddressOrEns,
  Modal,
} from '@unlock-protocol/ui'
import { useAuth } from '~/contexts/AuthenticationContext'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useEffect, useRef, useState } from 'react'
import { useConfig } from '~/utils/withConfig'
import { MintingScreen } from '~/components/interface/checkout/main/Minting'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { TransactionStatus } from '~/components/interface/checkout/main/checkoutMachine'
import { onResolveName } from '~/utils/resolvers'
import { RiCloseLine as CloseIcon } from 'react-icons/ri'
import { useValidKey } from '~/hooks/useKey'
import { useTranslation } from 'next-i18next'

// TODO: once we have saved checkout config, use the metadata fields from there.
// In the meantime, use email + wallet address
const rsvpForm = z.object({
  email: z
    .string({
      description: 'Email address that will receive the QR code.',
    })
    .default(''),
  recipient: z
    .string({
      description: 'Wallet that will receive the ticket NFT.',
    })
    .default(''),
  fullname: z
    .string({
      description: 'Full name of the attendee.',
    })
    .default(''),
})

type RsvpFormProps = z.infer<typeof rsvpForm>

interface WalletlessRegistrationProps {
  lockAddress: string
  network: number
  handleClose: () => void
  claimResult: any
}

interface FormProps {
  lockAddress: string
  network: number
  disabled: boolean
}

const WalletlessRegistrationClaiming = ({
  lockAddress,
  network,
  handleClose,
  claimResult,
}: WalletlessRegistrationProps) => {
  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('PROCESSING')

  const config = useConfig()
  const { t } = useTranslation()

  useEffect(() => {
    if (
      ['ERROR', 'FINISHED'].includes(transactionStatus as string) ||
      !claimResult?.hash
    ) {
      return
    }
    const waitForConfirmation = async () => {
      const provider = new ethers.providers.JsonRpcBatchProvider(
        config.networks[network].provider
      )

      const transaction = await provider.waitForTransaction(
        claimResult?.hash,
        2
      )

      if (transaction.status !== 1) {
        setTransactionStatus('ERROR')
      } else {
        setTransactionStatus('FINISHED')
      }
    }
    waitForConfirmation()
  }, [transactionStatus, network, claimResult?.hash, config.networks])

  return (
    <div className="bg-white z-10 shadow-xl max-w-md rounded-xl flex flex-col w-full h-[90vh] sm:h-[35rem] max-h-[42rem] p-4">
      <div className="flex">
        {transactionStatus === 'FINISHED' && (
          <p className="mt-10 text-lg font-bold text-center">
            {t("events.walletlessReg.success")}
          </p>
        )}
        <CloseIcon
          className="ml-auto cursor-pointer fill-black group-hover:fill-brand-ui-primary hover:text-brand-ui-primary"
          size={24}
          onClick={() => handleClose()}
        />
      </div>

      {claimResult && transactionStatus && (
        <div className="m-auto mt-20 h-72 mb-36">
          <MintingScreen
            mint={{
              status: transactionStatus,
              transactionHash: claimResult.hash,
            }}
            owner={claimResult.owner}
            lockName={''}
            lockAddress={lockAddress}
            network={network}
          />
        </div>
      )}
    </div>
  )
}

export const WalletlessRegistrationForm = ({
  lockAddress,
  network,
  disabled,
}: FormProps) => {
  const [claimResult, setClaimResult] = useState<any>()
  const [isClaimOpen, setClaimOpen] = useState(false)
  const config = useConfig()
  const recaptchaRef = useRef<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const { account } = useAuth()
  const { mutateAsync: claim } = useClaim({
    lockAddress,
    network,
  })
  const { t } = useTranslation()

  const { refetch } = useValidKey({
    lockAddress,
    network,
  })

  const localForm = useForm<RsvpFormProps>({
    mode: 'onChange',
    defaultValues: {
      email: '',
      recipient: account || '',
      fullname: '',
    },
  })
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = localForm

  const { recipient = '' } = useWatch({
    control,
  })

  const onSubmit = async ({ email, recipient, fullname }: RsvpFormProps) => {
    setLoading(true)
    try {
      const captcha = await recaptchaRef.current?.executeAsync()
      const { hash, owner } = await claim({
        metadata: {
          fullname,
        },
        email,
        recipient,
        captcha,
      })
      setClaimResult({ hash, owner })
      setClaimOpen(true)
      ToastHelper.success(t("events.walletlessReg.txSuccess"))
    } catch (error) {
      console.error(error)
      ToastHelper.error(
        t("events.walletlessReg.txFail")
      )
    }
    setLoading(false)
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col w-full gap-6 py-4"
    >
      <Modal isOpen={isClaimOpen} setIsOpen={setClaimOpen} empty={true}>
        <WalletlessRegistrationClaiming
          lockAddress={lockAddress}
          network={network}
          handleClose={() => {
            setClaimOpen(false)
            refetch()
          }}
          claimResult={claimResult}
        />
      </Modal>
      <ReCaptcha
        ref={recaptchaRef}
        sitekey={config.recaptchaKey}
        size="invisible"
        badge="bottomleft"
      />
      <Input
        {...register('email', {
          required: {
            value: true,
            message: t("common.fieldRequired"),
          },
        })}
        disabled={disabled}
        required
        type="email"
        placeholder="your@email.com"
        label={t("events.walletlessReg.email.title")}
        description={
          t("events.walletlessReg.email.desc")
        }
        error={errors?.email?.message}
      />
      <Input
        {...register('fullname', {
          required: {
            value: true,
            message: t("common.fieldRequired"),
          },
        })}
        disabled={disabled}
        required
        placeholder="Satoshi Nakamoto"
        label={t("events.walletlessReg.name.title")}
        description={
          t("events.walletlessReg.name.desc")
        }
        error={errors?.fullname?.message}
      />
      <Controller
        name="recipient"
        control={control}
        rules={{
          validate: (address: string) => {
            return !address || isAddressOrEns(address)
          },
        }}
        render={() => {
          return (
            <AddressInput
              optional
              value={recipient}
              withIcon
              placeholder="0x..."
              label={t("events.walletlessReg.wallet.title")}
              onChange={(value: any) => {
                setValue('recipient', value)
              }}
              disabled={disabled}
              description={t("events.walletlessReg.wallet.desc")}
              onResolveName={onResolveName}
            />
          )
        }}
      />
      <Button disabled={loading || disabled} loading={loading} type="submit">
        {t("events.walletlessReg.rsvp")}
      </Button>
    </form>
  )
}
