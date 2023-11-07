import { useActor } from '@xstate/react'
import { StepItem } from '../Stepper'
import {
  CheckoutHookType,
  CheckoutMachineContext,
  CheckoutService,
} from './checkoutMachine'
import { UnlockAccountService } from '../UnlockAccount/unlockAccountMachine'
import { shouldSkip } from './utils'
import { useTranslation } from 'next-i18next'

export function useStepperItems(
  service: CheckoutService | UnlockAccountService,
  {
    isUnlockAccount,
    hookType,
    isRenew,
    existingMember: isExistingMember,
  }: {
    isRenew?: boolean
    isUnlockAccount?: boolean
    hookType?: CheckoutHookType
    existingMember?: boolean
  } = {}
) {
  const [state] = useActor(service)
  const {t} = useTranslation()
  
  if (isUnlockAccount) {
    return [
      {
        name: t("checkout.preview.enterEmail"),
        to: 'ENTER_EMAIL',
      },
      {
        name: t("common.password"),
      },
      {
        name: t("checkout.preview.signedIn"),
      },
    ]
  }

  const {
    paywallConfig,
    skipQuantity,
    skipRecipient,
    hook,
    existingMember,
    payment,
    renew,
  } = state.context as CheckoutMachineContext
  if (!paywallConfig.locks || Object.keys(paywallConfig.locks).length === 0) {
    return []
  }
  const [address, config] = Object.entries(paywallConfig.locks)[0]
  const hasOneLock = Object.keys(paywallConfig.locks).length === 1
  const lockConfig = {
    address,
    ...config,
  }

  const isExpired = isRenew || renew
  const { skipQuantity: skipLockQuantity, skipRecipient: skipLockRecipient } =
    shouldSkip({
      paywallConfig,
      lock: lockConfig,
    })

  const isPassword = hook === 'password' || hookType === 'password'
  const isCaptcha = hook === 'captcha' || hookType === 'captcha'
  const isPromo = hook === 'promocode' || hookType === 'promocode'
  const isGuild = hook === 'guild' || hookType === 'guild'
  const isMember = existingMember || isExistingMember
  const checkoutItems: StepItem[] = [
    {
      name: t("checkout.items.select"),
      to: 'SELECT',
    },
    {
      name: t("checkout.items.quantity"),
      skip: (!hasOneLock ? skipQuantity : skipLockQuantity) || isExpired,
      to: 'QUANTITY',
    },
    {
      name: t("checkout.items.addRecipients"),
      to: 'METADATA',
      skip:
        (!hasOneLock
          ? skipRecipient && skipQuantity && !isMember
          : skipLockQuantity && skipLockRecipient && !isMember) || isExpired,
    },
    {
      name: t("checkout.items.signMsg"),
      skip: !paywallConfig.messageToSign,
      to: 'MESSAGE_TO_SIGN',
    },
    isPassword
      ? {
          name: t("checkout.items.subPassword"),
          to: 'PASSWORD',
        }
      : isPromo
      ? {
          name: t("checkout.items.promoCode"),
          to: 'PROMO',
        }
      : isGuild
      ? {
          name: t("checkout.items.guild"),
          to: 'GUILD',
        }
      : {
          name: t("checkout.items.captcha"),
          to: 'CAPTCHA',
          skip: !isCaptcha,
        },
    {
      name: t("checkout.items.paymentMethod"),
      to: 'PAYMENT',
    },
    {
      name: t("checkout.items.addCard"),
      to: 'CARD',
      skip: !['card', 'universal_card'].includes(payment?.method),
    },
    {
      name: t("common.confirm"),
      to: 'CONFIRM',
    },
    {
      name: t("minting.mintingNft"),
    },
  ]

  return checkoutItems
}
