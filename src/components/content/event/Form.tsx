import { useQuery } from '@tanstack/react-query'
import { CryptoIcon } from '@unlock-protocol/crypto-icon'
import {
  Button,
  Disclosure,
  ImageUpload,
  Input,
  Select,
  TextBox,
  ToggleSwitch,
} from '@unlock-protocol/ui'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { usePlacesWidget } from 'react-google-autocomplete'
import { Controller, FormProvider, useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'next-i18next'
import { BiLogoZoom as ZoomIcon } from 'react-icons/bi'
import { BsArrowLeft as ArrowBackIcon } from 'react-icons/bs'
import { BalanceWarning } from '~/components/interface/locks/Create/elements/BalanceWarning'
import { networkDescription } from '~/components/interface/locks/Create/elements/CreateLockForm'
import { SelectCurrencyModal } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { MetadataFormData } from '~/components/interface/locks/metadata/utils'
import { config } from '~/config/app'
import { UNLIMITED_KEYS_DURATION } from '~/constants'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useImageUpload } from '~/hooks/useImageUpload'
import { Lock, Token } from '~/types'
import { useAvailableNetworks } from '~/utils/networks'
import { useConfig } from '~/utils/withConfig'
import { useWeb3Service } from '~/utils/withWeb3Service'

// TODO replace with zod, but only once we have replaced Lock and MetadataFormData as well
export interface NewEventForm {
  network: number
  lock: Omit<Lock, 'address' | 'key'>
  currencySymbol: string
  metadata: Partial<MetadataFormData>
}

interface GoogleMapsAutoCompleteProps {
  onChange: (value: string) => void
}

const GoogleMapsAutoComplete = ({ onChange }: GoogleMapsAutoCompleteProps) => {
  const { ref } = usePlacesWidget({
    options: {
      types: ['address'],
    },
    apiKey: config.googleMapsApiKey,
    onPlaceSelected: (place) => onChange(place.formatted_address),
  })

  return (
    <Input
      ref={ref}
      type="text"
      placeholder="123 1st street, 11217 Springfield, US"
    />
  )
}

interface FormProps {
  onSubmit: (data: NewEventForm) => void
}

