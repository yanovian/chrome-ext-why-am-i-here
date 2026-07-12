import AM from 'country-flag-icons/react/3x2/AM';
import BD from 'country-flag-icons/react/3x2/BD';
import BG from 'country-flag-icons/react/3x2/BG';
import BR from 'country-flag-icons/react/3x2/BR';
import CN from 'country-flag-icons/react/3x2/CN';
import CZ from 'country-flag-icons/react/3x2/CZ';
import DE from 'country-flag-icons/react/3x2/DE';
import DK from 'country-flag-icons/react/3x2/DK';
import ES from 'country-flag-icons/react/3x2/ES';
import FI from 'country-flag-icons/react/3x2/FI';
import FR from 'country-flag-icons/react/3x2/FR';
import GR from 'country-flag-icons/react/3x2/GR';
import HR from 'country-flag-icons/react/3x2/HR';
import HU from 'country-flag-icons/react/3x2/HU';
import ID from 'country-flag-icons/react/3x2/ID';
import IN from 'country-flag-icons/react/3x2/IN';
import IR from 'country-flag-icons/react/3x2/IR';
import IT from 'country-flag-icons/react/3x2/IT';
import JP from 'country-flag-icons/react/3x2/JP';
import KE from 'country-flag-icons/react/3x2/KE';
import KR from 'country-flag-icons/react/3x2/KR';
import MY from 'country-flag-icons/react/3x2/MY';
import NL from 'country-flag-icons/react/3x2/NL';
import NO from 'country-flag-icons/react/3x2/NO';
import PH from 'country-flag-icons/react/3x2/PH';
import PL from 'country-flag-icons/react/3x2/PL';
import RO from 'country-flag-icons/react/3x2/RO';
import RS from 'country-flag-icons/react/3x2/RS';
import RU from 'country-flag-icons/react/3x2/RU';
import SA from 'country-flag-icons/react/3x2/SA';
import SE from 'country-flag-icons/react/3x2/SE';
import SK from 'country-flag-icons/react/3x2/SK';
import TH from 'country-flag-icons/react/3x2/TH';
import TR from 'country-flag-icons/react/3x2/TR';
import UA from 'country-flag-icons/react/3x2/UA';
import US from 'country-flag-icons/react/3x2/US';
import VN from 'country-flag-icons/react/3x2/VN';
import { LOCALE_COUNTRY_CODES, type WebsiteLocale } from '@/i18n/locales';

type FlagComponent = typeof US;

const FLAGS: Record<string, FlagComponent> = {
  AM,
  BD,
  BG,
  BR,
  CN,
  CZ,
  DE,
  DK,
  ES,
  FI,
  FR,
  GR,
  HR,
  HU,
  ID,
  IN,
  IR,
  IT,
  JP,
  KE,
  KR,
  MY,
  NL,
  NO,
  PH,
  PL,
  RO,
  RS,
  RU,
  SA,
  SE,
  SK,
  TH,
  TR,
  UA,
  US,
  VN,
};

export function LocaleFlag({
  locale,
  className,
}: {
  locale: WebsiteLocale;
  className?: string;
}) {
  const code = LOCALE_COUNTRY_CODES[locale];
  const Flag = FLAGS[code];
  if (!Flag) {
    return null;
  }
  return <Flag className={className} aria-hidden="true" />;
}
