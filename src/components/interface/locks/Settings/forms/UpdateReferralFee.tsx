import {
  Button,
  Input,
  ToggleSwitch,
  Card,
  AddressInput,
} from '@unlock-protocol/ui'
import { ethers } from 'ethers'
import Image from 'next/image'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { ToastHelper } from '~/components/helpers/toast.helper'
import LoadingIcon from '~/components/interface/Loading'
import { useReferrerFee } from '~/hooks/useReferrerFee'
import { onResolveName } from '~/utils/resolvers'

interface UpdateReferralFeeProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  referralFeePercentage: number
  referralAddress: string
}

const zeroAddress = ethers.constants.AddressZero

export const UpdateReferralFee = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: UpdateReferralFeeProps) => {
  const [isReferralAddressToggled, setIsReferralAddressToggled] =
    useState(false)
  const { t } = useTranslation()

  const {
    watch,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormProps>({
    defaultValues: { referralFeePercentage: 0, referralAddress: '' },
  })

  const {
    data: referralFees,
    isLoading,
    isSettingReferrerFee,
    setReferrerFee,
    refetch,
  } = useReferrerFee({
    lockAddress,
    network,
  })

  const onSubmit = async (fields: FormProps) => {
    const setReferrerFeePromise = setReferrerFee.mutateAsync({
      ...fields,
      referralAddress: referralAddress || zeroAddress,
    })

    await ToastHelper.promise(setReferrerFeePromise, {
      loading: t("events.settings.advanced.referral.set.loading"),
      error: t("events.settings.advanced.referral.set.error"),
      success: t("events.settings.advanced.referral.set.success"),
    })

    reset()
  }

  const referralAddress = watch('referralAddress', '')
  const referralFeePercentage = watch('referralFeePercentage', 0)

  const isValidAddress = ethers.utils.isAddress(referralAddress)

  const isDisabledReferrerInput = disabled || isSettingReferrerFee || isLoading

  return (
    <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-2">
        <ToggleSwitch
          title={t("events.settings.advanced.referral.toggle.title")}
          description={t("events.settings.advanced.referral.toggle.desc")}
          enabled={isReferralAddressToggled}
          disabled={isDisabledReferrerInput}
          setEnabled={(enabled: boolean) => {
            if (referralAddress && !enabled) {
              setValue('referralAddress', '')
            }

            setIsReferralAddressToggled(enabled)
          }}
        />

        {isReferralAddressToggled ? (
          <AddressInput
            label=""
            value={referralAddress}
            disabled={isDisabledReferrerInput || !isReferralAddressToggled}
            onChange={(value: any) => {
              setValue('referralAddress', value)
            }}
            error={errors?.referralAddress?.message}
            onResolveName={onResolveName}
          />
        ) : null}
      </div>

      <div className="grid gap-2">
        <span className="text-base semibold">{t("events.settings.advanced.referral.fee")}</span>

        <Input
          type="number"
          {...register('referralFeePercentage', {
            valueAsNumber: true,
            min: 1,
            max: 100,
          })}
          error={
            errors?.referralFeePercentage &&
            t("events.settings.advanced.referral.formErr")
          }
          disabled={isDisabledReferrerInput}
        />
      </div>

      {isManager && (
        <Button
          className="w-full md:w-1/3"
          type="submit"
          disabled={
            isDisabledReferrerInput ||
            !referralFeePercentage ||
            (isReferralAddressToggled && !referralAddress) ||
            !!(referralAddress && !isValidAddress)
          }
          loading={isSettingReferrerFee}
        >
          {t("common.apply")}
        </Button>
      )}

      <div className="flex flex-col mt-5 items-start">
        <div className="flex items-center justify-between w-full">
          <Card.Title>{t("events.settings.advanced.referral.referrers")} ({referralFees.length})</Card.Title>

          {!isLoading ? (
            <Button
              className="w-full max-w-[120px]"
              type="button"
              onClick={() => {
                refetch()
              }}
              iconLeft={
                <Image
                  className="justify-self-left"
                  width="20"
                  height="20"
                  alt="Apple Wallet"
                  src={`/images/illustrations/refresh.svg`}
                />
              }
            >
              {t("common.refresh")}
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <div className="w-full flex items-center justify-center">
            <LoadingIcon />
          </div>
        ) : referralFees.length ? (
          <div className="w-full grid gap-5 grid-cols-1 mt-3">
            {referralFees.map(({ id, referrer, fee }) => {
              const feeNumber = Number(fee)
              const isAddressLinkedToAnyReferrer = referrer === zeroAddress

              return (
                <div
                  key={id}
                  className="w-full overflow-x-auto flex justify-between items-center border border-gray-300 p-3 rounded-xl"
                >
                  <h2 className="text-md font-medium break-words">
                    {isAddressLinkedToAnyReferrer
                      ? t("events.settings.advanced.referral.feeApplied")
                      : referrer}
                  </h2>
                  <h2 className="text-md pl-3 font-medium break-words">
                    ({feeNumber / 100}%)
                  </h2>
                </div>
              )
            })}
          </div>
        ) : (
          <h2 className="text-1xl mt-3 w-full text-center">
            {t("events.settings.advanced.referral.noReferrers")}
          </h2>
        )}
      </div>
    </form>
  )
}
