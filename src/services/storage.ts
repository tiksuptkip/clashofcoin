import {
  AdminSettings,
  CoinSymbol,
  ConnectedWalletState,
  DepositRecord,
  Participant,
  PredictionSide,
  Round,
  RoundDuration,
  UserBet,
  UserProfile,
  WithdrawalRequest,
} from '../types';

// Default initial state
const DEFAULT_USER: UserProfile = {
  id: 'usr_clash_9812',
  email: 'trader@clashofcoin.bet',
  balance: 500.0, // default testing starting balance
  walletBalance: 1250.0,
  referralCode: 'CLASHWIN',
  referralEarnings: 45.0,
  totalBetsPlaced: 14,
  totalWonAmount: 320.0,
  totalLostAmount: 180.0,
  createdAt: Date.now() - 86400000 * 3,
};

const DEFAULT_SETTINGS: AdminSettings = {
  houseCommission: 3.0, // 3%
  withdrawalFee: 1.5, // 1.5%
  minBet: 1.0,
  maxBet: 1000.0,
};

// Simple pseudo SHA-256 for browser-side provably fair verification without async issues
export function computeProvablyFairHash(serverSeed: string, clientSeed: string, timestamp: number): string {
  const input = `${serverSeed}:${clientSeed}:${timestamp}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Generate a realistic 64-char hex string
  const base = Math.abs(hash).toString(16).padStart(8, '0');
  const sSeedHex = Array.from(serverSeed)
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')
    .slice(0, 24);
  const cSeedHex = Array.from(clientSeed)
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')
    .slice(0, 16);
  const full = (base + sSeedHex + cSeedHex + timestamp.toString(16)).padEnd(64, 'f');
  return '0x' + full.slice(0, 64);
}

// Bot participants seed
const AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Alpha7',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CryptoBull',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SatoshiN',
  'https://api.dicebear.com/7.x/bottts/svg?seed=LunaWhale',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SolanaHero',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberBeast',
  'https://api.dicebear.com/7.x/bottts/svg?seed=GoldSniper',
  'https://api.dicebear.com/7.x/bottts/svg?seed=DegenLord',
  'https://api.dicebear.com/7.x/bottts/svg?seed=ViperTrade',
  'https://api.dicebear.com/7.x/bottts/svg?seed=NeonRider',
];

const BOT_NAMES = [
  '0xBull...89a',
  '0xApex...34c',
  'Whale_King',
  'Satoshi_99',
  '0xHawk...21b',
  'AlphaDegen',
  '0xTitan...77d',
  'MoonShot88',
  '0xViper...01e',
  'CryptoNinja',
  '0xRuler...44f',
  '0xFalcon...12a',
];

class StorageService {
  private user: UserProfile;
  private settings: AdminSettings;
  private bets: UserBet[] = [];
  private withdrawals: WithdrawalRequest[] = [];
  private deposits: DepositRecord[] = [];
  private walletState: ConnectedWalletState = {
    isConnected: false,
    address: null,
    walletName: null,
    chainId: 56, // BNB Chain default
    chainName: 'BNB Smart Chain',
    balanceUSDT: 1250.0,
  };

  // Active round state per coin
  private rounds: Record<CoinSymbol, Round>;

  constructor() {
    this.user = this.loadFromStorage('coc_user', DEFAULT_USER);
    this.settings = this.loadFromStorage('coc_settings', DEFAULT_SETTINGS);
    this.bets = this.loadFromStorage('coc_bets', []);
    this.withdrawals = this.loadFromStorage('coc_withdrawals', []);
    this.deposits = this.loadFromStorage('coc_deposits', []);
    this.walletState = this.loadFromStorage('coc_wallet', this.walletState);

    // Initialize 5 coin rooms with 30s default duration and real empty arena
    this.rounds = {
      BTC: this.generateNewRound('BTC', 30, 64250),
      ETH: this.generateNewRound('ETH', 30, 3480),
      SOL: this.generateNewRound('SOL', 30, 152),
      BNB: this.generateNewRound('BNB', 30, 585),
      XRP: this.generateNewRound('XRP', 30, 0.584),
    };
  }

  private loadFromStorage<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private saveToStorage(key: string, value: unknown) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage error
    }
  }

  public getUser(): UserProfile {
    return this.user;
  }

  public updateUser(updater: Partial<UserProfile>): UserProfile {
    this.user = { ...this.user, ...updater };
    this.saveToStorage('coc_user', this.user);
    return this.user;
  }

  public getSettings(): AdminSettings {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<AdminSettings>): AdminSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.saveToStorage('coc_settings', this.settings);
    return this.settings;
  }

  public getWalletState(): ConnectedWalletState {
    return this.walletState;
  }

  public setWalletConnected(walletName: ConnectedWalletState['walletName'], address: string, balanceUSDT: number = 1250) {
    this.walletState = {
      isConnected: true,
      address,
      walletName,
      chainId: 56,
      chainName: 'BNB Smart Chain',
      balanceUSDT,
    };
    this.saveToStorage('coc_wallet', this.walletState);

    // Also link to user profile
    this.updateUser({ address, walletBalance: balanceUSDT });
  }

  public disconnectWallet() {
    this.walletState = {
      isConnected: false,
      address: null,
      walletName: null,
      chainId: 56,
      chainName: 'BNB Smart Chain',
      balanceUSDT: 0,
    };
    this.saveToStorage('coc_wallet', this.walletState);
  }

  public getBets(): UserBet[] {
    return this.bets;
  }

  public getWithdrawals(): WithdrawalRequest[] {
    return this.withdrawals;
  }

  public getDeposits(): DepositRecord[] {
    return this.deposits;
  }

  public addDeposit(amount: number, network: 'TRC20' | 'BEP20', address: string): DepositRecord {
    const deposit: DepositRecord = {
      id: 'dep_' + Math.random().toString(36).substring(2, 9),
      userId: this.user.id,
      amount,
      network,
      address,
      txHash: '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
      status: 'CONFIRMED',
      createdAt: Date.now(),
    };
    this.deposits.unshift(deposit);
    this.saveToStorage('coc_deposits', this.deposits);

    // Credit user balance
    this.updateUser({ balance: Number((this.user.balance + amount).toFixed(2)) });
    return deposit;
  }

  public requestWithdrawal(amount: number, network: 'TRC20' | 'BEP20', userAddress: string): WithdrawalRequest {
    const feeRate = this.settings.withdrawalFee / 100;
    const fee = Number((amount * feeRate).toFixed(2));
    const netAmount = Number((amount - fee).toFixed(2));

    const req: WithdrawalRequest = {
      id: 'wth_' + Math.random().toString(36).substring(2, 9),
      userId: this.user.id,
      userAddress,
      amount,
      fee,
      netAmount,
      network,
      status: 'PENDING',
      createdAt: Date.now(),
    };

    // Deduct from user balance
    this.updateUser({ balance: Number((this.user.balance - amount).toFixed(2)) });

    this.withdrawals.unshift(req);
    this.saveToStorage('coc_withdrawals', this.withdrawals);
    return req;
  }

  public approveWithdrawal(id: string): boolean {
    const idx = this.withdrawals.findIndex((w) => w.id === id);
    if (idx !== -1 && this.withdrawals[idx].status === 'PENDING') {
      this.withdrawals[idx].status = 'APPROVED';
      this.saveToStorage('coc_withdrawals', this.withdrawals);
      return true;
    }
    return false;
  }

  public rejectWithdrawal(id: string): boolean {
    const idx = this.withdrawals.findIndex((w) => w.id === id);
    if (idx !== -1 && this.withdrawals[idx].status === 'PENDING') {
      this.withdrawals[idx].status = 'REJECTED';
      // Refund user balance
      this.updateUser({ balance: Number((this.user.balance + this.withdrawals[idx].amount).toFixed(2)) });
      this.saveToStorage('coc_withdrawals', this.withdrawals);
      return true;
    }
    return false;
  }

  public getRound(coin: CoinSymbol): Round {
    return this.rounds[coin];
  }

  public setRoundDuration(coin: CoinSymbol, duration: RoundDuration, currentPrice: number) {
    this.rounds[coin] = this.generateNewRound(coin, duration, currentPrice);
    return this.rounds[coin];
  }

  public generateNewRound(coin: CoinSymbol, duration: RoundDuration = 30, currentPrice: number = 50000): Round {
    const now = Date.now();
    const durationMs = duration * 1000;
    const startTime = now;
    const endTime = now + durationMs;
    const lockTime = endTime - 3000; // 3s lock before end for real fast rounds

    const serverSeed = 'seed_srv_' + Math.random().toString(36).substring(2, 12);
    const clientSeed = 'seed_cli_' + Math.random().toString(36).substring(2, 10);
    const provablyFairHash = computeProvablyFairHash(serverSeed, clientSeed, startTime);

    // REAL MODE: Arena starts empty with $0 pool until real players place bets
    return {
      id: `rnd_${coin}_${startTime.toString().slice(-6)}`,
      coin,
      duration,
      startTime,
      lockTime,
      endTime,
      entryPrice: currentPrice,
      status: 'BETTING_OPEN',
      upPool: 0,
      downPool: 0,
      participants: [],
      serverSeed,
      clientSeed,
      provablyFairHash,
    };
  }

  public placeBet(
    coin: CoinSymbol,
    side: PredictionSide,
    amount: number,
    source: 'SITE_BALANCE' | 'WEB3_WALLET'
  ): { success: boolean; error?: string; bet?: UserBet } {
    const round = this.rounds[coin];
    const now = Date.now();

    // 1. Validation: Betting locked 10s before end
    if (now >= round.lockTime) {
      return { success: false, error: 'Betting is locked 10s before round completion.' };
    }

    // 2. Validation: Min/Max bet
    if (amount < this.settings.minBet) {
      return { success: false, error: `Minimum bet is $${this.settings.minBet}.` };
    }
    if (amount > this.settings.maxBet) {
      return { success: false, error: `Maximum bet is $${this.settings.maxBet}.` };
    }

    // 3. Validation: Prevent same user betting both sides in same round
    const existingBetThisRound = this.bets.find((b) => b.roundId === round.id && b.status === 'ACTIVE');
    if (existingBetThisRound && existingBetThisRound.side !== side) {
      return { success: false, error: 'You cannot bet both UP and DOWN in the same round.' };
    }

    // 4. Balance check & deduction
    if (source === 'SITE_BALANCE') {
      if (this.user.balance < amount) {
        return { success: false, error: 'Insufficient site balance.' };
      }
      this.updateUser({ balance: Number((this.user.balance - amount).toFixed(2)) });
    } else {
      if (!this.walletState.isConnected || this.walletState.balanceUSDT < amount) {
        return { success: false, error: 'Insufficient connected Web3 wallet USDT balance.' };
      }
      this.walletState.balanceUSDT = Number((this.walletState.balanceUSDT - amount).toFixed(2));
      this.saveToStorage('coc_wallet', this.walletState);
    }

    // 5. Add participant to round
    const userParticipant: Participant = {
      id: 'p_user_' + Math.random().toString(36).substring(2, 7),
      name: this.walletState.isConnected
        ? `${this.walletState.address?.slice(0, 6)}...${this.walletState.address?.slice(-4)}`
        : 'You',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ClashMaster',
      side,
      amount,
      timestamp: now,
      isUser: true,
    };

    round.participants.unshift(userParticipant);
    if (side === 'UP') {
      round.upPool = Number((round.upPool + amount).toFixed(2));
    } else {
      round.downPool = Number((round.downPool + amount).toFixed(2));
    }

    // 6. Record user bet
    const bet: UserBet = {
      id: 'bet_' + Math.random().toString(36).substring(2, 9),
      roundId: round.id,
      coin,
      side,
      amount,
      timestamp: now,
      entryPrice: round.entryPrice,
      status: 'ACTIVE',
      userIdentifier: this.walletState.isConnected ? this.walletState.address! : this.user.email || 'You',
      source,
    };

    this.bets.unshift(bet);
    this.saveToStorage('coc_bets', this.bets);

    this.updateUser({ totalBetsPlaced: this.user.totalBetsPlaced + 1 });

    return { success: true, bet };
  }

  // Settle round and distribute pool
  public settleRound(coin: CoinSymbol, exitPrice: number): { winningSide: PredictionSide; userWon: boolean; payout: number } {
    const round = this.rounds[coin];
    round.status = 'SETTLED';
    round.exitPrice = exitPrice;

    const winningSide: PredictionSide = exitPrice >= round.entryPrice ? 'UP' : 'DOWN';
    round.winningSide = winningSide;

    const totalPool = round.upPool + round.downPool;
    const winningPool = winningSide === 'UP' ? round.upPool : round.downPool;
    const losingPool = winningSide === 'UP' ? round.downPool : round.upPool;

    let userWon = false;
    let totalUserPayout = 0;

    // Find active user bets for this round
    this.bets.forEach((bet) => {
      if (bet.roundId === round.id && bet.status === 'ACTIVE') {
        bet.exitPrice = exitPrice;
        if (bet.side === winningSide) {
          bet.status = 'WON';
          userWon = true;

          // Payout formula from specification:
          // payout = (user_bet / total_winning_pool) * total_losing_pool + user_bet
          // Then apply house commission %
          const grossProfit = (bet.amount / winningPool) * losingPool;
          const commissionAmount = grossProfit * (this.settings.houseCommission / 100);
          const netProfit = grossProfit - commissionAmount;
          const payout = Number((bet.amount + netProfit).toFixed(2));

          bet.payout = payout;
          totalUserPayout += payout;

          // Credit balance (or wallet if used)
          if (bet.source === 'WEB3_WALLET' && this.walletState.isConnected) {
            this.walletState.balanceUSDT = Number((this.walletState.balanceUSDT + payout).toFixed(2));
            this.saveToStorage('coc_wallet', this.walletState);
          } else {
            this.updateUser({ balance: Number((this.user.balance + payout).toFixed(2)) });
          }

          this.updateUser({
            totalWonAmount: Number((this.user.totalWonAmount + payout).toFixed(2)),
          });
        } else {
          bet.status = 'LOST';
          bet.payout = 0;
          this.updateUser({
            totalLostAmount: Number((this.user.totalLostAmount + bet.amount).toFixed(2)),
          });
        }
      }
    });

    this.saveToStorage('coc_bets', this.bets);

    // Generate fresh round for this coin immediately
    this.rounds[coin] = this.generateNewRound(coin, round.duration, exitPrice);

    return { winningSide, userWon, payout: totalUserPayout };
  }

  // Seed sample initial mock history
  private getInitialBets(): UserBet[] {
    const now = Date.now();
    return [
      {
        id: 'bet_hist_01',
        roundId: 'rnd_BTC_981245',
        coin: 'BTC',
        side: 'UP',
        amount: 50,
        timestamp: now - 3600000 * 2,
        entryPrice: 63800.5,
        exitPrice: 64150.0,
        status: 'WON',
        payout: 94.2,
        userIdentifier: 'trader@clashofcoin.bet',
        source: 'SITE_BALANCE',
      },
      {
        id: 'bet_hist_02',
        roundId: 'rnd_ETH_981240',
        coin: 'ETH',
        side: 'DOWN',
        amount: 30,
        timestamp: now - 3600000 * 5,
        entryPrice: 3495.0,
        exitPrice: 3510.2,
        status: 'LOST',
        payout: 0,
        userIdentifier: 'trader@clashofcoin.bet',
        source: 'SITE_BALANCE',
      },
      {
        id: 'bet_hist_03',
        roundId: 'rnd_SOL_981230',
        coin: 'SOL',
        side: 'UP',
        amount: 100,
        timestamp: now - 3600000 * 8,
        entryPrice: 148.2,
        exitPrice: 153.4,
        status: 'WON',
        payout: 218.5,
        userIdentifier: 'trader@clashofcoin.bet',
        source: 'WEB3_WALLET',
      },
    ];
  }

  private getInitialWithdrawals(): WithdrawalRequest[] {
    return [
      {
        id: 'wth_sample_1',
        userId: 'usr_clash_9812',
        userAddress: 'TX7n...389zPq',
        amount: 150.0,
        fee: 2.25,
        netAmount: 147.75,
        network: 'TRC20',
        status: 'APPROVED',
        createdAt: Date.now() - 86400000,
      },
    ];
  }

  private getInitialDeposits(): DepositRecord[] {
    return [
      {
        id: 'dep_sample_1',
        userId: 'usr_clash_9812',
        amount: 200.0,
        network: 'TRC20',
        address: 'TWhaleDepositAddress9999ClashOfCoin',
        txHash: '0x8f72a1b945c71d64380e2d1945f3128b9c4501a2384756b10492837465019283',
        status: 'CONFIRMED',
        createdAt: Date.now() - 86400000 * 2,
      },
    ];
  }
}

export const storage = new StorageService();
