import Image from 'next/image'
import Link from 'next/link'
import { FiExternalLink as ExternalLinkIcon } from 'react-icons/fi'
import { useLanguage } from '~/contexts/LanguageContext'

const options = (cta1: string) => [
  {
    image: {
      src: '/images/illustrations/events/outmetaverse.svg',
      width: 320,
      height: 200,
      alt: 'organize event',
    },
    cta: cta1,
    href: '/event/new',
  },
  // {
  //   image: {
  //     src: '/images/illustrations/certifications/img-handoffDoc.svg',
  //     width: 250,
  //     height: 200,
  //     alt: 'create certification',
  //   },
  //   cta: 'Certify & Show the expertise on chain.',
  //   href: '/certification/new',
  // },
]

export const Launcher = () => {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col items-center text-center">
      <h1 className="text-3xl font-bold mb-2">{t('home.heading1')}</h1>
      <h2 className="text-lg font-light text-center">
        {t('home.heading2')} 😊
      </h2>
      <ul className="flex gap-4 mt-8 mb-12 flex-col md:flex-row">
        {options(t('options.title.1')).map(({ cta, image, href }) => (
          <li
            key={image.alt}
            className="relative h-96 overflow-hidden bg-[#FFF7E8] w-96 rounded-lg duration-200 hover:drop-shadow-2xl"
          >
            <Link href={href}>
              <div className="flex flex-col items-center">
                <Image
                  className="mt-4"
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  src={image.src}
                ></Image>
              </div>
              <div className="absolute bottom-0 w-full p-4 bg-white flex">
                <p className="font-light">{cta}</p>
                <ExternalLinkIcon className="ml-auto text-brand-ui-primary" />
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mb-12">
        {t('options.title.default.1')}{' '}
        <Link
          className="underline font-semibold text-brand-ui-primary"
          href="/events/create"
        >
          {t('options.title.default.2')}
        </Link>
        .
      </p>
    </div>
  )
}
