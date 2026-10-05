import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Logo } from './Logo';
import { ConnectedWalletState, UserProfile } from '../types';
import {
  Wallet,
  Globe,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Shield,
  Layers,
  Clock,
  LayoutDashboard,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { soundManager } from '../services/sound';

interface HeaderProps {
  walletState: ConnectedWalletState;
  user: UserProfile;
  onOpenConnectWallet: () => void;
  onDisconnectWallet: () => void;
  onOpenAuth: () => void;
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  walletState,
  user,
  onOpenConnectWallet,
  onDisconnectWallet,
  onOpenAuth,
  onOpenMenu,
}) => {
  const { t, i18n } = useTranslation();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(soundManager.getMuted());

  useEffect(() => {
    return soundManager.subscribe((muted) => {
      setIsMuted(muted);
    });
  }, []);

  const toggleSound = () => {
    soundManager.toggleMute();
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(nextLang);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = nextLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = nextLang;
      localStorage.setItem('coc_language', nextLang);
    }
  };

  const truncatedAddress = walletState.address
    ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
    : null;

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFBF0]/95 backdrop-blur-md border-b border-[#E6E1D5] px-3 sm:px-6 py-2 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Left: Brand Logo */}
        <div className="flex items-center">
          <Logo size="sm" showDomain={true} />
        </div>

        {/* Right: Language + Wallet Connect + Hamburger Menu (☰) */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Button (AR / EN) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E6E1D5] bg-[#F5F2EB] hover:bg-white text-xs font-bold text-[#1F2937] transition-colors cursor-pointer min-h-[40px]"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span className="font-mono text-[11px]">{i18n.language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Connect Wallet Button */}
          {walletState.isConnected ? (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#10B981]/40 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-xs font-bold text-[#047857] transition-all cursor-pointer min-h-[40px]"
              >
                <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="font-mono text-xs">{truncatedAddress}</span>
                <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-[#10B981]/30">
                  ${walletState.balanceUSDT.toFixed(0)}
                </span>
                <ChevronDown className="w-3.5 h-3.5 opacity-70" />
              </button>

              {userDropdownOpen && (
                <div className="absolute end-0 mt-2 w-52 bg-white rounded-2xl border border-[#E6E1D5] shadow-xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="p-2 border-b border-[#F3EFE6] text-xs">
                    <div className="text-[10px] text-[#78716C]">{walletState.walletName}</div>
                    <div className="font-mono font-bold text-[#1F2937] truncate">{walletState.address}</div>
                    <div className="mt-1 font-mono text-xs text-[#047857]">
                      Wallet: ${walletState.balanceUSDT.toFixed(2)} USDT
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onDisconnectWallet();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-start px-2 py-1.5 text-xs text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-colors flex items-center gap-2 cursor-pointer mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t('common.disconnectWallet')}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenConnectWallet}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white text-xs font-bold shadow-xs hover:shadow-sm active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap min-h-[40px]"
            >
              <Wallet className="w-4 h-4 fill-white/20" />
              <span>{t('common.connectWallet')}</span>
            </button>
          )}

          {/* Sound Mute/Unmute Button (🔊 / 🔇) */}
          <button
            onClick={toggleSound}
            className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#DC2626] hover:bg-[#EF4444]/20'
                : 'border-[#10B981]/40 bg-[#10B981]/10 text-[#047857] hover:bg-[#10B981]/20'
            }`}
            title={isMuted ? (i18n.language === 'ar' ? 'تشغيل الصوت' : 'Unmute Sound') : (i18n.language === 'ar' ? 'كتم الصوت' : 'Mute Sound')}
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>

          {/* Hamburger Menu Button (☰) */}
          <button
            onClick={onOpenMenu}
            className="flex items-center justify-center h-10 w-10 rounded-xl border border-[#E6E1D5] bg-[#F5F2EB] hover:bg-white text-[#1F2937] transition-colors cursor-pointer"
            title="Menu"
            aria-label="Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#1F2937]" />
          </button>
        </div>
      </div>
    </header>
  );
};
