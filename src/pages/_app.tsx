import { ErrorBoundary } from '@sentry/nextjs'
import { QueryClientProvider } from '@tanstack/react-query'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import TagManager from 'react-gtm-module'
import { Toaster } from 'react-hot-toast'
import { ErrorFallback } from '~/components/interface/ErrorFallback'
import { config } from '~/config/app'
import { queryClient } from '~/config/queryClient'
import { ConnectModalProvider } from '~/hooks/useConnectModal'
import { SessionProvider } from '~/hooks/useSession'
import GlobalWrapper from '../components/interface/GlobalWrapper'
import { appWithTranslation } from 'next-i18next'
import '../index.css'

const UnlockApp = ({ Component, pageProps }: AppProps) => {
  useEffect(() => {
    if (!config.isServer) {
      if (config.env === 'prod' && config.tagManagerArgs) {
        TagManager.initialize(config.tagManagerArgs)
      }
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider>
        <ConnectModalProvider>
          <GlobalWrapper>
            <ErrorBoundary fallback={(props) => <ErrorFallback {...props} />}>
              <Component pageProps={pageProps} />
            </ErrorBoundary>
            <Toaster />
          </GlobalWrapper>
        </ConnectModalProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}

export default appWithTranslation(UnlockApp)
