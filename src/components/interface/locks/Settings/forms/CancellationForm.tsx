import { useMutation, useQueries } from '@tanstack/react-query'
import { Button, Input, Placeholder, ToggleSwitch } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useWeb3Service } from '~/utils/withWeb3Service'
import { SettingCardDetail } from '../elements/SettingCard'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useTranslation } from 'next-i18next'

interface CancellationFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  freeTrialLength: number
  refundPenaltyPercentage: number
}

const CancellationFormPlaceholder = () => {
  const FormPlaceholder = () => {
    return (
      <Placeholder.Root spaced="sm">
        <Placeholder.Line size="sm" width="sm" />
        <Placeholder.Line size="sm" />
        <Placeholder.Line size="sm" width="md" />
        <Placeholder.Root inline className="justify-between">
          <Placeholder.Line size="sm" width="sm" />
          <Placeholder.Line size="sm" width="sm" />
        </Placeholder.Root>
      </Placeholder.Root>
    )
  }
  return (
    <div className="flex flex-col gap-12">
      <FormPlaceholder />
      <FormPlaceholder />
    </div>
  )
}

export const CancellationForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: CancellationFormProps) => {
  const [allowTrial, setAllowTrial] = useState(false)
  const [cancelPenalty, setCancelPenalty] = useState(false)
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { isValid, errors },
  } = useForm<FormProps>()
  const { t } = useTranslation()

  const updateRefundPenalty = async ({
    freeTrialLength = 0,
    refundPenaltyPercentage = 0,
  }: FormProps) => {
    const refundPenaltyBasisPoints = refundPenaltyPercentage * 100 // convert to basis points
    const walletService = await getWalletService(network)
    await walletService.updateRefundPenalty({
      lockAddress,
      freeTrialLength,
      refundPenaltyBasisPoints,
    })
  }

  const updateRefundPenaltyMutation = useMutation(updateRefundPenalty)

  const onUpdateRefundPenalty = async (fields: FormProps) => {
    if (isValid) {
      const updateRefundPenaltyPromise =
        updateRefundPenaltyMutation.mutateAsync(fields)

      await ToastHelper.promise(updateRefundPenaltyPromise, {
        loading: t("events.settings.memTerms.cancellation.form.loading"),
        success: t("events.settings.memTerms.cancellation.form.success"),
        error:
          t("events.settings.memTerms.cancellation.form.error1"),
      })
    } else {
      ToastHelper.error('Form is not valid.')
    }
  }

  const getFreeTrialLength = async () => {
    return await web3Service.freeTrialLength({
      lockAddress,
      network,
    })
  }

  const getRefundPenaltyBasisPoints = async () => {
    return await web3Service.refundPenaltyBasisPoints({
      lockAddress,
      network,
    })
  }

  const [
    { isLoading: isLoadingFreeTrial, data: freeTrialLength = 0 },
    { isLoading: isLoadingPenalty, data: refundPenaltyBasisPoints = 0 },
  ] = useQueries({
    queries: [
      {
        queryFn: async () => getFreeTrialLength(),
        onError: () => {
          ToastHelper.error(t("events.settings.memTerms.cancellation.form.error2"))
        },
        queryKey: [
          'getFreeTrialLength',
          lockAddress,
          network,
          updateRefundPenaltyMutation.isSuccess,
        ],
      },
      {
        queryFn: async () => getRefundPenaltyBasisPoints(),
        onError: () => {
          ToastHelper.error(
            t("events.settings.memTerms.cancellation.form.error3")
          )
        },
        queryKey: [
          'refundPenaltyBasisPoints',
          lockAddress,
          network,
          updateRefundPenaltyMutation.isSuccess,
        ],
      },
    ],
  })

  useEffect(() => {
    const allowTrial = freeTrialLength > 0

    setAllowTrial(freeTrialLength > 0)
    setValue('freeTrialLength', allowTrial ? freeTrialLength ?? 0 : 0, {
      shouldValidate: true,
    })
  }, [freeTrialLength])

  useEffect(() => {
    const cancelPenalty = refundPenaltyBasisPoints > 0
    const refundPenaltyPercentage = (refundPenaltyBasisPoints ?? 0) / 100 // convert basis points to percentage
    setCancelPenalty(cancelPenalty)

    setValue(
      'refundPenaltyPercentage',
      cancelPenalty ? refundPenaltyPercentage : 0,
      {
        shouldValidate: true,
      }
    )
  }, [refundPenaltyBasisPoints])

  const isLoading = isLoadingPenalty || isLoadingFreeTrial

  const disabledInput = updateRefundPenaltyMutation.isLoading || disabled

  if (isLoading) return <CancellationFormPlaceholder />

  return (
    <form
      className="flex flex-col gap-12"
      onSubmit={handleSubmit(onUpdateRefundPenalty)}
    >
      <div className="flex flex-col gap-6">
        <SettingCardDetail
          title={t("events.settings.memTerms.cancellation.allow.title")}
          description={t("events.settings.memTerms.cancellation.allow.desc")}
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-base">{t("events.settings.memTerms.cancellation.allow.freeTrial")}</span>
            <ToggleSwitch
              disabled={disabledInput}
              enabled={allowTrial}
              setEnabled={setAllowTrial}
            />
          </div>

          <Input
            type="number"
            disabled={disabledInput || !allowTrial}
            step={1}
            error={errors?.freeTrialLength && t("events.settings.memTerms.cancellation.allow.error")}
            {...register('freeTrialLength', {
              valueAsNumber: true,
              required: true,
              min: 0,
            })}
          />
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <SettingCardDetail
          title={t("events.settings.memTerms.cancellation.cancel.title")}
          description={t("events.settings.memTerms.cancellation.cancel.desc")}
        />
        <div className="relative">
          <div className="flex items-center justify-between">
            <span className="text-base">{t("events.settings.memTerms.cancellation.cancel.penalty")}</span>
            <ToggleSwitch
              disabled={disabledInput}
              enabled={cancelPenalty}
              setEnabled={setCancelPenalty}
            />
          </div>
          <Input
            type="number"
            disabled={disabledInput || !cancelPenalty}
            step={1}
            error={
              errors?.refundPenaltyPercentage &&
              t("events.settings.memTerms.cancellation.cancel.error")
            }
            {...register('refundPenaltyPercentage', {
              valueAsNumber: true,
              required: true,
              min: 0,
              max: 100,
            })}
          />
        </div>
      </div>
      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          loading={updateRefundPenaltyMutation.isLoading}
          disabled={disabledInput}
        >
          {t("common.apply")}
        </Button>
      )}
    </form>
  )
}
