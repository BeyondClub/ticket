import { TFunction } from 'i18next'
import { createContext, useContext } from 'react'
interface LanguageContextType {
  t: TFunction | (() => string)
}

export const LanguageContext = createContext<LanguageContextType>({
  t: () => '',
})

/**
 * useLanguage returns the t function from i18next which can be shared across components
 *
 * In order for this to work, the page must be wrapped in the LanguageContext.Provider
 *
 * @example check src/pages/index.tsx for an example
 */
export const useLanguage = () => {
  return useContext(LanguageContext)
}
