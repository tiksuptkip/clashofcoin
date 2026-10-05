import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Mail, Lock, Gift, Key, CheckCircle, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (userData: Partial<UserProfile>) => void;
  onConnectWallet: () => void;
  isWalletConnected: boolean;
  walletAddress: string | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  onConnectWallet,
  isWalletConnected,
  walletAddress,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'login' | 'register' | 'wallet'>('login');
  const [email, setEmail] = useState(user.email || '');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [signedSuccess, setSignedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter a valid email address');
      return;
    }
    setErrorMsg('');

    let newBalance = user.balance;
    if (tab === 'register' && referralCode.trim()) {
      // 10% welcome bonus credit
      newBalance += 50.0;
    }

    onUpdateUser({
      email,
      balance: newBalance,
      referredBy: referralCode.trim() || undefined,
    });

    onClose();
  };

  const handleSignMessageLogin = () => {
    if (!isWalletConnected) {
      onConnectWallet();
      return;
    }

    // Simulate EIP-712 / personal_sign
    setSignedSuccess(true);
    setTimeout(() => {
      onUpdateUser({
        address: walletAddress || undefined,
      });
      setSignedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1F2937]/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md bg-[#FFFDF9] rounded-3xl border border-[#E6E1D5] shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-5 end-5 p-1.5 rounded-full text-[#78716C] hover:text-[#1F2937] hover:bg-[#F5F2EB] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-4">
          <h2 className="text-xl font-black text-[#1F2937]">
            {tab === 'wallet'
              ? t('auth.loginWithWallet')
              : tab === 'register'
              ? t('auth.register')
              : t('auth.login')}
          </h2>
          <p className="text-xs text-[#78716C] mt-1">
            Access your Clash Of Coin account, manage battle balances, and track referral bonuses.
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-[#F5F2EB] rounded-xl text-xs font-bold mb-4">
          <button
            onClick={() => setTab('login')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'login' ? 'bg-white text-[#1F2937] shadow-xs' : 'text-[#78716C]'
            }`}
          >
            {t('auth.login')}
          </button>
          <button
            onClick={() => setTab('register')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'register' ? 'bg-white text-[#1F2937] shadow-xs' : 'text-[#78716C]'
            }`}
          >
            {t('auth.register')}
          </button>
          <button
            onClick={() => setTab('wallet')}
            className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
              tab === 'wallet' ? 'bg-white text-[#D97706] shadow-xs' : 'text-[#78716C]'
            }`}
          >
            Web3 Sign
          </button>
        </div>

        {errorMsg && (
          <div className="mb-3 p-2 bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-xl text-xs text-[#EF4444] font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tab Content */}
        {tab === 'wallet' ? (
          <div className="space-y-4 py-2">
            <div className="p-3 bg-[#F5F2EB] rounded-2xl border border-[#E6E1D5] text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[#1F2937]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                <span>EIP-4361 Sign-In With Ethereum / Web3</span>
              </div>
              <p className="text-[#78716C]">{t('auth.signMessageDesc')}</p>
              <div className="font-mono text-[11px] bg-white p-2 rounded-xl border border-[#E6E1D5] text-[#78716C]">
                &quot;Sign this message to authenticate your wallet at ClashOfCoin.bet. Nonce:{' '}
                {Date.now()}&quot;
              </div>
            </div>

            {signedSuccess ? (
              <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-center text-xs font-bold text-[#047857] flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#10B981]" />
                <span>Cryptographic Signature Verified!</span>
              </div>
            ) : (
              <button
                onClick={handleSignMessageLogin}
                className="w-full py-2.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4" />
                <span>{isWalletConnected ? t('auth.signAndLogin') : t('common.connectWallet')}</span>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-[11px] font-bold text-[#78716C] block mb-1">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full ps-9 pe-3 py-2 bg-[#FFFDF9] border border-[#E6E1D5] rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-[#78716C] block mb-1">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#78716C]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full ps-9 pe-3 py-2 bg-[#FFFDF9] border border-[#E6E1D5] rounded-xl text-xs text-[#1F2937] focus:outline-none focus:border-[#F59E0B]"
                />
              </div>
            </div>

            {tab === 'register' && (
              <div>
                <label className="text-[11px] font-bold text-[#78716C] block mb-1 flex items-center justify-between">
                  <span>{t('auth.referralCode')}</span>
                  <span className="text-[10px] text-[#D97706] font-semibold">+10% Bonus</span>
                </label>
                <div className="relative">
                  <Gift className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D97706]" />
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                    placeholder="CLASHWIN"
                    className="w-full ps-9 pe-3 py-2 bg-[#FFFDF9] border border-[#E6E1D5] rounded-xl text-xs text-[#1F2937] uppercase font-mono focus:outline-none focus:border-[#F59E0B]"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              {tab === 'register' ? t('auth.register') : t('auth.login')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
