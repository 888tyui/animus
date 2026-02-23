import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { config } from '../config.js'
import { cacheGet, cacheSet } from './cache.service.js'

let connection: Connection | null = null

function getConnection(): Connection {
  if (!connection) {
    connection = new Connection(config.SOLANA_RPC_URL, 'confirmed')
  }
  return connection
}

export async function getBalance(address: string): Promise<{ lamports: number; sol: number }> {
  const cacheKey = `sol:balance:${address}`
  const cached = cacheGet<{ lamports: number; sol: number }>(cacheKey)
  if (cached) return cached

  const conn = getConnection()
  const pubkey = new PublicKey(address)
  const lamports = await conn.getBalance(pubkey)
  const result = { lamports, sol: lamports / LAMPORTS_PER_SOL }

  cacheSet(cacheKey, result, 30)
  return result
}

export async function getTokenAccounts(address: string) {
  const cacheKey = `sol:tokens:${address}`
  const cached = cacheGet<any[]>(cacheKey)
  if (cached) return cached

  const conn = getConnection()
  const pubkey = new PublicKey(address)

  const response = await conn.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  })

  const tokens = response.value.map((account) => {
    const parsed = account.account.data.parsed.info
    return {
      mint: parsed.mint,
      amount: parsed.tokenAmount.uiAmountString,
      decimals: parsed.tokenAmount.decimals,
      uiAmount: parsed.tokenAmount.uiAmount,
    }
  })

  cacheSet(cacheKey, tokens, 60)
  return tokens
}

export async function getRecentTransactions(address: string, limit = 20) {
  const cacheKey = `sol:txns:${address}:${limit}`
  const cached = cacheGet<any[]>(cacheKey)
  if (cached) return cached

  const conn = getConnection()
  const pubkey = new PublicKey(address)

  const signatures = await conn.getSignaturesForAddress(pubkey, { limit })

  const transactions = signatures.map((sig) => ({
    signature: sig.signature,
    slot: sig.slot,
    blockTime: sig.blockTime,
    confirmationStatus: sig.confirmationStatus,
    err: sig.err ? true : false,
    memo: sig.memo || null,
  }))

  cacheSet(cacheKey, transactions, 30)
  return transactions
}

export async function getNFTs(address: string) {
  const cacheKey = `sol:nfts:${address}`
  const cached = cacheGet<any[]>(cacheKey)
  if (cached) return cached

  const conn = getConnection()
  const pubkey = new PublicKey(address)

  const response = await conn.getParsedTokenAccountsByOwner(pubkey, {
    programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
  })

  // Filter for NFTs: amount = 1, decimals = 0
  const nfts = response.value
    .filter((account) => {
      const info = account.account.data.parsed.info
      return (
        info.tokenAmount.decimals === 0 &&
        info.tokenAmount.uiAmount === 1
      )
    })
    .map((account) => {
      const info = account.account.data.parsed.info
      return {
        mint: info.mint,
        amount: info.tokenAmount.uiAmountString,
      }
    })

  cacheSet(cacheKey, nfts, 120)
  return nfts
}
