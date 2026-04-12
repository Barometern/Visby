import { Link, useLocation } from 'react-router-dom';
import { Home, Puzzle, QrCode, LogIn, LogOut, Shield, Globe, Map } from 'lucide-react';
import { useGameState } from '@/lib/game-state';
import { t, languageNames, type Language } from '@/lib/i18n';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

const ADMIN_ENABLED = import.meta.env.DEV || import.meta.env.VITE_ENABLE_ADMIN === 'true';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { language, setLanguage, isLoggedIn, isAdmin, logout } = useGameState();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const navItems = [
    { to: '/', icon: Home, label: t('home', language) },
    { to: '/map', icon: Map, label: t('map', language) },
    { to: '/puzzle', icon: Puzzle, label: t('puzzle', language) },
    { to: '/scan', icon: QrCode, label: t('scan', language) },
  ];

  const isActive = (to: string) => location.pathname === to;

  return (
    <div className="min-h-screen bg-[#F2E8D5] text-[#2C1A0E]">
      {!isHome && (
        <header className="sticky top-0 z-50 border-b-2 border-[#7A5230]/40 bg-[#F2E8D5] shadow-sm transition-all duration-300">
          <div className="container flex h-16 items-center justify-between gap-4 px-4">
            <Link to="/" className="group flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="font-display text-lg leading-none text-[#2C1A0E] tracking-[0.12em] hover:tracking-wider transition-all duration-300">
                  {t('appName', language)}
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(({ to, icon: Icon, label }) => {
                const active = isActive(to);

                return (
                  <Link
                    key={to}
                    to={to}
                    className={[
                      'relative flex items-center gap-2 px-4 py-5 text-sm transition-all duration-200',
                      active
                        ? 'text-[#1C2E4A] font-semibold border-b-2 border-[#1C2E4A]'
                        : 'text-[#2C1A0E]/60 hover:text-[#2C1A0E]',
                    ].join(' ')}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-[4px] border border-[#7A5230]/40 px-3 text-[#2C1A0E]/70 hover:text-[#2C1A0E] hover:bg-[#7A5230]/5"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    <span className="text-xs font-semibold tracking-[0.18em]">
                      {language.toUpperCase()}
                    </span>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <DropdownMenuItem
                      key={lang}
                      onClick={() => setLanguage(lang)}
                      className={language === lang ? 'font-semibold text-medieval-gold' : ''}
                    >
                      {languageNames[lang]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {ADMIN_ENABLED && isAdmin && (
                <Link to="/admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 rounded-[4px] text-[#2C1A0E]/70 hover:text-[#2C1A0E]"
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              {isLoggedIn ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void logout()}
                  className="h-9 w-9 rounded-[4px] text-[#2C1A0E]/70 hover:text-[#2C1A0E]"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Link to="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-[4px] px-3 text-[#2C1A0E]/70 hover:text-[#2C1A0E]"
                  >
                    <LogIn className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline text-xs font-medium">
                      {t('login', language)}
                    </span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>
      )}

      <main className={isHome ? 'min-h-screen' : 'flex-1 pb-36 md:pb-0'}>
        {children}
      </main>

      {!isHome && (
        <nav className="fixed inset-x-0 bottom-0 z-50 md:hidden">
          <div className="mx-auto max-w-md border-t-2 border-[#7A5230]/40 bg-[#F2E8D5] px-3 pb-3.5 pt-3.5 shadow-[0_-8px_28px_rgba(0,0,0,0.08)]">
            <div className="flex items-center justify-around gap-1">
              {navItems.map(({ to, icon: Icon, label }) => {
                const active = isActive(to);

                return (
                  <Link key={to} to={to} className="flex min-w-0 flex-1 justify-center">
                    <div
                      className={[
                        'flex min-h-[56px] w-full flex-col items-center justify-center rounded-[6px] px-2 py-2 transition-all duration-200',
                        active
                          ? 'bg-[#1C2E4A]/8 text-[#1C2E4A]'
                          : 'text-[#2C1A0E]/50 hover:text-[#2C1A0E]',
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                      <span
                        className={`mt-1 font-body text-[11px] leading-none ${
                          active ? 'font-semibold' : 'font-medium'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
