if (!process.env.NEXT_PUBLIC_HELIUS_RPC_URL) {
  throw new Error('Missing NEXT_PUBLIC_HELIUS_RPC_URL environment variable')
}

if (!process.env.NEXT_PUBLIC_POOL_WALLET_ADDRESS) {
  throw new Error('Missing NEXT_PUBLIC_POOL_WALLET_ADDRESS environment variable')
}

export const config = {
  rpcUrl: process.env.NEXT_PUBLIC_HELIUS_RPC_URL,
  pussioToken: {
    mint: '7atgF8KQo4wJrD5ATGX7t1V2zVvykPJbFfNeVf1icFv1',
    symbol: 'PUSSIO',
    decimals: 2,
    requiredAmount: 100,
    poolWallet: process.env.NEXT_PUBLIC_POOL_WALLET_ADDRESS
  }
} as const 

export const ADMIN_WALLETS = process.env.NEXT_PUBLIC_ADMIN_WALLET 
  ? [process.env.NEXT_PUBLIC_ADMIN_WALLET]
  : [] 