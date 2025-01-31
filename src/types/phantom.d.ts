export interface PhantomProvider {
  isPhantom?: boolean
  solana?: {
    isConnected: boolean
    connect: () => Promise<{ publicKey: { toString: () => string } }>
    disconnect: () => Promise<void>
    signTransaction: (transaction: any) => Promise<any>
    signAllTransactions: (transactions: any[]) => Promise<any[]>
    publicKey: { toString: () => string }
  }
}

declare global {
  interface Window {
    phantom?: PhantomProvider
  }
} 