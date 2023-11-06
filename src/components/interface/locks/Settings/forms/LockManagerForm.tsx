import { useMutation, useQuery } from '@tanstack/react-query'
import {
  Button,
  Input,
  AddressInput,
  isAddressOrEns,
  minifyAddress,
  Placeholder,
} from '@unlock-protocol/ui'
import { SubgraphService } from '@unlock-protocol/unlock-js'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useEffect, useState } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import { onResolveName } from '~/utils/resolvers'
import { useTranslation } from 'next-i18next'
interface LockManagerFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

interface LockManagerCardProps {
  lockAddress: string
  manager: string
  hasMultipleManagers: boolean
  network: number
}

interface RenounceModalFormProps {
  confirm: string
}

interface RenounceModalProps {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  onConfirm: () => Promise<any>
}
const RenounceModal = ({
  isOpen,
  setIsOpen,
  onConfirm,
}: RenounceModalProps) => {
  const [confirmMatch, setConfirmMatch] = useState(false)
  const { register, handleSubmit, watch } = useForm<RenounceModalFormProps>({
    mode: 'all',
    defaultValues: {
      confirm: '',
    },
  })
  const { t } = useTranslation()

  useEffect(() => {
    const subscription = watch((value) =>
      setConfirmMatch(value.confirm?.toLowerCase() === 'renounce')
    )
    return () => subscription.unsubscribe()
  }, [watch])

  const onRenounce = async () => {
    if (!confirmMatch) return
    await onConfirm()
    setIsOpen(false)
  }

  return (
    <>
      <Transition show={isOpen} appear>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setIsOpen(false)
          }}
          open
        >
          <div className="fixed inset-0 bg-opacity-25 backdrop-filter backdrop-blur-sm bg-zinc-500" />
          <Transition.Child
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0 translate-y-1"
          >
            <div className="fixed inset-0 p-6 overflow-y-auto">
              <div className="flex items-center justify-center min-h-full">
                <Dialog.Panel className="w-full max-w-md p-8 bg-white rounded-2xl">
                  <form
                    onSubmit={handleSubmit(onRenounce)}
                    className="flex flex-col gap-6 text-center"
                  >
                    <div className="overflow-hidden bg-center rounded-lg">
                      <img
                        className="object-cover h-40"
                        src="/images/illustrations/img-error.svg"
                        alt="img error"
                      />
                    </div>
                    <div className="flex flex-col gap-4">
                      <h3 className="text-4xl font-bold text-brand-dark">
                        {t("events.settings.roles.evntMgr.renounce.hold")}
                      </h3>
                      <span className="text-base text-brand-dark">
                        {t("events.settings.roles.evntMgr.renounce.desc")}
                      </span>
                    </div>
                    <Input
                      placeholder="renounce"
                      {...register('confirm')}
                      autoComplete="off"
                    />
                    <div className="flex gap-4">
                      <Button
                        className="w-full"
                        variant="outlined-primary"
                        onClick={() => setIsOpen(false)}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        className="w-full"
                        type="submit"
                        disabled={!confirmMatch}
                      >
                        {t("common.confirm")}
                      </Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}

const LockManagerCard = ({
  lockAddress,
  manager,
  hasMultipleManagers,
  network,
}: LockManagerCardProps) => {
  const [renounceModal, setRenounceModal] = useState(false)
  const { account, getWalletService } = useAuth()
  const { t } = useTranslation()

  const isLoggedUser = account?.toLowerCase() === manager?.toLowerCase()

  const renounceLockManager = async () => {
    const walletService = await getWalletService(network)
    return await walletService.renounceLockManager({
      lockAddress,
    })
  }

  const renounceLockManagerMutation = useMutation(renounceLockManager)

  const onRenounce = async () => {
    const renounceLockManagerPromise = renounceLockManagerMutation.mutateAsync()
    await ToastHelper.promise(renounceLockManagerPromise, {
      loading: t("events.settings.roles.evntMgr.renounce.loading"),
      success: `${t("events.settings.roles.evntMgr.renounce.success")} ${minifyAddress(manager)}.`,
      error: `${t("events.settings.roles.evntMgr.renounce.error")} ${minifyAddress(manager)}`,
    })
  }

  const renounce = async () => {
    if (hasMultipleManagers) {
      await onRenounce()
    } else {
      setRenounceModal(true)
    }
  }

  return (
    <>
      <RenounceModal
        isOpen={renounceModal}
        setIsOpen={setRenounceModal}
        onConfirm={onRenounce}
      />
      <div className="flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg">
        <div className="flex flex-col gap-2 ">
          <span className="text-base text-brand-dark">{manager}</span>
          {isLoggedUser && (
            <span className="text-sm font-semibold text-brand-ui-primary">
              {t("events.settings.roles.evntMgr.thatsYou")}
            </span>
          )}
        </div>
        {isLoggedUser && (
          <Button size="small" variant="outlined-primary" onClick={renounce}>
            {t("events.settings.roles.evntMgr.renounce.title")}
          </Button>
        )}
      </div>
    </>
  )
}

