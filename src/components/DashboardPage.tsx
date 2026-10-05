import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ConnectedWalletState, UserBet, UserProfile } from '../types';
import {
  Trophy,
  TrendingUp,
  Percent,
  Share2,
  Copy,
  Check,
  Gift,
  Zap,
  ArrowRight,
  Wallet,
} from 'lucide-react';

interface DashboardPageProps {
  user: UserProfile;
  walletState: ConnectedWalletState;
  bets: UserBet[];
  onGoToArena: () => void;
  onOpenConnectWallet: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  walletState,
  bets,
  onGoToArena,
  onOpenConnectWallet,
}) => {
  const { t } = useTranslation();
  const [copiedLink, setCopiedLink] = useState(false);

  const wonBets = bets.filter((b) => b.status === 'WON').length;
  const settledBets = bets.filter((b) => b.status !== 'ACTIVE').length;
  const winRate = settledBets > 0 ? Math.round((wonBets / settledBets) * 100) : 50;
  const netProfit = user.totalWonAmount - user.totalLostAmount;

  const referralLink = `https://ClashOfCoin.bet?ref=${user.referralCode}`;

  const handleCopyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Welcome Hero */}
      <div className="bg-gradient-to-r from-[#F59E0B]/15 via-[#FFFDF9] to-[#10B981]/15 rounded-3xl border border-[#E6E1D5] p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F59E0B]/20 text-[#B45309] text-xs font-bold mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>Fighter Profile & Performance</span>
          </div>
          <h1 className="text-2xl font-black text-[#1F2937]">{t('dashboard.welcome')}</h1>
          <p className="text-xs text-[#78716C] mt-1">
            Track your prediction precision, manage Web3 integrations, and earn passive bonuses.
          </p>
        </div>

        <button
          onClick={onGoToArena}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white text-xs font-black shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-[0.98]"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Enter Live Arena</span>
          <ArrowRight className="w-4 h-4 rtl:rotate-180" />
        </button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="text-xs font-bold text-[#78716C] mb-1">{t('dashboard.totalBets')}</div>
          <div className="font-mono font-black text-2xl text-[#1F2937]">
            {user.totalBetsPlaced}
          </div>
          <div className="text-[11px] text-[#A8A29E] mt-0.5">Across 5 coin rooms</div>
        </div>

        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="text-xs font-bold text-[#78716C] mb-1">{t('dashboard.winRate')}</div>
          <div className="font-mono font-black text-2xl text-[#10B981] flex items-center gap-1">
            <span>{winRate}%</span>
            <Percent className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-[11px] text-[#A8A29E] mt-0.5">{wonBets} won of {settledBets} rounds</div>
        </div>

        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="text-xs font-bold text-[#78716C] mb-1">{t('dashboard.netProfit')}</div>
          <div
            className={`font-mono font-black text-2xl ${
              netProfit >= 0 ? 'text-[#047857]' : 'text-[#DC2626]'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#A8A29E] mt-0.5">Cumulative net earnings</div>
        </div>

        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="text-xs font-bold text-[#78716C] mb-1">{t('dashboard.referralEarned')}</div>
          <div className="font-mono font-black text-2xl text-[#D97706]">
            ${user.referralEarnings.toFixed(2)}
          </div>
          <div className="text-[11px] text-[#A8A29E] mt-0.5">Direct referral commissions</div>
        </div>
      </div>

      {/* Connected Wallet & Account Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Wallet status card */}
        <div className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#F59E0B]" />
              <h2 className="text-sm font-bold text-[#1F2937]">Connected Web3 Credentials</h2>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                walletState.isConnected
                  ? 'bg-[#10B981]/10 text-[#047857]'
                  : 'bg-[#78716C]/10 text-[#78716C]'
              }`}
            >
              {walletState.isConnected ? walletState.walletName : 'No Wallet'}
            </span>
          </div>

          {walletState.isConnected ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#F5F2EB]">
                <span className="text-[#78716C]">Public Address:</span>
                <span className="font-mono font-bold text-[#1F2937]">
                  {walletState.address?.slice(0, 8)}...{walletState.address?.slice(-6)}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#F5F2EB]">
                <span className="text-[#78716C]">Network:</span>
                <span className="font-bold text-[#1F2937]">{walletState.chainName}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#78716C]">Connected USDT Balance:</span>
                <span className="font-mono font-black text-sm text-[#047857]">
                  ${walletState.balanceUSDT.toFixed(2)}
                </span>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-xs text-[#78716C] mb-3">
                Link your Web3 wallet for Polymarket-style instant round execution without manual deposits.
              </p>
              <button
                onClick={onOpenConnectWallet}
                className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                {t('common.connectWallet')}
              </button>
            </div>
          )}
        </div>

        {/* Referral Program Card */}
        <div className="p-5 bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3">
            <div className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-[#10B981]" />
              <h2 className="text-sm font-bold text-[#1F2937]">{t('dashboard.referralProgram')}</h2>
            </div>
            <span className="text-xs font-bold text-[#047857] bg-[#10B981]/15 px-2 py-0.5 rounded-full">
              Earn 5% House Share
            </span>
          </div>

          <p className="text-xs text-[#78716C]">
            Share your unique referral code or link. Friends receive a 10% welcome bonus, and you earn
            5% of the platform edge on all their battle rounds perpetually.
          </p>

          <div>
            <span className="text-[11px] font-bold text-[#78716C] block mb-1">
              {t('dashboard.yourReferralLink')}:
            </span>
            <div className="flex items-center justify-between bg-[#F5F2EB] px-3 py-2 rounded-xl border border-[#E6E1D5]">
              <span className="font-mono text-xs font-bold text-[#1F2937] truncate me-2">
                {referralLink}
              </span>
              <button
                onClick={handleCopyReferral}
                className="flex items-center gap-1 text-xs font-bold text-[#D97706] hover:text-[#B45309] shrink-0 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? t('common.copied') : t('common.copy')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
