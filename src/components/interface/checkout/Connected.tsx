import { Button, Icon, Tooltip } from '@unlock-protocol/ui'
import { useActor } from '@xstate/react'
import { ReactNode, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { FaEthereum as EthereumIcon } from 'react-icons/fa'
import { SiBrave as BraveWalletIcon } from 'react-icons/si'
import { useAuth } from '~/contexts/AuthenticationContext'
import { useAuthenticate } from '~/hooks/useAuthenticate'
import { useSIWE } from '~/hooks/useSIWE'
import { addressMinify, minifyEmail } from '~/utils/strings'
import { detectInjectedProvider } from '~/utils/wallet'
import { DownloadWallet } from '../DownloadWallet'
import { ConnectService } from './Connect/connectMachine'
import { CheckoutService } from './main/checkoutMachine'
import { useTranslation } from 'next-i18next'
interface SignedInProps {
  onDisconnect?: () => void
  isUnlockAccount: boolean
  email?: string
  account?: string
  isDisconnecting?: boolean
}

export function SignedIn({
  onDisconnect,
  isUnlockAccount,
  email,
  account,
  isDisconnecting,
}: SignedInProps) {
  const { t } = useTranslation()

  let userText: string
  let signOutText: string

  if (isUnlockAccount && email) {
    userText = `${t("common.user")}: ${minifyEmail(email)}`
    signOutText = t("common.signOut")
  } else {
    userText = `${t("common.wallet")}: ${addressMinify(account!)}`
    signOutText = t("wallet.disconnect")
  }

  return (
    <div className="flex items-center justify-between text-sm">
      <p> {userText}</p>
      <Tooltip
        side="top"
        tip={`${isUnlockAccount ? t("common.signOut") : t("wallet.disconnect")
          } ${t("checkout.preview.willReset")}`}
      >
        {onDisconnect && (
          <Button
            variant="borderless"
            size="small"
            loading={isDisconnecting}
            onClick={onDisconnect}
            type="button"
          >
            {signOutText}
          </Button>
        )}
      </Tooltip>
    </div>
  )
}

interface SignedOutProps {
  authenticateWithProvider(
    provider:
      | 'METAMASK'
      | 'UNLOCK'
      | 'WALLET_CONNECT'
      | 'COINBASE'
      | 'DELEGATED_PROVIDER'
  ): Promise<void>
  onUnlockAccount(): void
  injectedProvider: any
  title?: string
}

export function SignedOut({
  onUnlockAccount,
  authenticateWithProvider,
  injectedProvider,
  title,
}: SignedOutProps) {
  const iconButtonClass =
    'inline-flex items-center w-10 h-10 justify-center hover:[box-shadow:_0px_4px_15px_rgba(0,0,0,0.08)] [box-shadow:_0px_8px_30px_rgba(0,0,0,0.08)] rounded-full'
  const [isDownloadWallet, setIsDownloadWallet] = useState(false)
  const { t } = useTranslation()

  if (!title) title = t("checkout.preview.haveWallet")

  const ButtonIcon = useMemo(() => {
    const walletIcons = {
      brave: <BraveWalletIcon size={20} className="m-1.5" />,
      metamast: <></>,
      frame: <></>,
      status: <></>,
      metamask: <Image src="/images/svg/wallets/metamask.svg" alt='metamask' height={32} width={32} />,
      // frame: <SvgComponents.Frame width={24} />,
      // status: <SvgComponents.Status width={32} />,
    }
    const detected = detectInjectedProvider(injectedProvider)
    return walletIcons[detected]
  }, [injectedProvider])

  const onInjectedHandler = () => {
    if (injectedProvider) {
      return authenticateWithProvider('METAMASK')
    }

    if (
      navigator.userAgent.match(/Android/i) ||
      navigator.userAgent.match(/iPhone/i)
    ) {
      return authenticateWithProvider('WALLET_CONNECT')
    }

    setIsDownloadWallet(true)
  }

  return (
    <div className="grid w-full grid-flow-col grid-cols-11">
      <div className="grid items-center col-span-5 space-y-2 justify-items-center">
        <h4 className="text-sm">{title}</h4>
        <DownloadWallet
          isOpen={isDownloadWallet}
          setIsOpen={setIsDownloadWallet}
        />
        <div className="flex items-center justify-around w-full">
          <button
            aria-label="injected wallet"
            onClick={onInjectedHandler}
            type="button"
            className={iconButtonClass}
          >
            {ButtonIcon}
          </button>
          <button
            aria-label="wallet connect"
            onClick={() => authenticateWithProvider('WALLET_CONNECT')}
            type="button"
            className={iconButtonClass}
          >
            <Image src="/images/svg/wallets/walletConnect.svg" alt='walletconnect' height={32} width={32} />
          </button>
          <button
            aria-label="coinbase wallet"
            onClick={() => authenticateWithProvider('COINBASE')}
            type="button"
            className={iconButtonClass}
          >
            <Image src="/images/svg/wallets/coinbaseWallet.svg" alt='coinbase' height={32} width={32} />
          </button>
        </div>
      </div>
      <div className="flex justify-center col-span-1">
        <div className="h-full border-l"></div>
      </div>
      <div className="grid items-center col-span-5 space-y-2 justify-items-center">
        <h4 className="text-sm">{t("checkout.preview.noWallet")}</h4>
        <Button
          onClick={(event) => {
            event.preventDefault()
            onUnlockAccount()
          }}
          size="small"
          variant="outlined-primary"
          className="w-full"
        >
          {t("checkout.preview.getStarted")}
        </Button>
      </div>
    </div>
  )
}

interface ConnectedCheckoutProps {
  skipAccountDetails?: boolean
  injectedProvider?: unknown
  service: CheckoutService | ConnectService
  children?: ReactNode
}

export function Connected({
  skipAccountDetails = false,
  service,
  injectedProvider,
  children,
}: ConnectedCheckoutProps) {
  const [state, send] = useActor<CheckoutService>(service as CheckoutService)
  const { account, email, isUnlockAccount, deAuthenticate, connected } =
    useAuth()
  const [signing, setSigning] = useState(false)
  const { t } = useTranslation()

  const { authenticateWithProvider } = useAuthenticate({
    injectedProvider,
  })
  const { signIn, signOut, isSignedIn } = useSIWE()
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const useDelegatedProvider =
    state.context?.paywallConfig?.useDelegatedProvider

  useEffect(() => {
    const autoSignIn = async () => {
      if (
        !isSignedIn &&
        !signing &&
        connected &&
        (isUnlockAccount || useDelegatedProvider)
      ) {
        setSigning(true)
        await signIn()
        setSigning(false)
      }
    }
    autoSignIn()
  }, [
    connected,
    useDelegatedProvider,
    isUnlockAccount,
    signIn,
    signing,
    isSignedIn,
  ])

  useEffect(() => {
    if (!account) {
      console.debug('Not connected')
    } else console.debug(`${t("checkout.preview.connectedAs")} ${account}`)
  }, [account])

  if (useDelegatedProvider) {
    return <div className="space-y-2">{children}</div>
  }

  const onDisconnect = async () => {
    setIsDisconnecting(true)
    await signOut()
    await deAuthenticate()
    send('DISCONNECT')
    setIsDisconnecting(false)
  }

  return account ? (
    <div className="space-y-2">
      {children}
      {!skipAccountDetails && (
        <SignedIn
          isDisconnecting={isDisconnecting}
          account={account}
          email={email}
          isUnlockAccount={!!isUnlockAccount}
          onDisconnect={state.can('DISCONNECT') ? onDisconnect : undefined}
        />
      )}
    </div>
  ) : connected ? (
    <div className="grid">
      <Button
        loading={status === 'loading'}
        onClick={(event) => {
          event.preventDefault()
          signIn()
        }}
        iconLeft={<Icon icon={EthereumIcon} size="medium" key="ethereum" />}
      >
        {t("checkout.preview.signMsg")}
      </Button>
    </div>
  ) : (
    <div>
      <SignedOut
        injectedProvider={injectedProvider}
        onUnlockAccount={() => {
          send('UNLOCK_ACCOUNT')
        }}
        authenticateWithProvider={authenticateWithProvider}
        title={t("checkout.preview.haveWallet")}
      />
    </div>
  )
}
