import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Input } from '@unlock-protocol/ui'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useWeb3Service } from '~/utils/withWeb3Service'

interface UpdateSymbolFormProps {
  disabled: boolean
  isManager: boolean
  lockAddress: string
  network: number
}

interface FormProps {
  symbol: string
}

export const UpdateSymbolForm = ({
  disabled,
  isManager,
  lockAddress,
  network,
}: UpdateSymbolFormProps) => {
  const { getWalletService } = useAuth()
  const web3Service = useWeb3Service()
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { isValid, errors },
  } = useForm<FormProps>({
    defaultValues: {
      symbol: '',
    },
  })
  const { t } = useTranslation()

  const getSymbol = async () => {
    return await web3Service.getTokenSymbol(lockAddress, network)
  }

  const changeSymbol = async (symbol: string) => {
    const walletService = await getWalletService(network)
    return await walletService.updateLockSymbol({
      lockAddress,
      symbol,
    })
  }

  const changeSymbolMutation = useMutation(changeSymbol)

  const { isLoading } = useQuery(
    ['getSymbol', lockAddress, network, changeSymbolMutation.isSuccess],
    async () => getSymbol(),
    {
      onSuccess: (symbol: string) => {
        setValue('symbol', symbol)
      },
      onError: () => {
        ToastHelper.error(t("events.settings.general.ticker.form.error2"))
      },
    }
  )

  const onChangeSymbol = async ({ symbol }: FormProps) => {
    if (!isManager) return
    if (isValid) {
      const changeSymbolPromise = changeSymbolMutation.mutateAsync(symbol)
      await ToastHelper.promise(changeSymbolPromise, {
        loading: t("events.settings.general.ticker.form.loading"),
        success: t("events.settings.general.ticker.form.success"),
        error: t("events.settings.general.ticker.form.error1"),
      })
    } else {
      ToastHelper.error(t("common.formNotValid"))
      reset()
    }
  }

  const disabledInput = disabled || changeSymbolMutation.isLoading || isLoading

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={handleSubmit(onChangeSymbol)}
    >
      <div className="relative">
        <Input
          {...register('symbol', {
            minLength: 1,
            required: true,
          })}
          autoComplete="off"
          disabled={disabledInput}
          error={
            errors?.symbol && 'Lock symbol should have at least 1 character.'
          }
        />
      </div>

      {isManager && (
        <Button
          type="submit"
          className="w-full md:w-1/3"
          disabled={disabledInput}
          loading={changeSymbolMutation.isLoading || isLoading}
        >
          {t("common.update")}
        </Button>
      )}
    </form>
  )
}
