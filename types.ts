export type Size = 'tiny' | 'small' | 'medium' | 'large'
export type SizeStyleProp = Partial<Record<Size, string>>
export type State = 'error' | 'success'
export type StateStyleProp = Partial<Record<State, string>>

export interface UserTokenMetadataInput {
    chain: number
    tokenAddress: string
    userAddress: string
    data: any
}
