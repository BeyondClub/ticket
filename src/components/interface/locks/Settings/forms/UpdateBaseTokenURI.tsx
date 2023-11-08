import { useMutation, useQuery } from '@tanstack/react-query'
import { Input, Button } from '@unlock-protocol/ui'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UpdateBaseTokenURIProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface FormProps {
  baseTokenURI: string
}

const validate = (val: string) => {
  return val.endsWith('/')
}

export const UpdateBaseTokenURI = ({
  lockAddress,
  network,
  disabled,
  isManager,
}: UpdateBaseTokenURIProps) => {
  const web3Service = useWeb3Service()
  const { getWalletService } = useAuth()
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = useForm<FormProps>()
  const { t } = useTranslation()

  const getTokenURI = async () => {
    return await web3Service.tokenURI(
      lockAddress,
      '0' /* get base tokenURI without extra parameters o token ID*/,
      network
    )
  }

  const setBaseTokenURI = async (fields: FormProps) => {
    const walletService = await getWalletService(network)
    await walletService.setBaseTokenURI({
      lockAddress,
      baseTokenURI: fields.baseTokenURI,
    })
  }

  const setBaseTokenURIMutation = useMutation(setBaseTokenURI)

  const onSetBaseTokenURI = async (fields: FormProps) => {
    const setBaseTokenURIPromise = setBaseTokenURIMutation.mutateAsync(fields)
    await ToastHelper.promise(setBaseTokenURIPromise, {
      error: t("events.settings.general.baseUri.form.error1"),
      success: t("events.settings.general.baseUri.form.success"),
      loading: t("events.settings.general.baseUri.form.loading"),
    })
  }

  const { isLoading: isLoadingTokenURI, data: baseTokenURI } = useQuery(
    ['getTokenURI', lockAddress, network, setBaseTokenURIMutation.isSuccess],
    async () => getTokenURI()
  )

  useEffect(() => {
    setValue('baseTokenURI', baseTokenURI)
  }, [])

  const disabledInput =
    disabled || setBaseTokenURIMutation.isLoading || isLoadingTokenURI
  const isLoading = setBaseTokenURIMutation.isLoading || disabledInput

  return (
    <form
      onSubmit={handleSubmit(onSetBaseTokenURI)}
      className="flex flex-col gap-6"
    >
      <div className="relative">
        <Input
          type="url"
          label={`${t("events.settings.general.baseUri.title")}:`}
          {...register('baseTokenURI', {
            minLength: 1,
            required: true,
            validate,
          })}
          autoComplete="off"
          disabled={disabledInput}
          error={
            errors?.baseTokenURI &&
            t("events.settings.general.baseUri.form.error2")
          }
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={setBaseTokenURIMutation.isLoading || isLoading}
        >
          {t("common.update")}
        </Button>
      )}
    </form>
  )
}
