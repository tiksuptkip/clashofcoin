import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedWalletState, DepositRecord, UserProfile, WithdrawalRequest } from '../types';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  QrCode,
  Copy,
  Check,
  ShieldAlert,
  Zap,
  CheckCircle,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';

interface WalletPageProps {
  user: UserProfile;
  walletState: ConnectedWalletState;
  deposits: DepositRecord[];
  withdrawals: WithdrawalRequest[];
  withdrawalFeeRate: number;
  onOpenConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onRequestWithdrawal: (amount: number, network: 'TRC20' | 'BEP20', address: string) => void;
  onSimulateDeposit: (amount: number, network: 'TRC20' | 'BEP20') => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  user,
  walletState,
  deposits,
  withdrawals,
  withdrawalFeeRate,
  onOpenConnectWallet,
  onDisconnectWallet,
  onRequestWithdrawal,
  onSimulateDeposit,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'connect' | 'deposit' | 'withdraw' | 'history'>('connect');

  // Deposit state
  const [depositNetwork, setDepositNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [depositSuccessMsg, setDepositSuccessMsg] = useState(false);

  // Withdrawal state
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50);
  const [withdrawNetwork, setWithdrawNetwork] = useState<'TRC20' | 'BEP20'>('TRC20');
  const [withdrawSubmitted, setWithdrawSubmitted] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');

  const depositAddresses = {
    TRC20: 'TN3W4H8d7ClashOfCoinUSDTTRC20x892019',
    BEP20: '0x94821a7E0459c3a64dE3B21ClashOfCoinBEP20',
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const fee = Number(((withdrawAmount * withdrawalFeeRate) / 100).toFixed(2));
  const netWithdraw = Math.max(0, Number((withdrawAmount - fee).toFixed(2)));

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAddress.trim()) {
      setWithdrawError('Please enter a valid destination USDT address');
      return;
    }
    if (withdrawAmount < 10) {
      setWithdrawError('Minimum withdrawal amount is $10.00');
      return;
    }
    if (withdrawAmount > user.balance) {
      setWithdrawError('Withdrawal amount exceeds your in-site platform balance');
      return;
    }

