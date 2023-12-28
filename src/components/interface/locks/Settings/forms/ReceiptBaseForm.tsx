import { Placeholder, TextBox, ToggleSwitch } from '@unlock-protocol/ui'
import { Input, Button } from '@unlock-protocol/ui'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { useGetReceiptsBase, useUpdateReceiptsBase } from '~/hooks/useReceipts'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { downloadAsCSV } from '../../Manage'
import { storage } from '~/config/storage'
import { FaFileCsv as CsvIcon } from 'react-icons/fa'
import { useTranslation } from 'next-i18next'

const SupplierSchema = z.object({
  vat: z.string().optional(),
  vatRatePercentage: z.number().nullish().default(null),
  supplierName: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zip: z.string().optional(),
  servicePerformed: z.string().optional(),
})

type SupplierBodyProps = z.infer<typeof SupplierSchema>
interface ReceiptBaseFormProps {
  lockAddress: string
  network: number
  isManager: boolean
  disabled: boolean
}

const ReceiptBaseFormPlaceholder = () => {
  return (
    <Placeholder.Root className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <Placeholder.Line size="xl" />
      <Placeholder.Root className="grid grid-cols-1 col-span-2 gap-4 md:grid-cols-2">
        <Placeholder.Line size="xl" />
        <Placeholder.Line size="xl" />
      </Placeholder.Root>
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
      <Placeholder.Line size="xl" />
    </Placeholder.Root>
  )
}

export const ReceiptBaseForm = ({
  lockAddress,
  isManager,
  disabled,
  network,
}: ReceiptBaseFormProps) => {
  const [vatPercentage, setVatPercentage] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isValid, errors },
  } = useForm<SupplierBodyProps>({
    mode: 'onChange',
  })
  const { t } = useTranslation()

  const { data: receiptsBase, isLoading: isLoadingDetails } =
    useGetReceiptsBase({
      lockAddress,
      network,
      isManager,
    })

  const {
    mutateAsync: receiptBaseMutation,
    isLoading: isReceiptsBaseUpdating,
  } = useUpdateReceiptsBase({
    lockAddress,
    network,
    isManager,
  })

  const onDownloadReceiptsMutation = useMutation(
    async () => {
      const response = await storage.getReceipts(network, lockAddress)
      const cols: string[] = []
      response?.data?.items?.map((item) => {
        Object.keys(item).map((key: string) => {
          if (!cols.includes(key)) {
            cols.push(key) // add key once only if not present in list
          }
        })
      })
      downloadAsCSV({
        cols,
        metadata: response?.data?.items || [],
        fileName: 'receipts.csv',
      })
    },
    {
      mutationKey: ['downloadReceipts', lockAddress, network],
      meta: {
        errorMessage: t("events.settings.payments.receipt.downloadErr"),
      },
    }
  )

  const onHandleSubmit = async (data: SupplierBodyProps) => {
    if (isValid) {
      await ToastHelper.promise(receiptBaseMutation(data), {
        loading: t("events.settings.payments.receipt.form.loading"),
        success: t("events.settings.payments.receipt.form.success"),
        error: t("events.settings.payments.receipt.form.error"),
      })
    } else {
      ToastHelper.error(t("common.formNotValid"))
      reset()
    }
  }

  useEffect(() => {
    if (receiptsBase) {
      reset(receiptsBase)
      setVatPercentage(receiptsBase?.vatRatePercentage > 0) // enable when percentage is set
    }
  }, [receiptsBase, reset])

  const disabledInput = isReceiptsBaseUpdating || disabled || isLoadingDetails

  if (isLoadingDetails) {
    return <ReceiptBaseFormPlaceholder />
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <Button
          variant="outlined-primary"
          size="small"
          loading={onDownloadReceiptsMutation.isLoading}
          iconLeft={<CsvIcon className="text-brand-ui-primary" size={16} />}
          onClick={() => onDownloadReceiptsMutation.mutate()}
        >
          {t("events.settings.payments.receipt.download")}
        </Button>
      </div>
      <form
        className="grid grid-cols-1 gap-6 pt-6 text-left"
        onSubmit={handleSubmit(onHandleSubmit)}
      >
        <div className="grid grid-cols-1 gap-2 md:gap-4 md:grid-cols-2">
          <Input
            disabled={disabledInput}
            label={t("events.settings.payments.receipt.form.name")}
            {...register('supplierName')}
          />
          <div className="grid grid-cols-1 col-span-2 gap-4 md:grid-cols-2">
            <div className="mt-1">
              <Input
                disabled={disabledInput}
                label={t("events.settings.payments.receipt.form.vatNo")}
                {...register('vat')}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="px-1 text-base" htmlFor="">
                  {t("events.settings.payments.receipt.form.vatRate")}
                </label>
                <ToggleSwitch
                  title={t("common.enable")}
                  enabled={vatPercentage}
                  setEnabled={setVatPercentage}
                  onChange={(enabled) => {
                    if (!enabled) {
                      setValue('vatRatePercentage', null, {
                        shouldValidate: true,
                      })
                    }
                  }}
                />
              </div>
              <Input
                type="number"
                min={0}
                max={100}
                step="any"
                disabled={disabledInput || !vatPercentage}
                error={errors?.vatRatePercentage?.message}
                {...register('vatRatePercentage', {
                  valueAsNumber: true,
                  required: {
                    value: vatPercentage,
                    message: t("events.settings.payments.receipt.form.vatRateErr"),
                  },
                })}
              />
            </div>
          </div>
          <Input
            disabled={disabledInput}
            label={"events.settings.payments.receipt.form.addr1"}
            {...register('addressLine1')}
          />
          <Input
            disabled={disabledInput}
            label={t("events.settings.payments.receipt.form.addr2")}
            {...register('addressLine2')}
          />
          <Input disabled={disabledInput} label={t("events.settings.payments.receipt.form.city")} {...register('city')} />
          <Input
            disabled={disabledInput}
            label={t("events.settings.payments.receipt.form.state")}
            {...register('state')}
          />
          <Input disabled={disabledInput} label={t("events.settings.payments.receipt.form.zip")} {...register('zip')} />
          <Input
            disabled={disabledInput}
            label={t("events.settings.payments.receipt.form.country")}
            {...register('country')}
          />
          <div className="col-span-2">
            <TextBox
              disabled={disabledInput}
              label={t("events.settings.payments.receipt.form.service")}
              {...register('servicePerformed')}
            />
          </div>
        </div>

        {isManager && (
          <Button
            type="submit"
            className="w-full md:w-1/3"
            disabled={disabledInput}
            loading={isReceiptsBaseUpdating}
          >
            {t("common.update")}
          </Button>
        )}
      </form>
    </div>
  )
}
