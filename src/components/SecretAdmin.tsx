import React, { useState, useEffect } from 'react';
import {
  AdminSettings,
  DepositRecord,
  Round,
  UserProfile,
  WithdrawalRequest,
} from '../types';
import {
  Shield,
  Lock,
  DollarSign,
  TrendingUp,
  Sliders,
  CheckCircle,
  XCircle,
  Users,
  Play,
  Pause,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Hash,
  ArrowRight,
  Database,
} from 'lucide-react';

interface SecretAdminProps {
  currentSubRoute: '/admin' | '/admin/dashboard';
  onNavigate: (route: '/admin' | '/admin/dashboard' | '/') => void;
  settings: AdminSettings;
  onUpdateSettings: (newSettings: Partial<AdminSettings>) => void;
  user: UserProfile;
  onUpdateUserBalance: (newBalance: number) => void;
  rounds: Round[];
  isRoundsPaused: boolean;
  onToggleRoundsPaused: () => void;
  withdrawals: WithdrawalRequest[];
  deposits: DepositRecord[];
  onApproveWithdrawal: (id: string) => void;
  onRejectWithdrawal: (id: string) => void;
}

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "Sam18101998&&&&";

export const SecretAdmin: React.FC<SecretAdminProps> = ({
  currentSubRoute,
  onNavigate,
  settings,
  onUpdateSettings,
  user,
  onUpdateUserBalance,
  rounds,
  isRoundsPaused,
  onToggleRoundsPaused,
  withdrawals,
  deposits,
  onApproveWithdrawal,
  onRejectWithdrawal,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dashboard state
  const [activeTab, setActiveTab] = useState<'balances' | 'settings' | 'rounds' | 'withdrawals'>('balances');
  const [balanceAdjustmentAmount, setBalanceAdjustmentAmount] = useState<number>(100);
  const [commissionRate, setCommissionRate] = useState<number>(settings.houseCommission);
  const [withdrawalFeeRate, setWithdrawalFeeRate] = useState<number>(settings.withdrawalFee);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Check stored admin session token
  useEffect(() => {
    const session = localStorage.getItem('coc_admin_session') || sessionStorage.getItem('coc_admin_token');
    if (session) {
      setIsAuthenticated(true);
      if (currentSubRoute === '/admin') {
        onNavigate('/admin/dashboard');
      }
    } else if (currentSubRoute === '/admin/dashboard') {
      onNavigate('/admin');
    }
  }, [currentSubRoute]);

  // 100% frontend login handler for Cloudflare Pages static hosting
  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (password.trim() === ADMIN_PASSWORD) {
      localStorage.setItem("coc_admin_session", Date.now().toString());
      setIsAuthenticated(true);
      setError("");
      onNavigate('/admin/dashboard');
    } else {
      setError("كلمة مرور خاطئة");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('coc_admin_session');
    sessionStorage.removeItem('coc_admin_token');
    setIsAuthenticated(false);
    onNavigate('/admin');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      houseCommission: commissionRate,
      withdrawalFee: withdrawalFeeRate,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // If on /admin and not authenticated -> Render Full Black Screen Login
  if (!isAuthenticated || currentSubRoute === '/admin') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black text-white p-4">
        <div className="w-full max-w-md bg-[#121212] border border-[#27272a] rounded-3xl p-8 shadow-2xl space-y-6 text-center">
          {/* Lock Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center mx-auto border border-[#F59E0B]/20">
            <Lock className="w-8 h-8" />
          </div>

          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ClashOfCoin Admin Access
            </h1>
            <p className="text-xs text-[#a1a1aa] mt-1.5 font-mono">
              Restricted Area · Authorization Required
            </p>
          </div>

          {error && (
            <div className="p-3 bg-[#EF4444]/15 border border-[#EF4444]/30 rounded-2xl text-xs font-bold text-[#F87171] flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="text-start">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin Password"
                className="w-full px-4 py-3.5 bg-[#1c1c1f] border border-[#3f3f46] rounded-2xl text-sm text-white placeholder-[#71717a] focus:outline-none focus:border-[#F59E0B] focus:ring-1 focus:ring-[#F59E0B] transition-all font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold text-base rounded-2xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <span>دخول</span>
            </button>
          </form>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('/')}
              className="text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors cursor-pointer"
            >
              ← العودة إلى الموقع الرئيسي
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Dashboard View (/admin/dashboard)
  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/15 text-[#F59E0B] flex items-center justify-center border border-[#F59E0B]/30">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <span>لوحة تحكم الإدارة العليا</span>
                <span className="text-[11px] font-mono text-[#F59E0B] bg-[#F59E0B]/15 px-2 py-0.5 rounded-full border border-[#F59E0B]/30">
                  /admin/dashboard
                </span>
              </h1>
              <p className="text-xs text-[#a1a1aa]">
                التحكم الكامل بأنظمة ClashOfCoin.bet والمحافظ والجولات المباشرة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('/')}
              className="px-4 py-2.5 rounded-xl border border-[#3f3f46] bg-[#18181b] hover:bg-[#27272a] text-xs font-bold text-[#e4e4e7] transition-colors cursor-pointer"
            >
              الذهاب للحلبة (الموقع)
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>

        {/* Dashboard 4 Feature Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#18181b] p-1.5 rounded-2xl border border-[#27272a]">
          <button
            onClick={() => setActiveTab('balances')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'balances'
                ? 'bg-[#F59E0B] text-black shadow-md'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>التحكم بالأرصدة</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-[#F59E0B] text-black shadow-md'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>نسبة ربح المنصة</span>
          </button>

          <button
            onClick={() => setActiveTab('rounds')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'rounds'
                ? 'bg-[#F59E0B] text-black shadow-md'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>إيقاف/تشغيل وسجل الجولات</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 relative ${
              activeTab === 'withdrawals'
                ? 'bg-[#F59E0B] text-black shadow-md'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>طلبات السحب</span>
            {pendingWithdrawals.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-ping absolute top-2 end-2" />
            )}
          </button>
        </div>

        {/* 1. التحكم بالأرصدة (Balance Control) */}
        {activeTab === 'balances' && (
          <div className="bg-[#121212] rounded-3xl border border-[#27272a] p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-4">
              <div>
                <h2 className="text-lg font-black text-white">التحكم بأرصدة اللاعبين والمحافظ</h2>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  إدارة الرصيد الفعلي للمستخدم التجريبي، شحن أو سحب فوري
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* User Current Balance Card */}
              <div className="p-5 bg-[#18181b] rounded-2xl border border-[#27272a] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#a1a1aa]">حساب المستخدم الحالي</span>
                  <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded">
                    نشط
                  </span>
                </div>
                <div className="text-sm font-bold text-white font-mono">{user.email}</div>
                <div>
                  <span className="text-xs text-[#a1a1aa] block mb-1">الرصيد المتاح على المنصة:</span>
                  <div className="text-3xl font-black font-mono text-[#F59E0B]">
                    ${user.balance.toFixed(2)}{' '}
                    <span className="text-sm text-[#a1a1aa]">USDT</span>
                  </div>
                </div>
              </div>

              {/* Balance Modifier Form */}
              <div className="p-5 bg-[#18181b] rounded-2xl border border-[#27272a] space-y-4">
                <span className="text-xs font-bold text-[#a1a1aa] block">
                  تعديل الرصيد (إضافة أو خصم)
                </span>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={1}
                    value={balanceAdjustmentAmount}
                    onChange={(e) => setBalanceAdjustmentAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="flex-1 px-4 py-2.5 bg-[#27272a] border border-[#3f3f46] rounded-xl text-white font-mono text-sm focus:outline-none focus:border-[#F59E0B]"
                    placeholder="المبلغ بالدولار..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      onUpdateUserBalance(user.balance + balanceAdjustmentAmount);
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 2000);
                    }}
                    className="min-h-[48px] py-2.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    + إضافة ${balanceAdjustmentAmount}
                  </button>
                  <button
                    onClick={() => {
                      onUpdateUserBalance(Math.max(0, user.balance - balanceAdjustmentAmount));
                      setSavedSuccess(true);
                      setTimeout(() => setSavedSuccess(false), 2000);
                    }}
                    className="min-h-[48px] py-2.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
                  >
                    - خصم ${balanceAdjustmentAmount}
                  </button>
                </div>

                {savedSuccess && (
                  <div className="text-xs font-bold text-[#10B981] flex items-center gap-1.5 justify-center pt-1 animate-in fade-in">
                    <CheckCircle className="w-4 h-4" />
                    <span>تم تحديث رصيد الحساب بنجاح!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. نسبة ربح المنصة (Platform House Edge & Fee Slider) */}
        {activeTab === 'settings' && (
          <div className="bg-[#121212] rounded-3xl border border-[#27272a] p-6 space-y-6">
            <div>
              <h2 className="text-lg font-black text-white">نسبة ربح المنصة والعمولات (House Edge)</h2>
              <p className="text-xs text-[#a1a1aa] mt-0.5">
                التحكم بالعمولة المقتطعة من أحواض الرهان ورسوم شبكة السحب
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-xl">
              {/* House Commission Slider */}
              <div className="p-4 bg-[#18181b] rounded-2xl border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>نسبة عمولة المنصة على الأرباح:</span>
                  <span className="font-mono text-base text-[#F59E0B] bg-[#F59E0B]/15 px-2.5 py-0.5 rounded-lg border border-[#F59E0B]/30">
                    {commissionRate.toFixed(1)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={0.5}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value))}
                  className="w-full accent-[#F59E0B] cursor-pointer"
                />
                <p className="text-xs text-[#71717a]">
                  تُقتطع هذه النسبة تلقائياً من حوض الفريق الخاسر قبل توزيع الأرباح على الفائزين.
                </p>
              </div>

              {/* Withdrawal Fee Slider */}
              <div className="p-4 bg-[#18181b] rounded-2xl border border-[#27272a] space-y-2">
                <div className="flex items-center justify-between text-sm font-bold text-white">
                  <span>رسوم السحب الإدارية (%):</span>
                  <span className="font-mono text-base text-[#EF4444] bg-[#EF4444]/15 px-2.5 py-0.5 rounded-lg border border-[#EF4444]/30">
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
                <p className="text-xs text-[#71717a]">
                  رسوم معالجة شبكات البلوكشين (TRC20 / BEP20) عند طلب السحب.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="min-h-[48px] px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-black font-extrabold text-sm rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  حفظ إعدادات الأرباح
                </button>
                {savedSuccess && (
                  <span className="text-xs font-bold text-[#10B981] flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" />
                    تم حفظ التعديلات بنجاح!
                  </span>
                )}
              </div>
            </form>
          </div>
        )}

        {/* 3. إيقاف/تشغيل الجولات وسجل كل الجولات (Pause/Resume & Rounds Ledger) */}
        {activeTab === 'rounds' && (
          <div className="bg-[#121212] rounded-3xl border border-[#27272a] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
              <div>
                <h2 className="text-lg font-black text-white">إيقاف/تشغيل الجولات وسجل كل الجولات</h2>
                <p className="text-xs text-[#a1a1aa] mt-0.5">
                  التحكم بالبث المباشر للجولات وتجميد المراهنات في حالات الصيانة
                </p>
              </div>

              {/* Pause / Resume Battle Toggle */}
              <button
                onClick={onToggleRoundsPaused}
                className={`min-h-[48px] px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                  isRoundsPaused
                    ? 'bg-[#10B981] text-black hover:bg-[#059669]'
                    : 'bg-[#EF4444] text-white hover:bg-[#DC2626]'
                }`}
              >
                {isRoundsPaused ? (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>تشغيل واستئناف الجولات</span>
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>إيقاف وتجميد الجولات مؤقتاً</span>
                  </>
                )}
              </button>
            </div>

            {/* Current Rounds Status */}
            <div>
              <h3 className="text-xs font-bold text-[#a1a1aa] uppercase mb-3">
                الحلبات النشطة (BTC, ETH, SOL, BNB, XRP)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {rounds.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 bg-[#18181b] rounded-2xl border border-[#27272a] space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-white">{r.coin}/USDT</span>
                      <span className="font-mono text-[10px] text-[#F59E0B]">#{r.id.slice(-6)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[#a1a1aa]">
                      <span>سعر الدخول:</span>
                      <span className="font-mono font-bold text-white">
                        ${r.entryPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#a1a1aa]">
                      <span>إجمالي الحوض:</span>
                      <span className="font-mono font-bold text-[#10B981]">
                        ${(r.upPool + r.downPool).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[#a1a1aa] pt-1 border-t border-[#27272a]">
                      <span>عدد المتسابقين:</span>
                      <span className="font-bold text-white">{r.participants.length} لاعب</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. طلبات السحب المعلقة (Pending Withdrawals Approval) */}
        {activeTab === 'withdrawals' && (
          <div className="bg-[#121212] rounded-3xl border border-[#27272a] p-6 space-y-4">
            <h2 className="text-lg font-black text-white">
              طلبات سحب الأرباح المعلقة ({pendingWithdrawals.length})
            </h2>

            {pendingWithdrawals.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#71717a] bg-[#18181b] rounded-2xl border border-dashed border-[#27272a]">
                لا توجد طلبات سحب معلقة حالياً.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-start text-xs">
                  <thead>
                    <tr className="border-b border-[#27272a] text-[#a1a1aa]">
                      <th className="py-2.5 text-start font-bold">معرف الطلب</th>
                      <th className="py-2.5 text-start font-bold">الشبكة</th>
                      <th className="py-2.5 text-start font-bold">عنوان المحفظة</th>
                      <th className="py-2.5 text-end font-bold">المبلغ الإجمالي</th>
                      <th className="py-2.5 text-end font-bold">الرسوم</th>
                      <th className="py-2.5 text-end font-bold">الصافي للمستلم</th>
                      <th className="py-2.5 text-end font-bold">الإجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#27272a]">
                    {pendingWithdrawals.map((w) => (
                      <tr key={w.id} className="hover:bg-[#18181b]/60">
                        <td className="py-3 font-mono font-bold text-white">#{w.id.slice(-6)}</td>
                        <td className="py-3 font-bold text-[#F59E0B]">{w.network}</td>
                        <td className="py-3 font-mono text-[#a1a1aa] truncate max-w-[150px]">
                          {w.userAddress}
                        </td>
                        <td className="py-3 text-end font-mono text-white">${w.amount.toFixed(2)}</td>
                        <td className="py-3 text-end font-mono text-[#EF4444]">
                          -${w.fee.toFixed(2)}
                        </td>
                        <td className="py-3 text-end font-mono font-bold text-[#10B981]">
                          ${w.netAmount.toFixed(2)} USDT
                        </td>
                        <td className="py-3 text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveWithdrawal(w.id)}
                              className="min-h-[36px] px-3 py-1.5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>موافقة</span>
                            </button>
                            <button
                              onClick={() => onRejectWithdrawal(w.id)}
                              className="min-h-[36px] px-3 py-1.5 bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>رفض واسترجاع</span>
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
        )}
      </div>
    </div>
  );
};
