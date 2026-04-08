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
    <div className="min-h-screen bg-background text-foreground">
      {!isHome && (
        <header className="sticky top-0 z-50 border-b border-medieval-stone/20 bg-background/82 backdrop-blur-xl shadow-sm transition-all duration-300">
          <div className="container flex h-16 items-center justify-between gap-4 px-4">
            <Link to="/" className="group flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <div className="font-heading text-lg leading-none text-medieval-gold tracking-[0.08em] hover:tracking-wider transition-all duration-300">
                  {t('appName', language)}
                </div>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1 rounded-full border border-medieval-stone/20 bg-black/5 p-1">
              {navItems.map(({ to, icon: Icon, label }) => {
                const active = isActive(to);

                return (
                  <Link
                    key={to}
                    to={to}
                    className={[
                      'relative flex items-center gap-2 rounded-full px-4 py-2 text-sm transition-all duration-200 hover:scale-[1.03]',
                      active
                        ? 'bg-medieval-gold text-black'
                        : 'text-muted-foreground hover:bg-black/5 hover:text-foreground',
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
                  <Button variant="ghost" size="sm" className="h-9 rounded-full px-3">
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
                  <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full">
                    <Shield className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              {isLoggedIn ? (
                <Button variant="ghost" size="sm" onClick={() => void logout()} className="h-9 w-9 rounded-full">
                  <LogOut className="h-4 w-4" />
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="h-9 rounded-full px-3">
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

      <main className={isHome ? 'min-h-screen' : 'flex-1 pb-24 md:pb-0'}>
        {children}
      </main>

      {!isHome && (
        <nav className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 md:hidden">
          <div className="mx-auto max-w-md rounded-[1.6rem] border border-medieval-stone/20 bg-background/88 p-2 backdrop-blur-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.12)]">
            <div className="flex items-center justify-around gap-1">
              {navItems.map(({ to, icon: Icon, label }) => {
                const active = isActive(to);

                return (
                  <Link key={to} to={to} className="flex min-w-0 flex-1 justify-center">
                    <div
                      className={[
                        'flex w-full flex-col items-center rounded-2xl px-2 py-2.5 transition-all duration-200',
                        active
                          ? 'bg-medieval-gold/15 text-medieval-gold'
                          : 'text-muted-foreground',
                      ].join(' ')}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="mt-1 text-[10px] font-medium">{label}</span>
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
