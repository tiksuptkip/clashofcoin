import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminSettings, DepositRecord, WithdrawalRequest } from '../types';
import {
  Shield,
  Lock,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle,
  XCircle,
  Users,
  Wallet,
  ArrowDownLeft,
  AlertCircle,
} from 'lucide-react';

interface AdminPanelProps {
  settings: AdminSettings;
  onUpdateSettings: (newSettings: Partial<AdminSettings>) => void;
  withdrawals: WithdrawalRequest[];
  deposits: DepositRecord[];
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  settings,
  onUpdateSettings,
  withdrawals,
  deposits,
  onApproveWithdrawal,
  onRejectWithdrawal,
}) => {
  const { t } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  // Settings form state
  const [commissionRate, setCommissionRate] = useState<number>(settings.houseCommission);
  const [withdrawalFeeRate, setWithdrawalFeeRate] = useState<number>(settings.withdrawalFee);
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === 'admin123') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect admin master password. Hint: admin123');
    }
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      houseCommission: commissionRate,
      withdrawalFee: withdrawalFeeRate,
    });
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2500);
  };

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING');

  // If not authenticated, show password prompt
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] shadow-xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D97706]/10 text-[#D97706] flex items-center justify-center mx-auto">
            <Shield className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-black text-[#1F2937]">{t('admin.title')}</h1>
            <p className="text-xs text-[#78716C] mt-1">{t('admin.restricted')}</p>
          </div>

          {authError && (
            <div className="p-2.5 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444] font-semibold flex items-center gap-1.5 justify-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder={t('admin.passwordPlaceholder')}
                className="w-full ps-9 pe-3 py-2.5 bg-[#F5F2EB] border border-[#E6E1D5] rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#F59E0B]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('admin.accessButton')}
            </button>
          </form>

          <p className="text-[11px] text-[#A8A29E]">Default password: admin123</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-[#D97706]/10 text-[#D97706]">
              <Shield className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-black text-[#1F2937]">{t('admin.title')}</h1>
          </div>
          <p className="text-xs text-[#78716C] mt-0.5">
            Operational governance, pool commission rates, withdrawal approvals, and liquidity monitoring.
          </p>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="px-3 py-1.5 rounded-xl border border-[#E6E1D5] bg-white hover:bg-[#F5F2EB] text-xs font-bold text-[#78716C] transition-colors cursor-pointer self-start sm:self-auto"
        >
          Lock Admin Session
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-bold">
            <span>{t('admin.stats.totalUsers')}</span>
            <Users className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="font-mono font-black text-2xl text-[#1F2937]">1,429</div>
          <div className="text-[11px] text-[#047857] font-semibold mt-0.5">+48 today</div>
        </div>

        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-bold">
            <span>{t('admin.stats.totalVolume')}</span>
            <TrendingUp className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="font-mono font-black text-2xl text-[#10B981]">$184,520</div>
          <div className="text-[11px] text-[#78716C] mt-0.5">5 Crypto Rooms</div>
        </div>

        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-bold">
            <span>{t('admin.stats.houseProfit')}</span>
            <DollarSign className="w-4 h-4 text-[#D97706]" />
          </div>
          <div className="font-mono font-black text-2xl text-[#D97706]">$5,535.60</div>
          <div className="text-[11px] text-[#78716C] mt-0.5">{settings.houseCommission}% Net Edge</div>
        </div>

        <div className="p-4 bg-[#FFFDF9] rounded-2xl border border-[#E6E1D5] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#78716C] mb-1 font-bold">
            <span>{t('admin.stats.pendingWithdrawals')}</span>
            <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
          </div>
          <div className="font-mono font-black text-2xl text-[#DC2626]">
            {pendingWithdrawals.length}
          </div>
          <div className="text-[11px] text-[#EF4444] font-semibold mt-0.5">Requires Action</div>
        </div>
      </div>

      {/* House Edge & Fee Settings */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-[#F3EFE6] pb-3">
          <Sliders className="w-4 h-4 text-[#F59E0B]" />
          <h2 className="text-base font-bold text-[#1F2937]">{t('admin.settings.title')}</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 max-w-xl">
          {/* Commission Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#1F2937] mb-1">
              <span>{t('admin.settings.commissionRate')}:</span>
              <span className="font-mono text-sm text-[#D97706] bg-[#F59E0B]/10 px-2 py-0.5 rounded">
                {commissionRate.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={commissionRate}
              onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
              className="w-full accent-[#F59E0B] cursor-pointer"
            />
            <p className="text-[11px] text-[#78716C] mt-0.5">{t('admin.settings.commissionHelp')}</p>
          </div>

          {/* Withdrawal Fee Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#1F2937] mb-1">
              <span>{t('admin.settings.withdrawalFeeRate')}:</span>
              <span className="font-mono text-sm text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded">
                {withdrawalFeeRate.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={withdrawalFeeRate}
              onChange={(e) => setWithdrawalFeeRate(parseFloat(e.target.value))}
              className="w-full accent-[#EF4444] cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {t('admin.settings.saveSettings')}
            </button>
            {settingsSaved && (
              <span className="text-xs font-bold text-[#047857] flex items-center gap-1 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                Settings saved successfully!
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Pending Withdrawals Table with Action Buttons */}
      <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F3EFE6] pb-3">
          <h2 className="text-base font-bold text-[#1F2937]">
            {t('admin.withdrawals.title')} ({pendingWithdrawals.length})
          </h2>
        </div>

        {pendingWithdrawals.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#A8A29E] bg-[#F5F2EB]/50 rounded-2xl border border-dashed border-[#D9D2C5]">
            {t('admin.withdrawals.noPending')}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead>
                <tr className="border-b border-[#E6E1D5] text-[#78716C]">
                  <th className="py-2 text-start font-bold">Request ID</th>
                  <th className="py-2 text-start font-bold">Network</th>
                  <th className="py-2 text-start font-bold">Recipient Address</th>
                  <th className="py-2 text-end font-bold">Gross</th>
                  <th className="py-2 text-end font-bold">Fee</th>
                  <th className="py-2 text-end font-bold">Net Payout</th>
                  <th className="py-2 text-end font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3EFE6]">
                {pendingWithdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-[#F5F2EB]/50">
                    <td className="py-3 font-mono font-bold text-[#1F2937]">#{w.id.slice(-6)}</td>
                    <td className="py-3 font-bold">{w.network}</td>
                    <td className="py-3 font-mono text-[#78716C] truncate max-w-[150px]">
                      {w.userAddress}
                    </td>
                    <td className="py-3 text-end font-mono">${w.amount.toFixed(2)}</td>
                    <td className="py-3 text-end font-mono text-[#DC2626]">-${w.fee.toFixed(2)}</td>
                    <td className="py-3 text-end font-mono font-bold text-[#047857]">
                      ${w.netAmount.toFixed(2)} USDT
                    </td>
                    <td className="py-3 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onApproveWithdrawal(w.id)}
                          className="px-2.5 py-1 bg-[#10B981] hover:bg-[#059669] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>{t('common.approve')}</span>
                        </button>
                        <button
                          onClick={() => onRejectWithdrawal(w.id)}
                          className="px-2.5 py-1 bg-[#EF4444] hover:bg-[#DC2626] text-white text-[11px] font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          <span>{t('common.reject')}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Connected Wallets & Manual Deposits Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Connected Wallets Activity */}
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#F3EFE6] pb-2">
            <Wallet className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-sm font-bold text-[#1F2937]">Active Web3 Battle Wallets</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-[#F5F2EB] rounded-xl">
              <div>
                <span className="font-mono font-bold text-[#1F2937]">0x71c3...3a9f</span>
                <span className="text-[10px] text-[#78716C] block">MetaMask (BNB Chain)</span>
              </div>
              <span className="font-mono font-bold text-[#047857]">$2,450.00 USDT</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#F5F2EB] rounded-xl">
              <div>
                <span className="font-mono font-bold text-[#1F2937]">0x88f2...3b21</span>
                <span className="text-[10px] text-[#78716C] block">WalletConnect Mobile</span>
              </div>
              <span className="font-mono font-bold text-[#047857]">$3,100.00 USDT</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-[#F5F2EB] rounded-xl">
              <div>
                <span className="font-mono font-bold text-[#1F2937]">0x19ae...5c44</span>
                <span className="text-[10px] text-[#78716C] block">Trust Wallet</span>
              </div>
              <span className="font-mono font-bold text-[#047857]">$890.50 USDT</span>
            </div>
          </div>
        </div>

        {/* Manual Deposits Activity */}
        <div className="bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-[#F3EFE6] pb-2">
            <ArrowDownLeft className="w-4 h-4 text-[#10B981]" />
            <h3 className="text-sm font-bold text-[#1F2937]">Manual Inflow Log</h3>
          </div>
          <div className="space-y-2 text-xs">
            {deposits.slice(0, 3).map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2.5 bg-[#F5F2EB] rounded-xl">
                <div>
                  <span className="font-bold text-[#1F2937]">{d.network}</span>
                  <span className="font-mono text-[10px] text-[#78716C] block truncate max-w-[120px]">
                    {d.txHash}
                  </span>
                </div>
                <span className="font-mono font-bold text-[#047857]">+${d.amount.toFixed(2)} USDT</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
