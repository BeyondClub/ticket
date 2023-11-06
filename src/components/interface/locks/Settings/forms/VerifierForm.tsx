import { useMutation, useQuery } from '@tanstack/react-query'
import {
  AddressInput,
  Button,
  Placeholder,
  isAddressOrEns,
  minifyAddress,
} from '@unlock-protocol/ui'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { getAddressForName } from '~/hooks/useEns'
import { useState } from 'react'
import { storage } from '~/config/storage'
import { onResolveName } from '~/utils/resolvers'
import { useTranslation } from 'next-i18next'

interface VerifierProps {
  address: string
  createdAt: string
  updatedAt: string
  lockAddress: string
  lockManager: string
  network: number
  id: number
}

interface VerifierFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface VerifierCardProps {
  verifier: VerifierProps
  onDeleteVerifier: (address: string) => Promise<any>
  isLoading?: boolean
  disabled: boolean
}

interface VerifierFormDataProps {
  verifier: string
}

const VerifierCard = ({
  verifier,
  onDeleteVerifier,
  isLoading,
  disabled,
}: VerifierCardProps) => {
  const { account } = useAuth()
  const { t } = useTranslation()

  const isCurrentAccount =
    account?.toLowerCase() === verifier?.address?.toLowerCase()

  const address = verifier.address

  return (
    <div className="flex flex-col items-center justify-between px-4 py-2 border border-gray-200 rounded-lg md:flex-row">
      <div className="flex flex-col gap-2 ">
        <span className="text-base text-brand-dark">{address}</span>
        {isCurrentAccount && (
          <span className="text-sm font-semibold text-brand-ui-primary">
            {t("events.settings.roles.evntMgr.thatsYou")}
          </span>
        )}
      </div>
      {isCurrentAccount && (
        <Button
          size="small"
          variant="outlined-primary"
          onClick={() => onDeleteVerifier(address)}
          disabled={isLoading || disabled}
        >
          {t("common.remove")}
        </Button>
      )}
    </div>
  )
}

export const VerifierForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: VerifierFormProps) => {
  const [verifiers, setVerifiers] = useState<VerifierProps[]>([])
  const { t } = useTranslation()

  const localForm = useForm<VerifierFormDataProps>()

  const { handleSubmit, control, setValue } = localForm

  const { verifier } = useWatch({
    control,
  })

  const getVerifiers = async () => {
    const response = await storage.verifiers(network, lockAddress)
    return response.data.results || []
  }

  const addVerifier = async (address: string) => {
    const resolvedAddress = await getAddressForName(address)
    const response = await storage.createVerifier(
      network,
      lockAddress,
      resolvedAddress
    )
    return response.data
  }

  const deleteVerifier = async (address: string) => {
    const response = await storage.deleteVerifier(network, lockAddress, address)
    return response.data.results
  }

  const addVerifierMutation = useMutation(addVerifier, {
    onSuccess: (res: any) => {
      if (res?.message) {
        ToastHelper.error(res?.message)
      } else {
        ToastHelper.success(t("events.settings.roles.verifier.add.success"))
        setValue('verifier', '')
      }
    },
    onError: (err: any) => {
      ToastHelper.error(
        err?.error ??
        t("events.settings.roles.verifier.add.error")
      )
    },
  })

  const deleteVerifierMutation = useMutation(deleteVerifier, {
    onSuccess: (res: any, verifier: string) => {
      if (res?.message) {
        ToastHelper.error(res?.message)
      } else {
        ToastHelper.success(`${minifyAddress(verifier)} ${t("events.settings.roles.verifier.delSuccess")}`)
      }
    },
  })

  const { isLoading: isLoadingItems } = useQuery(
    [
      'getVerifiers',
      lockAddress,
      network,
      addVerifierMutation.isSuccess,
      deleteVerifierMutation.isSuccess,
    ],
    async () => await getVerifiers(),
    {
      enabled: isManager,
      refetchInterval: false,
      onSuccess: (verifiers: VerifierProps[]) => {
        setVerifiers(verifiers)
      },
      onError: (err: any) => {
        ToastHelper.error(
          err?.error ??
          t("events.settings.roles.verifier.loadErr")
        )
      },
    }
  )

  const onAddVerifier = async ({ verifier }: VerifierFormDataProps) => {
    await addVerifierMutation.mutateAsync(verifier)
  }

  const onDeleteVerifier = async (address: string) => {
    await deleteVerifierMutation.mutateAsync(address)
  }

  const isLoading =
    isLoadingItems ||
    addVerifierMutation.isLoading ||
    deleteVerifierMutation.isLoading

  const noVerifiers = verifiers?.length === 0

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {noVerifiers && !isLoading && (
          <span>
            {isManager
              ? t("events.settings.roles.verifier.noVerifier")
              : t("events.settings.roles.verifier.noAccess")}
          </span>
        )}
        {!noVerifiers && !isLoading && (
          <div className="grid gap-1">
            <span className="font-semibold">{t("events.settings.roles.verifier.verifiers")}</span>
            <div className="grid gap-2">
              {(verifiers ?? [])?.map((verifier: VerifierProps) => (
                <VerifierCard
                  verifier={verifier}
                  key={verifier.id}
                  onDeleteVerifier={onDeleteVerifier}
                  isLoading={deleteVerifierMutation.isLoading}
                  disabled={disabled}
                />
              ))}
            </div>
          </div>
        )}

        {(isLoadingItems || addVerifierMutation.isLoading) &&
          !deleteVerifierMutation.isLoading && <Placeholder.Line size="xl" />}
      </div>
      {isManager && (
        <form
          className="flex flex-col gap-6 mt-8"
          onSubmit={handleSubmit(onAddVerifier)}
        >
          <div className="flex flex-col gap-2">
            <Controller
              name="verifier"
              control={control}
              rules={{
                required: true,
                validate: isAddressOrEns,
              }}
              render={() => {
                return (
                  <>
                    <AddressInput
                      withIcon
                      value={verifier}
                      disabled={disabled}
                      label={t("events.settings.roles.verifier.add.title")}
                      autoComplete="off"
                      onChange={(value: any) => {
                        setValue('verifier', value)
                      }}
                      onResolveName={onResolveName}
                    />
                  </>
                )
              }}
            />
          </div>
          <Button
            type="submit"
            className="w-full md:w-1/2"
            disabled={isLoading || disabled}
            loading={addVerifierMutation.isLoading}
          >
            {t("common.add")}
          </Button>
        </form>
      )}
    </div>
  )
}
