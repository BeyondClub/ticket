import fontColorContrast from 'font-color-contrast'
import { useState } from 'react'
import Link from 'next/link'
import { ReactMarkdown } from 'react-markdown/lib/react-markdown'
import { useMetadata } from '~/hooks/metadata'
import { useConfig } from '~/utils/withConfig'
import { selectProvider } from '~/hooks/useAuthenticate'
import { NextSeo } from 'next-seo'
import { toFormData } from '~/components/interface/locks/metadata/utils'
import {
  Button,
  Card,
  Disclosure,
  Modal,
  Placeholder,
  minifyAddress,
} from '@unlock-protocol/ui'
import { Checkout } from '~/components/interface/checkout/main'
import { AddressLink } from '~/components/interface/AddressLink'
import AddToCalendarButton from './AddToCalendarButton'
import { TweetItButton } from './TweetItButton'
import { CopyUrlButton } from './CopyUrlButton'
import { getEventDate, getEventEndDate, getEventUrl } from './utils'
import router from 'next/router'
import { useLockManager } from '~/hooks/useLockManager'
import { VerifierForm } from '~/components/interface/locks/Settings/forms/VerifierForm'
import dayjs from 'dayjs'
import { WalletlessRegistrationForm } from './WalletlessRegistration'
import { AiOutlineCalendar as CalendarIcon } from 'react-icons/ai'
import { useValidKey } from '~/hooks/useKey'
import { PaywallConfigType, getLockTypeByMetadata } from '@unlock-protocol/core'
import { useLockData } from '~/hooks/useLockData'
import { useCanClaim } from '~/hooks/useCanClaim'
import { useAuth } from '~/contexts/AuthenticationContext'
import { ZERO } from '~/components/interface/locks/Create/modals/SelectCurrencyModal'
import { EventCheckoutUrl } from './EventCheckoutUrl'
import { useGetLockSettings } from '~/hooks/useLockSettings'
import { UNLIMITED_KEYS_COUNT } from '~/constants'
import { useGetEventLocksConfig } from '~/hooks/useGetEventLocksConfig'
import useClipboard from 'react-use-clipboard'
import { ToastHelper } from '~/components/helpers/toast.helper'
import { CoverImageDrawer } from './CoverImageDrawer'
import { EventDetail } from './EventDetail'
import { EventLocation } from './EventLocation'
import { LockPriceDetails } from './LockPriceDetails'
import { CheckoutRegistrationCard } from './CheckoutRegistrationCard'
import { Trans, useTranslation } from 'next-i18next'

interface EventDetailsProps {
  lockAddress: string
  network: number
  metadata?: any
}

