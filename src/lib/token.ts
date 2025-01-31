import { Connection, PublicKey, Transaction } from '@solana/web3.js'
import { 
  TOKEN_2022_PROGRAM_ID,
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'
import { config } from '@/config/env'

// Use Helius RPC from config
const connection = new Connection(config.rpcUrl)

export const PUSSIO_TOKEN = {
  mint: config.pussioToken.mint,
  symbol: config.pussioToken.symbol,
  decimals: config.pussioToken.decimals,
  requiredAmount: config.pussioToken.requiredAmount,
  poolWallet: config.pussioToken.poolWallet
}

// Fee percent used for logging transfer amounts
const TRANSFER_FEE_PERCENT = 4 // 4% fee

export const getTokenBalance = async (wallet: any) => {
  try {
    const publicKey = new PublicKey(wallet.publicKey.toString())
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      publicKey,
      { mint: new PublicKey(PUSSIO_TOKEN.mint) }
    )

    if (tokenAccounts.value.length === 0) return 0

    // Get raw balance and convert to UI amount
    const rawBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.amount
    const balance = Number(rawBalance) / Math.pow(10, PUSSIO_TOKEN.decimals)
    console.log('Raw balance:', rawBalance)
    console.log('UI balance:', balance)
    return balance
  } catch (error) {
    console.error('Error getting token balance:', error)
    return 0
  }
}

export const hasEnoughTokens = async (wallet: any): Promise<boolean> => {
  const balance = await getTokenBalance(wallet)
  return balance >= PUSSIO_TOKEN.requiredAmount
}

export const sendTokensToPool = async (wallet: any) => {
  try {
    console.log('Creating token transfer...')
    
    const fromPubkey = new PublicKey(wallet.publicKey.toString())
    const toPubkey = new PublicKey(PUSSIO_TOKEN.poolWallet)
    const mintPubkey = new PublicKey(PUSSIO_TOKEN.mint)

    // Get Associated Token Accounts using Token 2022 Program
    const fromTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      fromPubkey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    const toTokenAccount = await getAssociatedTokenAddress(
      mintPubkey,
      toPubkey,
      false,
      TOKEN_2022_PROGRAM_ID
    )

    console.log('From token account:', fromTokenAccount.toString())
    console.log('To token account:', toTokenAccount.toString())

    // Create transaction
    const transaction = new Transaction()

    // Check if destination token account exists
    const toAccountInfo = await connection.getAccountInfo(toTokenAccount)
    
    // If destination token account doesn't exist, create it first
    if (!toAccountInfo) {
      console.log('Creating pool token account...')
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPubkey,        // payer (sender pays for creation)
          toTokenAccount,    // new ATA address
          toPubkey,         // recipient (pool wallet)
          mintPubkey,       // token mint
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      )
    }

    // Transfer exactly 100 tokens (4% fee will be deducted automatically)
    const transferAmount = PUSSIO_TOKEN.requiredAmount * Math.pow(10, PUSSIO_TOKEN.decimals)
    console.log('Sending amount:', PUSSIO_TOKEN.requiredAmount)
    console.log('Pool will receive:', PUSSIO_TOKEN.requiredAmount * (1 - TRANSFER_FEE_PERCENT/100)) // Use the constant

    transaction.add(
      createTransferCheckedInstruction(
        fromTokenAccount,
        mintPubkey,
        toTokenAccount,
        fromPubkey,
        transferAmount,
        PUSSIO_TOKEN.decimals,
        [],
        TOKEN_2022_PROGRAM_ID
      )
    )

    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = fromPubkey

    console.log('Requesting signature...')
    const signed = await wallet.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())
    
    console.log('Waiting for confirmation...')
    await connection.confirmTransaction(signature)
    
    console.log('Vote transaction confirmed:', signature)
    console.log('Transaction link:', `https://solscan.io/tx/${signature}`)
    return true
  } catch (error: any) {
    console.error('Error sending tokens:', error)
    if (error && typeof error === 'object' && 'logs' in error) {
      console.error('Transaction logs:', error.logs)
    }
    return false
  }
} 