export type CoinSymbol = 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP';

export type RoundDuration = 15 | 30 | 45 | 60; // 15s, 30s, 45s, 60s in seconds (default 30s)

export type PredictionSide = 'UP' | 'DOWN';

export type RoundStatus = 'BETTING_OPEN' | 'LOCKED' | 'SETTLED';

export interface CoinInfo {
  symbol: CoinSymbol;
  name: string;
  binanceSymbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  decimals: number;
  iconBg: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar: string;
  side: PredictionSide;
  amount: number;
  timestamp: number;
  isUser?: boolean;
}

export interface Round {
  id: string;
  coin: CoinSymbol;
  duration: RoundDuration;
  startTime: number;
  lockTime: number; // 10 seconds before endTime
  endTime: number;
  entryPrice: number;
  exitPrice?: number;
  status: RoundStatus;
  winningSide?: PredictionSide;
  upPool: number;
  downPool: number;
  participants: Participant[];
  serverSeed: string;
  clientSeed: string;
  provablyFairHash: string;
}

export interface UserBet {
  id: string;
  roundId: string;
  coin: CoinSymbol;
  side: PredictionSide;
  amount: number;
  timestamp: number;
  entryPrice: number;
  exitPrice?: number;
  status: 'ACTIVE' | 'WON' | 'LOST';
  payout?: number;
  userIdentifier: string;
  source: 'SITE_BALANCE' | 'WEB3_WALLET';
}

export interface UserProfile {
  id: string;
  email?: string;
  address?: string;
  balance: number;
  walletBalance: number;
  referralCode: string;
  referredBy?: string;
  referralEarnings: number;
  totalBetsPlaced: number;
  totalWonAmount: number;
  totalLostAmount: number;
  createdAt: number;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userAddress: string;
  amount: number;
  fee: number;
  netAmount: number;
  network: 'TRC20' | 'BEP20';
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: number;
}

export interface DepositRecord {
  id: string;
  userId: string;
  amount: number;
  network: 'TRC20' | 'BEP20';
  address: string;
  txHash: string;
  status: 'CONFIRMED';
  createdAt: number;
}

export interface AdminSettings {
  houseCommission: number; // e.g. 3%
  withdrawalFee: number; // e.g. 1.5%
  minBet: number;
  maxBet: number;
}

export interface ConnectedWalletState {
  isConnected: boolean;
  address: string | null;
  walletName: 'MetaMask' | 'Trust Wallet' | 'Coinbase Wallet' | 'Phantom' | 'WalletConnect' | null;
  chainId: number;
  chainName: string;
  balanceUSDT: number;
}
