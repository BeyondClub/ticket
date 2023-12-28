import { Modal, Tooltip } from '@unlock-protocol/ui'
import { google, outlook, office365, ics } from 'calendar-link'
import Link from 'next/link'
import { useState } from 'react'
import { BsCalendarDate } from 'react-icons/bs'
import { FaRegCalendarPlus } from 'react-icons/fa'
import { Metadata } from '~/components/interface/locks/metadata/utils'
import { getEventDate, getEventEndDate } from './utils'

import {
  SiGooglecalendar,
  SiMicrosoftoffice,
  SiMicrosoftoutlook,
} from 'react-icons/si'
import { useTranslation } from 'next-i18next'

interface AddToCalendarButtonProps {
  event: Partial<Metadata>
}

export const AddToCalendarButton = ({ event }: AddToCalendarButtonProps) => {
  const [isOpen, setOpen] = useState(false)
  const { t } = useTranslation()
  const eventDate = getEventDate(event.ticket)

  const endDate = getEventEndDate(event.ticket)

  // We can only add events with a date and name
  if (!eventDate || !event.name) {
    return null
  }

  const calendarEvent = {
    title: event.name,
    start: eventDate,
    location: event.ticket.event_address,
    description: event.description || '',
    allDay: !event.ticket.event_start_date,
    end: endDate,
    url: window.location.toString(),
  }

  return (
    <>
      <Modal isOpen={isOpen} setIsOpen={setOpen}>
        <div className="w-full">
          <p className="mb-2">{t("common.calendar.select")}</p>
          <ul className="flex flex-col justify-between w-full">
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={google(calendarEvent)}
              >
                <SiGooglecalendar className="inline w-8 h-8 mr-3" />
                {t("common.calendar.google")}
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={outlook(calendarEvent)}
              >
                <SiMicrosoftoutlook className="inline w-8 h-8 mr-3" />
                {t("common.calendar.outlook")}
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={office365(calendarEvent)}
              >
                <SiMicrosoftoffice className="inline w-8 h-8 mr-3" />
                {t("common.calendar.office365")}
              </Link>
            </li>
            <li className="flex py-3">
              <Link
                target="_blank"
                className="hover:underline"
                href={ics(calendarEvent)}
              >
                <BsCalendarDate className="inline w-8 h-8 mr-3" />
                {t("common.calendar.ics")}
              </Link>
            </li>
          </ul>
        </div>
      </Modal>

      <Tooltip
        delay={0}
        label={t("common.calendar.title")}
        tip={t("common.calendar.title")}
        side="bottom"
      >
        <button
          onClick={() => setOpen(true)}
          className="flex items-center justify-center w-12 h-12"
        >
          <FaRegCalendarPlus className="w-6 h-6" />
        </button>
      </Tooltip>
    </>
  )
}

export default AddToCalendarButton