    setWithdrawError('');
    onRequestWithdrawal(withdrawAmount, withdrawNetwork, withdrawAddress);
    setWithdrawSubmitted(true);
    setTimeout(() => setWithdrawSubmitted(false), 4000);
    setWithdrawAddress('');
  };

  const handleTriggerDepositCallback = (amount: number = 100) => {
    onSimulateDeposit(amount, depositNetwork);
    setDepositSuccessMsg(true);
    setTimeout(() => setDepositSuccessMsg(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header title */}
      <div className="text-start">
        <h1 className="text-2xl font-black text-[#1F2937]">{t('wallet.title')}</h1>
        <p className="text-xs text-[#78716C] mt-1">{t('wallet.subtitle')}</p>
      </div>

      {/* Top Balances Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Site Balance */}
        <div className="p-4 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-semibold">
            <span>{t('wallet.connectCard.siteBalance')}</span>
            <span className="text-[10px] bg-[#10B981]/10 text-[#047857] px-2 py-0.5 rounded-full font-bold">
              Available
            </span>
          </div>
          <div className="font-mono font-black text-2xl text-[#047857]">
            ${user.balance.toFixed(2)} <span className="text-xs font-bold text-[#78716C]">USDT</span>
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">Ready for direct instant battle wagering</div>
        </div>

        {/* Connected Web3 Wallet Balance */}
        <div className="p-4 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-semibold">
            <span>{t('wallet.connectCard.walletBalance')}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                walletState.isConnected
                  ? 'bg-[#10B981]/10 text-[#047857]'
                  : 'bg-[#78716C]/10 text-[#78716C]'
              }`}
            >
              {walletState.isConnected ? walletState.walletName : 'Not Connected'}
            </span>
          </div>
          <div className="font-mono font-black text-2xl text-[#1F2937]">
            ${walletState.isConnected ? walletState.balanceUSDT.toFixed(2) : '0.00'}{' '}
            <span className="text-xs font-bold text-[#78716C]">USDT</span>
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {walletState.isConnected
              ? `Linked to ${walletState.address?.slice(0, 6)}...${walletState.address?.slice(-4)}`
              : 'Connect via RainbowKit to bet from decentralized balance'}
          </div>
        </div>

        {/* Total Volume & Earnings */}
        <div className="p-4 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-semibold">
            <span>Career Net PnL</span>
            <span className="text-[10px] bg-[#F59E0B]/10 text-[#D97706] px-2 py-0.5 rounded-full font-bold">
              Fair Verified
            </span>
          </div>
          <div className="font-mono font-black text-2xl text-[#D97706]">
            +${(user.totalWonAmount - user.totalLostAmount).toFixed(2)}{' '}
            <span className="text-xs font-bold text-[#78716C]">USDT</span>
          </div>
          <div className="text-[11px] text-[#78716C] mt-1">
            {user.totalBetsPlaced} battle rounds entered
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] w-full max-w-xl">
        <button
          onClick={() => setActiveTab('connect')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'connect'
              ? 'bg-white text-[#1F2937] shadow-xs'
              : 'text-[#78716C] hover:text-[#1F2937]'
          }`}
        >
          <Wallet className="w-3.5 h-3.5 text-[#F59E0B]" />
          <span>{t('wallet.tabs.connect')}</span>
        </button>
        <button
          onClick={() => setActiveTab('deposit')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'deposit'
              ? 'bg-white text-[#1F2937] shadow-xs'
              : 'text-[#78716C] hover:text-[#1F2937]'
          }`}
        >
          <ArrowDownLeft className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{t('wallet.tabs.deposit')}</span>
        </button>
        <button
          onClick={() => setActiveTab('withdraw')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'withdraw'
              ? 'bg-white text-[#1F2937] shadow-xs'
              : 'text-[#78716C] hover:text-[#1F2937]'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-[#EF4444]" />
          <span>{t('wallet.tabs.withdraw')}</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'history'
              ? 'bg-white text-[#1F2937] shadow-xs'
              : 'text-[#78716C] hover:text-[#1F2937]'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-[#78716C]" />
          <span>{t('wallet.tabs.history')}</span>
        </button>
      </div>

      {/* Tab 1: Web3 Connect Mode */}
      {activeTab === 'connect' && (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F3EFE6] pb-4">
            <div>
              <h2 className="text-lg font-black text-[#1F2937]">{t('wallet.connectCard.title')}</h2>
              <p className="text-xs text-[#78716C] mt-0.5">{t('wallet.connectCard.desc')}</p>
            </div>
            {walletState.isConnected ? (
              <button
                onClick={onDisconnectWallet}
                className="px-4 py-2 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 text-xs font-bold text-[#DC2626] transition-colors cursor-pointer"
              >
                {t('common.disconnectWallet')}
              </button>
            ) : (
              <button
                onClick={onOpenConnectWallet}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <Wallet className="w-4 h-4 fill-white/20" />
                <span>{t('common.connectWallet')}</span>
              </button>
            )}
          </div>

          {walletState.isConnected ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#78716C]">
                    {t('wallet.connectCard.network')}
                  </span>
                  <span className="text-xs font-bold text-[#1F2937] bg-white px-2 py-0.5 rounded border border-[#E6E1D5]">
                    {walletState.chainName}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-bold text-[#78716C] block mb-1">
                    {t('common.address')}
                  </span>
                  <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E6E1D5]">
                    <span className="font-mono text-xs font-bold text-[#1F2937]">
                      {walletState.address}
                    </span>
                    <button
                      onClick={() => handleCopy(walletState.address || '', 'userWallet')}
                      className="text-[#78716C] hover:text-[#1F2937] ps-2 cursor-pointer"
                    >
                      {copiedKey === 'userWallet' ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#10B981]/10 rounded-2xl border border-[#10B981]/30 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[#047857] font-bold text-sm mb-1">
                    <CheckCircle className="w-4 h-4 text-[#10B981]" />
                    <span>{t('wallet.connectCard.statusConnected')}</span>
                  </div>
                  <p className="text-xs text-[#065F46]">
                    You can place bets directly using either your in-site balance or this connected
                    Web3 wallet. Winnings can be credited directly without manual processing!
                  </p>
                </div>
                <div className="mt-3 flex items-center justify-between font-mono text-xs font-bold text-[#047857]">
                  <span>Connected USDT:</span>
                  <span className="text-base">${walletState.balanceUSDT.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#F5F2EB]/60 rounded-2xl border border-dashed border-[#D9D2C5]">
              <Wallet className="w-12 h-12 text-[#F59E0B] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#1F2937] mb-1">
                {t('wallet.connectCard.statusDisconnected')}
              </h3>
              <p className="text-xs text-[#78716C] max-w-md mx-auto mb-4">
                Connect MetaMask, Trust Wallet, Phantom, Coinbase, or scan with WalletConnect for
                one-click Web3 betting.
              </p>
              <button
                onClick={onOpenConnectWallet}
                className="px-6 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                {t('common.connectWallet')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Manual USDT Deposit */}
      {activeTab === 'deposit' && (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#1F2937]">{t('wallet.depositCard.title')}</h2>
            <p className="text-xs text-[#78716C] mt-0.5">{t('wallet.depositCard.desc')}</p>
          </div>

          {/* Network Selector */}
          <div>
            <label className="text-xs font-bold text-[#78716C] block mb-2">
              {t('wallet.depositCard.chooseNetwork')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-w-sm">
              <button
                onClick={() => setDepositNetwork('TRC20')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  depositNetwork === 'TRC20'
                    ? 'bg-white border-[#F59E0B] text-[#D97706] ring-1 ring-[#F59E0B]/30 shadow-xs'
                    : 'bg-[#F5F2EB] border-[#E6E1D5] text-[#78716C]'
                }`}
              >
                TRON (USDT-TRC20)
              </button>
              <button
                onClick={() => setDepositNetwork('BEP20')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  depositNetwork === 'BEP20'
                    ? 'bg-white border-[#F59E0B] text-[#D97706] ring-1 ring-[#F59E0B]/30 shadow-xs'
                    : 'bg-[#F5F2EB] border-[#E6E1D5] text-[#78716C]'
                }`}
              >
                BNB Chain (USDT-BEP20)
              </button>
            </div>
          </div>

          {/* Address & QR Code Box */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5]">
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-[#E6E1D5]">
              <QrCode className="w-36 h-36 text-[#1F2937]" />
              <span className="text-[10px] text-[#78716C] mt-2 font-mono uppercase">
                {depositNetwork} QR
              </span>
            </div>

            <div className="md:col-span-2 space-y-3">
              <div>
                <span className="text-xs font-bold text-[#78716C] block mb-1">
                  Your Unique Deposit Address ({depositNetwork}):
                </span>
                <div className="flex items-center justify-between bg-white px-3 py-2.5 rounded-xl border border-[#E6E1D5]">
                  <span className="font-mono text-xs font-bold text-[#1F2937] break-all">
                    {depositAddresses[depositNetwork]}
                  </span>
                  <button
                    onClick={() => handleCopy(depositAddresses[depositNetwork], 'depAddress')}
                    className="text-[#78716C] hover:text-[#1F2937] ps-3 shrink-0 cursor-pointer"
                  >
                    {copiedKey === 'depAddress' ? (
                      <Check className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#F59E0B]/10 rounded-xl border border-[#F59E0B]/30 text-xs text-[#B45309] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Important Notice</span>
                </div>
                <p>{t('wallet.depositCard.sendOnlyNote')}</p>
              </div>

              {/* Instant Simulation Action */}
              <div className="pt-2 flex flex-wrap gap-2">
                <button
                  onClick={() => handleTriggerDepositCallback(100)}
                  className="px-4 py-2 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t('wallet.depositCard.simulatedCallback')}</span>
                </button>
              </div>

              {depositSuccessMsg && (
                <div className="p-2.5 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs font-bold text-[#047857] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#10B981]" />
                  <span>NOWPayments webhook confirmed: $100.00 USDT added to your balance!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Withdraw Form */}
      {activeTab === 'withdraw' && (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#1F2937]">{t('wallet.withdrawCard.title')}</h2>
            <p className="text-xs text-[#78716C] mt-0.5">{t('wallet.withdrawCard.desc')}</p>
          </div>

          <form onSubmit={handleWithdrawSubmit} className="space-y-4 max-w-xl">
            {withdrawError && (
              <div className="p-3 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444] font-medium">
                {withdrawError}
              </div>
            )}

            {withdrawSubmitted && (
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs text-[#047857] font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>
                  Withdrawal request submitted! Status is PENDING and awaiting admin approval.
                </span>
              </div>
            )}

            {/* Network */}
            <div>
              <label className="text-xs font-bold text-[#78716C] block mb-1">
                Withdrawal Network
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWithdrawNetwork('TRC20')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    withdrawNetwork === 'TRC20'
                      ? 'bg-white border-[#EF4444] text-[#DC2626] ring-1 ring-[#EF4444]/30 shadow-xs'
                      : 'bg-[#F5F2EB] border-[#E6E1D5] text-[#78716C]'
                  }`}
                >
                  USDT (TRC20 - TRON)
                </button>
                <button
                  type="button"
                  onClick={() => setWithdrawNetwork('BEP20')}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    withdrawNetwork === 'BEP20'
                      ? 'bg-white border-[#EF4444] text-[#DC2626] ring-1 ring-[#EF4444]/30 shadow-xs'
                      : 'bg-[#F5F2EB] border-[#E6E1D5] text-[#78716C]'
                  }`}
                >
                  USDT (BEP20 - BNB Chain)
                </button>
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="text-xs font-bold text-[#78716C] block mb-1">
                {t('wallet.withdrawCard.withdrawAddress')}
              </label>
              <input
                type="text"
                required
                value={withdrawAddress}
                onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder="Enter recipient USDT address..."
                className="w-full px-3 py-2.5 bg-[#F5F2EB] border border-[#E6E1D5] rounded-xl font-mono text-xs text-[#1F2937] focus:outline-none focus:border-[#EF4444]"
              />
            </div>

            {/* Amount */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-[#78716C] mb-1">
                <span>{t('wallet.withdrawCard.withdrawAmount')}</span>
                <span>
                  Available: <strong className="font-mono text-[#047857]">${user.balance.toFixed(2)}</strong>
                </span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  min={10}
                  step={1}
                  required
                  value={withdrawAmount || ''}
                  onChange={(e) => setWithdrawAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2.5 bg-[#F5F2EB] border border-[#E6E1D5] rounded-xl font-mono text-sm font-bold text-[#1F2937] focus:outline-none focus:border-[#EF4444]"
                />
                <button
                  type="button"
                  onClick={() => setWithdrawAmount(Math.floor(user.balance))}
                  className="absolute inset-y-1 end-1 px-3 bg-white hover:bg-[#E6E1D5] rounded-lg text-xs font-bold text-[#78716C] transition-colors cursor-pointer"
                >
                  MAX
                </button>
              </div>
            </div>

            {/* Calculation summary */}
            <div className="p-3 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[#78716C]">
                <span>{t('wallet.withdrawCard.feeNotice')} ({withdrawalFeeRate}%):</span>
                <span className="font-mono font-bold text-[#DC2626]">-${fee.toFixed(2)} USDT</span>
              </div>
              <div className="flex items-center justify-between font-bold text-[#1F2937] pt-1 border-t border-[#E6E1D5]">
                <span>{t('wallet.withdrawCard.receiveAmount')}:</span>
                <span className="font-mono font-black text-sm text-[#047857]">
                  ${netWithdraw.toFixed(2)} USDT
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('wallet.withdrawCard.submitRequest')}
            </button>

            <p className="text-[11px] text-[#A8A29E] text-center">
              {t('wallet.withdrawCard.pendingWarning')}
            </p>
          </form>
        </div>
      )}

      {/* Tab 4: Transactions History */}
      {activeTab === 'history' && (
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#1F2937]">{t('wallet.tabs.history')}</h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Ledger of all deposits, withdrawals, and platform balance adjustments.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-[#78716C] uppercase">Withdrawal Requests</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1D5] text-[#78716C]">
                    <th className="py-2 text-start font-bold">ID</th>
                    <th className="py-2 text-start font-bold">Network</th>
                    <th className="py-2 text-start font-bold">Destination</th>
                    <th className="py-2 text-end font-bold">Gross</th>
                    <th className="py-2 text-end font-bold">Fee</th>
                    <th className="py-2 text-end font-bold">Net</th>
                    <th className="py-2 text-end font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFE6]">
                  {withdrawals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-4 text-center text-[#A8A29E]">
                        No withdrawal requests found
                      </td>
                    </tr>
                  ) : (
                    withdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-[#F5F2EB]/50">
                        <td className="py-2.5 font-mono font-bold text-[#1F2937]">#{w.id.slice(-6)}</td>
                        <td className="py-2.5 font-bold">{w.network}</td>
                        <td className="py-2.5 font-mono text-[#78716C] truncate max-w-[140px]">
                          {w.userAddress}
                        </td>
                        <td className="py-2.5 text-end font-mono">${w.amount.toFixed(2)}</td>
                        <td className="py-2.5 text-end font-mono text-[#DC2626]">-${w.fee.toFixed(2)}</td>
                        <td className="py-2.5 text-end font-mono font-bold text-[#047857]">
                          ${w.netAmount.toFixed(2)}
                        </td>
                        <td className="py-2.5 text-end">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              w.status === 'APPROVED'
                                ? 'bg-[#10B981]/10 text-[#047857]'
                                : w.status === 'PENDING'
                                ? 'bg-[#F59E0B]/10 text-[#D97706]'
                                : 'bg-[#EF4444]/10 text-[#DC2626]'
                            }`}
                          >
                            {w.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <h3 className="text-xs font-bold text-[#78716C] uppercase pt-4">Deposit Ledger</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-start text-xs">
                <thead>
                  <tr className="border-b border-[#E6E1D5] text-[#78716C]">
                    <th className="py-2 text-start font-bold">Tx Hash</th>
                    <th className="py-2 text-start font-bold">Network</th>
                    <th className="py-2 text-start font-bold">Date</th>
                    <th className="py-2 text-end font-bold">Amount</th>
                    <th className="py-2 text-end font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3EFE6]">
                  {deposits.map((d) => (
                    <tr key={d.id} className="hover:bg-[#F5F2EB]/50">
                      <td className="py-2.5 font-mono text-[#78716C] truncate max-w-[150px]">
                        {d.txHash}
                      </td>
                      <td className="py-2.5 font-bold">{d.network}</td>
                      <td className="py-2.5 text-[#78716C]">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-2.5 text-end font-mono font-bold text-[#047857]">
                        +${d.amount.toFixed(2)} USDT
                      </td>
                      <td className="py-2.5 text-end">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#10B981]/10 text-[#047857]">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