export const EventDetails = ({
  lockAddress,
  network,
  metadata,
}: EventDetailsProps) => {
  const [image, setImage] = useState('')
  const config = useConfig()
  const { account } = useAuth()
  const { lock, isLockLoading } = useLockData({
    lockAddress,
    network,
  })
  const { t, i18n } = useTranslation()

  const {
    isLoading: isLoadingSettings,
    data: settings,
    refetch: refetchSettings,
  } = useGetLockSettings({
    lockAddress,
    network,
  })

  const hasCheckoutId = settings?.checkoutConfigId

  const hasUnlimitedKeys = lock?.maxNumberOfKeys === UNLIMITED_KEYS_COUNT

  const keysLeft =
    Math.max(lock?.maxNumberOfKeys || 0, 0) - (lock?.outstandingKeys || 0)
  const isSoldOut = keysLeft === 0 && !hasUnlimitedKeys

  const [isCheckoutOpen, setCheckoutOpen] = useState(false)
  const { refetch } = useMetadata({
    lockAddress,
    network,
  })

  const { isLoading: isClaimableLoading, data: isClaimable } = useCanClaim({
    recipients: [account || ZERO],
    lockAddress,
    network,
    data: [],
  })

  const { data: hasValidKey, isInitialLoading: isHasValidKeyLoading } =
    useValidKey({
      lockAddress,
      network,
    })

  const { isManager: isLockManager } = useLockManager({
    lockAddress,
    network,
  })

  const { locks: eventLocks, isLoading: isLoadingEventLocks } =
    useGetEventLocksConfig({
      lockAddress,
      network,
    })

  const reload = async () => {
    await Promise.allSettled([refetch(), refetchSettings()])
  }

  const { isEvent } = getLockTypeByMetadata(metadata)

  const eventUrl = getEventUrl({
    lockAddress,
    network,
    metadata,
  })

  const [_, setCopied] = useClipboard(eventUrl, {
    successDuration: 1000,
  })

  if (isLoadingSettings || isLoadingEventLocks) {
    return (
      <Placeholder.Root>
        <Placeholder.Card size="lg" />
        <Placeholder.Root inline>
          <Placeholder.Image size="sm" />
          <Placeholder.Image size="sm" />
          <div className="w-1/3 ml-auto">
            <Placeholder.Card size="md" />
          </div>
        </Placeholder.Root>
        <Placeholder.Line />
        <Placeholder.Line />
        <Placeholder.Line />
      </Placeholder.Root>
    )
  }

  const onEdit = () => {
    return router.push(
      `/events/metadata?lockAddress=${lockAddress}&network=${network}`
    )
  }

  if (!isEvent) {
    if (isLockManager) {
      return (
        <>
          <p className="mb-2">
            {t("events.errors.addTimeLoc")}
          </p>
          <Button
            onClick={onEdit}
            variant="black"
            className="w-32 border"
            size="small"
          >
            {t("common.editDetails")}
          </Button>
        </>
      )
    }
    return <p>{t("events.errors.notConfigured")}</p>
  }

  const eventData = toFormData(metadata!)
  const eventDate = getEventDate(eventData.ticket)
  const eventEndDate = getEventEndDate(eventData.ticket)

  const isSameDay = dayjs(eventDate).isSame(eventEndDate, 'day')

  const injectedProvider = selectProvider(config)

  const paywallConfig: PaywallConfigType = {
    title: 'Registration',
    icon: metadata?.image,
    locks: {
      [lockAddress]: {
        network,
        emailRequired: true,
        metadataInputs: [
          {
            name: 'fullname',
            label: 'Full name',
            defaultValue: '',
            type: 'text',
            required: true,
            placeholder: 'Satoshi Nakamoto',
            public: false,
          },
        ],
      },
    },
  }

  const startDate = eventDate
    ? eventDate.toLocaleDateString(i18n.language === "ja" ? "ja" : undefined, {
      timeZone: eventData?.ticket?.event_timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : null

  const startTime =
    eventDate && eventData.ticket?.event_start_time
      ? eventDate.toLocaleTimeString(i18n.language === "ja" ? "ja" : undefined, {
        timeZone: eventData.ticket.event_timezone,
        hour: '2-digit',
        minute: '2-digit',
      })
      : undefined

  const endDate =
    eventEndDate && eventEndDate && !isSameDay
      ? eventEndDate.toLocaleDateString(i18n.language === "ja" ? "ja" : undefined, {
        timeZone: eventData?.ticket?.event_timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
      : null

  const endTime =
    eventDate && eventData.ticket?.event_end_time && eventEndDate && isSameDay
      ? eventEndDate.toLocaleTimeString(i18n.language === "ja" ? "ja" : undefined, {
        timeZone: eventData.ticket.event_timezone,
        hour: '2-digit',
        minute: '2-digit',
      })
      : null

  const hasLocation = (eventData?.ticket?.event_address || '')?.length > 0
  const hasDate = startDate || startTime || endDate || endTime

  const showWalletLess = !hasValidKey && isClaimable

  const coverImage = eventData.ticket?.event_cover_image

  const RegistrationCard = () => {
    if (
      isClaimableLoading ||
      isLockLoading ||
      isLoadingSettings ||
      isHasValidKeyLoading
    ) {
      return <Placeholder.Card size="md" />
    }

    return (
      <Card className="grid gap-6 mt-10 lg:mt-0">
        <span className="text-2xl font-bold text-gray-900">{t("common.registration")}</span>
        {hasValidKey ? (
          <p className="text-lg">
            <Trans i18nKey="events.registrationConf">
              🎉 You already have a ticket! You can view it in
              <Link className="underline" href="/keychain">
                your keychain
              </Link>
              .
            </Trans>
          </p>
        ) : (
          <>
            <LockPriceDetails lockAddress={lockAddress} network={network} />
            {showWalletLess ? (
              <WalletlessRegistrationForm
                lockAddress={lockAddress}
                network={network}
                disabled={isSoldOut}
              />
            ) : (
              <Button
                variant="primary"
                size="medium"
                style={{
                  backgroundColor: `#${eventData.background_color}`,
                  color: `#${eventData.background_color}`
                    ? fontColorContrast(`#${eventData.background_color}`)
                    : 'white',
                }}
                disabled={isClaimableLoading || isSoldOut}
                onClick={() => {
                  setCheckoutOpen(true)
                }}
              >
                {t("common.register")}
              </Button>
            )}
          </>
        )}
      </Card>
    )
  }

  const locksmithEventOG = new URL(
    `/v2/og/event/${network}/locks/${lockAddress}`,
    config.locksmithHost
  ).toString()

  return (
    <div>
      <Modal
        isOpen={isCheckoutOpen && !isClaimable}
        setIsOpen={setCheckoutOpen}
        empty={true}
      >
        <Checkout
          injectedProvider={injectedProvider as any}
          paywallConfig={paywallConfig}
          handleClose={() => {
            setCheckoutOpen(false)
            reload() // force refresh after eventual purchase
          }}
        />
      </Modal>

      <NextSeo
        title={eventData.title}
        description={`${eventData.description}`}
        openGraph={{
          images: [
            {
              alt: eventData.title,
              url: locksmithEventOG,
            },
          ],
        }}
      />

      <div className="relative">
        <div className="relative">
          <div className="w-full h-32 overflow-hidden -z-0 bg-slate-200 md:h-80 md:rounded-3xl">
            {coverImage && (
              <img
                className="object-cover w-full h-full"
                src={coverImage}
                alt="Cover image"
              />
            )}
          </div>

          <CoverImageDrawer
            image={image}
            setImage={setImage}
            metadata={eventData}
            lockAddress={lockAddress}
            network={network}
            handleClose={() => {
              refetch()
            }}
          />

          <div className="absolute flex flex-col w-full gap-6 px-4 md:px-10 -bottom-12">
            <section className="flex justify-between">
              <div className="flex w-24 h-24 p-1 bg-white md:p-2 md:w-48 md:h-48 rounded-3xl">
                <img
                  alt={eventData.title}
                  className="object-cover w-full m-auto aspect-1 rounded-2xl"
                  src={eventData.image}
                />
              </div>
              <ul className="flex items-center gap-2 mt-auto md:gap-2">
                <li>
                  <AddToCalendarButton event={eventData} />
                </li>
                <li>
                  <TweetItButton event={eventData} />
                </li>
                <li>
                  <CopyUrlButton eventUrl={eventUrl} />
                </li>
              </ul>
            </section>
          </div>
        </div>

        <section className="grid items-start grid-cols-1 md:gap-4 lg:grid-cols-3 mt-14 lg:px-12 lg:mt-28">
          <div className="flex flex-col col-span-3 gap-4 md:col-span-2">
            <h1 className="text-4xl font-bold md:text-7xl">{eventData.name}</h1>
            {!hasCheckoutId && (
              <div className="flex gap-2 flex-rows">
                <span className="text-brand-gray">{t("common.ticketContract")}</span>
                <AddressLink lockAddress={lockAddress} network={network} />
              </div>
            )}
            <section className="mt-4">
              <div className="grid grid-cols-1 gap-6 md:p-6 md:grid-cols-2 rounded-2xl">
                {hasDate && (
                  <EventDetail label={t("common.date")} icon={CalendarIcon}>
                    <div
                      style={{ color: `#${eventData.background_color}` }}
                      className="flex flex-col text-lg font-normal text-brand-dark"
                    >
                      {(startDate || endDate) && (
                        <span>
                          {startDate} {endDate && <>- {endDate}</>}
                        </span>
                      )}
                      {startTime && endTime && (
                        <span>
                          {startTime} {endTime && <>- {endTime}</>}
                        </span>
                      )}
                    </div>
                  </EventDetail>
                )}
                {hasLocation && <EventLocation eventData={eventData} />}
              </div>
              <div className="mt-14">
                <h2 className="text-2xl font-bold">{t("common.eventInformation")}</h2>
                {eventData.description && (
                  <div className="mt-4 markdown">
                    {/* eslint-disable-next-line react/no-children-prop */}
                    <ReactMarkdown children={eventData.description} />
                  </div>
                )}
              </div>
            </section>
          </div>
          {!isCheckoutOpen && (
            <>
              {/** Prioritize Checkout URL if there is one set */}
              {hasCheckoutId ? (
                <CheckoutRegistrationCard
                  isManager={isLockManager}
                  lockAddress={lockAddress}
                  network={network}
                  onPurchase={reload}
                />
              ) : (
                <RegistrationCard />
              )}
            </>
          )}
        </section>
      </div>

      <section className="flex flex-col mb-8">
        {isLockManager && (
          <div className="grid gap-6 mt-12">
            <span className="text-2xl font-bold text-brand-dark">
              {t("events.manage.toolsForYou")}
            </span>
            <div className="grid gap-4">
              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title={t("events.manage.promote.title")}
                    description={t("events.manage.promote.desc")}
                  />
                  <pre className="">{eventUrl}</pre>
                </div>
                <div className="md:col-span-1">
                  <Button
                    key={lockAddress}
                    variant="black"
                    className="button border w-full"
                    size="small"
                    onClick={(event) => {
                      event.preventDefault()
                      setCopied()
                      ToastHelper.success('Copied!')
                    }}
                  >
                    {t("events.manage.promote.copy")}
                  </Button>
                </div>
              </Card>

              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title={t("events.manage.manageAttendees.title")}
                    description={t("events.manage.manageAttendees.desc")}
                  />
                </div>
                <div className="md:col-span-1">
                  {eventLocks?.map(({ lockAddress, network }) => {
                    let label = t("events.manage.manageAttendees.title")
                    if (eventLocks.length > 1) {
                      label = `${t("events.manage.manageAttendees.titleFor")} ${minifyAddress(
                        lockAddress
                      )}`
                    }
                    return (
                      <Button
                        key={lockAddress}
                        as={Link}
                        variant="black"
                        className="button border"
                        size="small"
                        href={`/events/lock?address=${lockAddress}&network=${network}`}
                      >
                        {label}
                      </Button>
                    )
                  })}
                </div>
              </Card>

              <Card className="grid grid-cols-1 gap-2 md:items-center md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card.Label
                    title={t("events.manage.eventDetails.title")}
                    description={t("events.manage.eventDetails.desc")}
                  />
                </div>
                <div className="md:col-span-1">
                  <Button
                    onClick={onEdit}
                    variant="black"
                    className="w-full border"
                    size="small"
                  >
                    {t("events.manage.eventDetails.edit")}
                  </Button>
                </div>
              </Card>

              <Disclosure
                label={t("events.manage.verifiers.title")}
                description={t("events.manage.verifiers.desc")}
              >
                <div className="grid gap-2">
                  {eventLocks?.map(({ lockAddress, network }) => {
                    return (
                      <Disclosure
                        label={`${t("events.manage.verifiers.titleFor")} ${minifyAddress(lockAddress)}`}
                        key={lockAddress}
                      >
                        <VerifierForm
                          lockAddress={lockAddress}
                          network={network}
                          isManager={isLockManager}
                          disabled={!isLockManager}
                        />
                      </Disclosure>
                    )
                  })}
                </div>
              </Disclosure>

              <Disclosure
                label={t("events.manage.checkout.title")}
                description={t("events.manage.checkout.desc")}
              >
                <EventCheckoutUrl
                  lockAddress={lockAddress}
                  network={network}
                  isManager={isLockManager}
                  disabled={!isLockManager}
                  onCheckoutChange={reload}
                />
              </Disclosure>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

export default EventDetails