export const LockManagerForm = ({
  lockAddress,
  network,
  isManager,
  disabled,
}: LockManagerFormProps) => {
  const localForm = useForm<{ manager: string }>()
  const { t } = useTranslation()

  const { handleSubmit, control, setValue } = localForm
  const { getWalletService } = useAuth()

  const { manager } = useWatch({
    control,
  })

  const getLock = async () => {
    const service = new SubgraphService()
    return await service.lock(
      {
        where: {
          address_in: [lockAddress],
        },
      },
      {
        network,
      }
    )
  }

  const addLockManager = async (address: string) => {
    const managerAddress = minifyAddress(address)
    const walletService = await getWalletService(network)
    const addManagerPromise = walletService.addLockManager({
      lockAddress,
      userAddress: address,
    })
    await ToastHelper.promise(addManagerPromise, {
      loading: `${t("events.settings.roles.evntMgr.add.loading1")} ${managerAddress} ${t("events.settings.roles.evntMgr.add.loading2")}`,
      success: `${managerAddress} ${t("events.settings.roles.evntMgr.add.success")}`,
      error: `${t("events.settings.roles.evntMgr.add.error1")} ${managerAddress} ${t("events.settings.roles.evntMgr.add.error2")}`,
    })
  }

  const addLockManagerMutation = useMutation(addLockManager, {
    onSuccess: () => {
      setValue('manager', '')
    },
  })

  const { isLoading, data: lockSubgraph } = useQuery(
    [
      'getLockManagerForm',
      lockAddress,
      network,
      addLockManagerMutation.isSuccess,
    ],
    async () => getLock(),
    {
      refetchInterval: 2000,
    }
  )

  const onAddLockManager = async ({ manager = '' }: any) => {
    if (manager !== '') await addLockManagerMutation.mutateAsync(manager)
  }

  const managers = lockSubgraph?.lockManagers ?? []

  const noManagers = managers?.length === 0

  const disableInput = disabled || isLoading || addLockManagerMutation.isLoading

  return (
    <div className="relative">
      <div className="flex flex-col gap-4">
        {noManagers && !isLoading && (
          <span className="text-red-500">
            {t("events.settings.roles.evntMgr.noMgr")}
          </span>
        )}
        {managers?.length > 0 && (
          <div className="grid gap-1">
            <span className="font-semibold">{t("events.settings.roles.evntMgr.mgrTitle")}</span>
            <div className="grid gap-2">
              {managers?.map((manager) => (
                <LockManagerCard
                  lockAddress={lockAddress}
                  manager={manager}
                  key={manager}
                  network={network}
                  hasMultipleManagers={managers?.length > 1}
                />
              ))}
            </div>
          </div>
        )}
        {(isLoading || addLockManagerMutation.isLoading) && (
          <Placeholder.Line size="xl" />
        )}
      </div>
      {isManager && (
        <form
          className="flex flex-col gap-6 mt-8"
          onSubmit={handleSubmit(onAddLockManager)}
        >
          <div className="flex flex-col gap-2">
            <Controller
              name="manager"
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
                      value={manager}
                      disabled={disabled}
                      label={t("events.settings.roles.evntMgr.form.title")}
                      description={t("events.settings.roles.evntMgr.form.desc")}
                      onChange={(value: any) => {
                        setValue('manager', value)
                      }}
                      onResolveName={onResolveName}
                    />
                  </>
                )
              }}
            />
          </div>
          <Button
            className="w-full md:w-1/2"
            type="submit"
            disabled={disableInput}
            loading={addLockManagerMutation.isLoading}
          >
            {t("common.add")}
          </Button>
        </form>
      )}
    </div>
  )
}
