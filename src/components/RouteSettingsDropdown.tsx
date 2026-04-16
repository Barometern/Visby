import { useState } from 'react';
import { Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { t, type Language } from '@/lib/i18n';

interface Props {
  language: Language;
  routeLength: 10 | 15 | null;
  onChangeRoute: (length: 10 | 15) => void;
}

export default function RouteSettingsDropdown({ language, routeLength, onChangeRoute }: Props) {
  const [pendingLength, setPendingLength] = useState<10 | 15 | null>(null);

  if (routeLength === null) return null;

  const handleSelect = (len: 10 | 15) => {
    if (len === routeLength) return;
    setPendingLength(len);
  };

  const handleConfirm = () => {
    if (pendingLength !== null) {
      onChangeRoute(pendingLength);
      setPendingLength(null);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 rounded-[4px] border border-[#7A5230]/40 text-[#2C1A0E]/70 hover:text-[#2C1A0E] hover:bg-[#7A5230]/5"
            aria-label={t('routeShort', language)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {([10, 15] as const).map((len) => (
            <DropdownMenuItem
              key={len}
              onClick={() => handleSelect(len)}
              className="flex items-center gap-2"
            >
              <Check
                className={`h-4 w-4 ${routeLength === len ? 'opacity-100 text-medieval-gold' : 'opacity-0'}`}
              />
              <span className={routeLength === len ? 'font-semibold text-medieval-gold' : ''}>
                {t(len === 10 ? 'routeShort' : 'routeLong', language)}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={pendingLength !== null} onOpenChange={(open) => !open && setPendingLength(null)}>
        <AlertDialogContent className="border-2 border-[#7A5230]/40 bg-[#F2E8D5]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-[#2C1A0E]">
              {t('routeChangeTitle', language)}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#2C1A0E]/65">
              {t('routeChangeWarning', language)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingLength(null)}>
              {t('cancel', language)}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-[#8B1A1A] text-white hover:bg-[#a02020]"
            >
              {t('routeChangeConfirm', language)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
