import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Participant } from '../types';
import { TrendingDown, Users, DollarSign, Zap } from 'lucide-react';

interface TeamDownPanelProps {
  participants: Participant[];
  totalPool: number;
  opposingPool: number;
  commission: number;
  userBalance: number;
  walletBalance: number;
  isWalletConnected: boolean;
  isLocked: boolean;
  onPlaceBet: (amount: number, source: 'SITE_BALANCE' | 'WEB3_WALLET') => void;
}

export const TeamDownPanel: React.FC<TeamDownPanelProps> = ({
  participants,
  totalPool,
  opposingPool,
  commission,
  userBalance,
  walletBalance,
  isWalletConnected,
  isLocked,
  onPlaceBet,
}) => {
  const { t } = useTranslation();
  const [betAmount, setBetAmount] = useState<number>(25);
  const [betSource, setBetSource] = useState<'SITE_BALANCE' | 'WEB3_WALLET'>('SITE_BALANCE');

  const downParticipants = participants.filter((p) => p.side === 'DOWN');

  // Multiplier calculation for this bet
  const projectedWinningPool = totalPool + betAmount;
  const projectedProfit =
    projectedWinningPool > 0
      ? (betAmount / projectedWinningPool) * opposingPool * (1 - commission / 100)
      : 0;
  const projectedPayout = betAmount + projectedProfit;
  const multiplier = betAmount > 0 ? (projectedPayout / betAmount).toFixed(2) : '1.00';

  const quickAmounts = [5, 10, 25, 50, 100, 250];

  const handleQuickAdd = (amt: number) => {
    setBetAmount(amt);
  };

  const currentAvailableBalance = betSource === 'SITE_BALANCE' ? userBalance : walletBalance;

  return (
    <div className="flex flex-col h-full bg-[#F5F2EB]/95 backdrop-blur-md rounded-2xl border-2 border-[#EF4444]/30 p-4 shadow-sm hover:border-[#EF4444]/50 transition-all">
      {/* Team DOWN Header */}
      <div className="flex items-center justify-between border-b border-[#E6E1D5] pb-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EF4444] flex items-center justify-center text-white shadow-xs">
            <TrendingDown className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-[#EF4444] text-lg leading-none">
                {t('common.teamDown')}
              </h3>
              <span className="text-xs font-bold text-white bg-[#EF4444] px-1.5 py-0.2 rounded-md">
                {multiplier}x
              </span>
            </div>
            <span className="text-[11px] text-[#78716C] flex items-center gap-1 mt-0.5">
              <Users className="w-3 h-3" />
              {downParticipants.length} {t('common.participants')}
            </span>
          </div>
        </div>

        <div className="text-end">
          <div className="text-[10px] text-[#78716C] uppercase font-bold">{t('common.totalPool')}</div>
          <div className="font-mono font-black text-lg text-[#EF4444]">
            ${totalPool.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Betting Box */}
      <div className="bg-white rounded-xl border border-[#E6E1D5] p-3 mb-4 shadow-xs">
        <div className="flex items-center justify-between text-xs text-[#78716C] mb-1.5">
          <span>{t('common.placeBet')}</span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium">
              {t('common.balance')}:{' '}
              <strong className="font-mono font-bold text-[#1F2937]">
                ${currentAvailableBalance.toFixed(2)}
              </strong>
            </span>
          </div>
        </div>

        {/* Source Selector (Site Balance or Connected Wallet) */}
        {isWalletConnected && (
          <div className="grid grid-cols-2 gap-1 mb-2 p-1 bg-[#F5F2EB] rounded-lg text-xs font-semibold">
            <button
              onClick={() => setBetSource('SITE_BALANCE')}
              className={`py-1 rounded-md transition-colors cursor-pointer ${
                betSource === 'SITE_BALANCE'
                  ? 'bg-white text-[#1F2937] shadow-xs'
                  : 'text-[#78716C]'
              }`}
            >
              Site Balance (${userBalance.toFixed(0)})
            </button>
            <button
              onClick={() => setBetSource('WEB3_WALLET')}
              className={`py-1 rounded-md transition-colors cursor-pointer ${
                betSource === 'WEB3_WALLET'
                  ? 'bg-white text-[#EF4444] shadow-xs'
                  : 'text-[#78716C]'
              }`}
            >
              Web3 Wallet (${walletBalance.toFixed(0)})
            </button>
          </div>
        )}

        {/* Amount Input */}
        <div className="relative mb-2">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none text-[#78716C]">
            <DollarSign className="w-4 h-4 text-[#EF4444]" />
          </div>
          <input
            type="number"
            min={1}
            max={1000}
            value={betAmount || ''}
            onChange={(e) => setBetAmount(Math.max(0, parseFloat(e.target.value) || 0))}
            placeholder="Bet amount..."
            className="w-full ps-9 pe-16 py-2 bg-[#FFFDF9] border border-[#E6E1D5] rounded-xl font-mono text-base font-bold text-[#1F2937] focus:outline-none focus:border-[#EF4444] focus:ring-1 focus:ring-[#EF4444]"
          />
          <button
            onClick={() => setBetAmount(Math.floor(Math.min(1000, currentAvailableBalance)))}
            className="absolute inset-y-1 end-1 px-2.5 bg-[#F5F2EB] hover:bg-[#E6E1D5] rounded-lg text-[11px] font-bold text-[#78716C] transition-colors cursor-pointer"
          >
            MAX
          </button>
        </div>

        {/* Quick Amount Chips */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {quickAmounts.map((amt) => (
            <button
              key={amt}
              onClick={() => handleQuickAdd(amt)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                betAmount === amt
                  ? 'bg-[#EF4444] text-white border-[#EF4444]'
                  : 'bg-[#F5F2EB] border-[#E6E1D5] text-[#78716C] hover:bg-[#E6E1D5]'
              }`}
            >
              +${amt}
            </button>
          ))}
        </div>

        {/* Payout Preview */}
        <div className="flex items-center justify-between text-xs bg-[#EF4444]/5 rounded-lg p-2 border border-[#EF4444]/20 mb-3">
          <span className="text-[#DC2626] font-medium">{t('arena.estimatedPayout')}:</span>
          <span className="font-mono font-black text-sm text-[#DC2626]">
            ${projectedPayout.toFixed(2)}
          </span>
        </div>

        {/* Bet Action Button */}
        <button
          onClick={() => onPlaceBet(betAmount, betSource)}
          disabled={isLocked || betAmount < 1 || betAmount > currentAvailableBalance}
          className={`w-full min-h-[48px] py-3 rounded-xl font-black text-base text-white flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
            isLocked
              ? 'bg-[#A8A29E] cursor-not-allowed opacity-60'
              : betAmount > currentAvailableBalance
              ? 'bg-[#DC2626] opacity-80 cursor-not-allowed'
              : 'bg-[#EF4444] hover:bg-[#DC2626] active:scale-[0.99] pulse-ruby'
          }`}
        >
          <Zap className="w-5 h-5 fill-white" />
          <span>
            {isLocked
              ? t('common.bettingLocked')
              : betAmount > currentAvailableBalance
              ? t('common.insufficientBalance')
              : `${t('common.placeBet')} ($${betAmount})`}
          </span>
        </button>
      </div>

      {/* Participants List */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between text-xs font-bold text-[#78716C] uppercase mb-2">
          <span>{t('common.participants')}</span>
          <span className="font-mono">${totalPool.toLocaleString()}</span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-1.5 pe-1 max-h-[220px]">
          {downParticipants.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#78716C] font-bold bg-[#FFFDF9]/60 rounded-xl border border-dashed border-[#D9D2C5]">
              بانتظار أول رهان...
            </div>
          ) : (
            downParticipants.map((p) => (
              <div
                key={p.id}
                className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-colors ${
                  p.isUser
                    ? 'bg-[#EF4444]/10 border-[#EF4444]/40'
                    : 'bg-white/80 border-[#E6E1D5]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={p.avatar}
                    alt={p.name}
                    className="w-6 h-6 rounded-full bg-[#E5DFD3] shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <span className="font-bold text-[#1F2937] truncate max-w-[100px]">
                      {p.name} {p.isUser ? '(You)' : ''}
                    </span>
                    <span className="text-[10px] text-[#A8A29E]">
                      {new Date(p.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>

                <div className="font-mono font-black text-sm text-[#EF4444]">
                  +${p.amount.toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