export const Form = ({ onSubmit }: FormProps) => {
  const { networks } = useConfig()
  const { network, account } = useAuth()
  const [isInPerson, setIsInPerson] = useState(true)
  const [isUnlimitedCapacity, setIsUnlimitedCapacity] = useState(false)
  const [isFree, setIsFree] = useState(true)
  const [isCurrencyModalOpen, setCurrencyModalOpen] = useState(false)
  const { mutateAsync: uploadImage, isLoading: isUploading } = useImageUpload()

  const web3Service = useWeb3Service()

  const today = dayjs().format('YYYY-MM-DD')

  const methods = useForm<NewEventForm>({
    mode: 'onChange',
    shouldUnregister: false,
    defaultValues: {
      network,
      lock: {
        name: '',
        expirationDuration: UNLIMITED_KEYS_DURATION,
        maxNumberOfKeys: 100,
        currencyContractAddress: null,
        keyPrice: '0',
      },
      currencySymbol: networks[network!].nativeCurrency.symbol,
      metadata: {
        description: '',
        ticket: {
          event_start_date: today,
          event_start_time: '',
          event_end_date: today,
          event_end_time: '',
          event_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          event_address: '',
        },
        slug: '',
        image: '',
      },
    },
  })

  const {
    control,
    register,
    setValue,
    formState: { errors },
    watch,
  } = methods
  const details = useWatch({
    control,
  })

  const mapAddress = `https://www.google.com/maps/embed/v1/place?q=${encodeURIComponent(
    details.metadata?.ticket?.event_address || 'Ethereum'
  )}&key=${config.googleMapsApiKey}`

  const networkOptions = useAvailableNetworks()

  const { isLoading: isLoadingBalance, data: balance } = useQuery(
    ['getBalance', account, details.network],
    async () => {
      if (!details.network) {
        return 1.0
      }
      return parseFloat(
        await web3Service.getAddressBalance(account!, details.network!)
      )
    }
  )

  const noBalance = balance === 0 && !isLoadingBalance

  const ticket = details?.metadata?.ticket

  const metadataImage = watch('metadata.image')
  const isSameDay = dayjs(ticket?.event_end_date).isSame(
    ticket?.event_start_date,
    'day'
  )

  const minEndTime = isSameDay ? ticket?.event_start_time : undefined
  const minEndDate = dayjs(ticket?.event_start_date).format('YYYY-MM-DD')

  const router = useRouter()
  const { t } = useTranslation()

  return (
    <FormProvider {...methods}>
      <div className="grid grid-cols-[50px_1fr_50px] items-center mb-4">
        <Button variant="borderless" aria-label="arrow back">
          <ArrowBackIcon
            size={20}
            className="cursor-pointer"
            onClick={() => router.back()}
          />
        </Button>
        <h1 className="text-xl font-bold text-center text-brand-dark">
          {t("events.creating")}
        </h1>
      </div>

      <form className="mb-6" onSubmit={methods.handleSubmit(onSubmit)}>
        <div className="grid gap-6">
          <Disclosure label={t("events.form.basicInfo.title")} defaultOpen>
            <p className="mb-5">
              {t("events.form.basicInfo.description")}
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="order-2 md:order-1">
                <ImageUpload
                  description={t("events.form.basicInfo.imgDescription")}
                  isUploading={isUploading}
                  preview={metadataImage!}
                  onChange={async (fileOrFileUrl: any) => {
                    if (typeof fileOrFileUrl === 'string') {
                      setValue('metadata.image', fileOrFileUrl)
                    } else {
                      const items = await uploadImage(fileOrFileUrl[0])
                      const image = items?.[0]?.publicUrl
                      if (!image) {
                        return
                      }
                      setValue('metadata.image', image)
                    }
                  }}
                />
              </div>
              <div className="grid order-1 gap-4 md:order-2">
                <Input
                  {...register('lock.name', {
                    required: {
                      value: true,
                      message: t("events.form.basicInfo.name.error"),
                    },
                  })}
                  type="text"
                  placeholder={t("common.name")}
                  label={t("common.eventName")}
                  description={
                    t("events.form.basicInfo.name.description")
                  }
                  error={errors.lock?.name?.message}
                />

                <TextBox
                  {...register('metadata.description', {
                    required: {
                      value: true,
                      message: t("events.form.basicInfo.desc.error"),
                    },
                  })}
                  label={t("common.description")}
                  placeholder={t("events.form.basicInfo.desc.placeholder")}
                  description={
                    <p>
                      {t("events.form.basicInfo.desc.description.1")}{' '}
                      <a
                        className="text-brand-ui-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://www.markdownguide.org/cheat-sheet"
                      >
                        {t("events.form.basicInfo.desc.description.2")}
                      </a>
                    </p>
                  }
                  rows={4}
                  error={errors.metadata?.description?.message as string}
                />

                <Select
                  onChange={(newValue) => {
                    setValue('network', Number(newValue))
                    setValue('lock.currencyContractAddress', null)
                    setValue(
                      'currencySymbol',
                      networks[newValue].nativeCurrency.symbol
                    )
                  }}
                  options={networkOptions}
                  label={t("common.network")}
                  defaultValue={network}
                  description={
                    <p>
                      {t("events.form.basicInfo.network.description.1")}{' '}
                      {details.network && (
                        <>{networkDescription(details.network)}</>
                      )}
                    </p>
                  }
                />
                <div className="mb-4">
                  {noBalance && (
                    <BalanceWarning
                      network={details.network!}
                      balance={balance}
                    />
                  )}
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label={t("events.form.location.title")} defaultOpen>
            <div className="grid">
              <p className="mb-5">
                {t("events.form.location.description")}
              </p>
              <div className="grid items-center gap-4 align-top sm:grid-cols-2">
                <div className="flex flex-col self-start gap-4 justify-top">
                  <div className="h-80">
                    {isInPerson && (
                      <iframe
                        width="100%"
                        height="350"
                        src={mapAddress}
                      ></iframe>
                    )}
                    {!isInPerson && (
                      <div className="flex h-80 items-center justify-center">
                        <ZoomIcon size="5rem" color={'rgb(96 61 235)'} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col self-start gap-2 justify-top">
                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      {...register('metadata.ticket.event_start_date', {
                        required: {
                          value: true,
                          message: 'Add a start date to your event',
                        },
                      })}
                      onChange={(event) => {
                        if (!details.metadata?.ticket?.event_end_date) {
                          setValue(
                            'metadata.ticket.event_end_date',
                            event.target.value
                          )
                          setValue('metadata.ticket.event_start_time', '12:00')
                        }
                      }}
                      min={today}
                      type="date"
                      label={t("events.form.location.startDate")}
                      error={
                        // @ts-expect-error Property 'event_start_date' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                        errors.metadata?.ticket?.event_start_date?.message || ''
                      }
                    />
                    <Input
                      {...register('metadata.ticket.event_start_time', {})}
                      type="time"
                      label={t("events.form.location.startTime")}
                      error={
                        // @ts-expect-error Property 'event_start_time' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                        errors.metadata?.ticket?.event_start_time?.message || ''
                      }
                      onChange={(event) => {
                        if (!details.metadata?.ticket?.event_end_time) {
                          setValue(
                            'metadata.ticket.event_end_time',
                            event.target.value
                          )
                        }
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                    <Input
                      {...register('metadata.ticket.event_end_date', {
                        required: {
                          value: true,
                          message: 'Add a end date to your event',
                        },
                      })}
                      type="date"
                      min={minEndDate}
                      label={t("events.form.location.endDate")}
                      error={
                        // @ts-expect-error Property 'event_start_date' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                        errors.metadata?.ticket?.event_end_date?.message || ''
                      }
                    />
                    <Input
                      {...register('metadata.ticket.event_end_time', {})}
                      type="time"
                      min={minEndTime}
                      label={t("events.form.location.endTime")}
                      error={
                        // @ts-expect-error Property 'event_end_time' does not exist on type 'FieldError | Merge<FieldError, FieldErrorsImpl<any>>'.
                        errors.metadata?.ticket?.event_end_time?.message || ''
                      }
                    />
                  </div>

                  <Controller
                    name="metadata.ticket.event_timezone"
                    control={control}
                    render={({ field: { onChange, value } }) => {
                      return (
                        <Select
                          onChange={(newValue) => {
                            onChange({
                              target: {
                                value: newValue,
                              },
                            })
                          }}
                          // @ts-expect-error supportedValuesOf
                          options={Intl.supportedValuesOf('timeZone').map(
                            (tz: string) => {
                              return {
                                value: tz,
                                label: tz,
                              }
                            }
                          )}
                          label={t("events.form.location.timezone")}
                          defaultValue={value}
                        />
                      )
                    }}
                  />

                  <div className="mt-6">
                    <div className="flex items-center justify-between">
                      <label className="px-1 mb-2 text-base" htmlFor="">
                        {t("events.form.location.address")}
                      </label>
                      <ToggleSwitch
                        title={t("events.form.location.inPerson")}
                        enabled={isInPerson}
                        setEnabled={setIsInPerson}
                        onChange={() => {
                          // reset the value
                          setValue('metadata.ticket.event_address', undefined)
                        }}
                      />
                    </div>

                    {!isInPerson && (
                      <Input
                        {...register('metadata.ticket.event_address')}
                        type="text"
                        placeholder={'Zoom or Google Meet Link'}
                      />
                    )}

                    {isInPerson && (
                      <Controller
                        name="metadata.ticket.event_address"
                        control={control}
                        render={({ field: { onChange } }) => {
                          return <GoogleMapsAutoComplete onChange={onChange} />
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Disclosure>

          <Disclosure label={t("events.form.price.title")} defaultOpen>
            <div className="grid ">
              <p>
                {t("events.form.price.description")}
              </p>
              <div className="relative flex flex-col mt-4">
                <div className="flex items-center justify-between">
                  <label className="" htmlFor="">
                    {t("events.form.price.currNPrice")}
                  </label>
                  <ToggleSwitch
                    title={t("common.free")}
                    enabled={isFree}
                    setEnabled={setIsFree}
                    onChange={(enable: boolean) => {
                      if (enable) {
                        setValue('lock.keyPrice', '0')
                      }
                    }}
                  />
                </div>

                <div className="relative">
                  <SelectCurrencyModal
                    isOpen={isCurrencyModalOpen}
                    setIsOpen={setCurrencyModalOpen}
                    network={Number(details.network)}
                    onSelect={(token: Token) => {
                      setValue('lock.currencyContractAddress', token.address)
                      setValue('currencySymbol', token.symbol)
                    }}
                  />
                  <div className="grid grid-cols-2 gap-2 justify-items-stretch">
                    <div className="flex flex-col gap-1.5">
                      <div
                        onClick={() => setCurrencyModalOpen(true)}
                        className="box-border flex items-center flex-1 w-full gap-2 pl-4 text-base text-left transition-all border border-gray-400 rounded-lg shadow-sm cursor-pointer hover:border-gray-500 focus:ring-gray-500 focus:border-gray-500 focus:outline-none"
                      >
                        <CryptoIcon symbol={details.currencySymbol!} />
                        <span>{details.currencySymbol}</span>
                      </div>
                      <div className="pl-1"></div>
                    </div>

                    <Input
                      type="number"
                      autoComplete="off"
                      placeholder="0.00"
                      step="any"
                      disabled={isFree}
                      {...register('lock.keyPrice', {
                        valueAsNumber: true,
                        required: !isFree,
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <label className="" htmlFor="">
                  {t("events.form.price.capacity")}
                </label>
                <ToggleSwitch
                  title={t("common.unlimited")}
                  enabled={isUnlimitedCapacity}
                  setEnabled={setIsUnlimitedCapacity}
                  onChange={(enabled) => {
                    if (enabled) {
                      setValue('lock.maxNumberOfKeys', undefined)
                    }
                  }}
                />
              </div>
              <Input
                {...register('lock.maxNumberOfKeys', {
                  min: 0,
                  valueAsNumber: true,
                  required: {
                    value: !isUnlimitedCapacity,
                    message: 'Capacity is required. ',
                  },
                })}
                disabled={isUnlimitedCapacity}
                autoComplete="off"
                step={1}
                pattern="\d+"
                type="number"
                placeholder={t("events.form.price.capacity")}
                description={
                  t("events.form.price.capacityDesc")
                }
                error={errors.lock?.maxNumberOfKeys?.message}
              />
            </div>
          </Disclosure>

          <div className="flex flex-col justify-center gap-6">
            {Object.keys(errors).length > 0 && (
              <div className="px-2 text-red-600">
                {t("common.form.error.complete")}{' '}
              </div>
            )}
            <Button
              disabled={Object.keys(errors).length > 0}
              className="w-full"
            >
              {t("events.createYourEvent")}
            </Button>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
