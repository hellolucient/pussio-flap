export interface Wallet {
  isConnected: boolean
  publicKey: { toString: () => string }
  connect: () => Promise<{ publicKey: { toString: () => string } }>
  disconnect: () => Promise<void>
  signTransaction: (transaction: any) => Promise<any>
  signAllTransactions: (transactions: any[]) => Promise<any[]>
}

export interface WalletContextType {
  wallet: Wallet | null
  setWallet: (wallet: Wallet | null) => void
}

export interface Vote {
  id: string
  imageUrl: string
  startTime: number
  endTime: number
  votes: {
    wallet: string
    voteType: 'pussio' | 'not'
    timestamp: number
  }[]
} 