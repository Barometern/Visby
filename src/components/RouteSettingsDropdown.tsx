import { Settings, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { t, type Language } from '@/lib/i18n';

interface Props {
  language: Language;
  routeLength: 10 | 15 | null;
  onChangeRoute: (length: 10 | 15) => void;
}

export default function RouteSettingsDropdown({ language, routeLength, onChangeRoute }: Props) {
  if (routeLength === null) return null;

  return (
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
            onClick={() => len !== routeLength && onChangeRoute(len)}
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
  );
}
