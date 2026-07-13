import { assetUrl } from '@/lib/assets';

const LOGO_SIZES = {
  sm: { dimension: 28, icon: 'icon-48.png' },
  md: { dimension: 32, icon: 'icon-48.png' },
  lg: { dimension: 72, icon: 'icon.png' },
} as const;

type SiteLogoProps = {
  size?: keyof typeof LOGO_SIZES;
  className?: string;
};

export function SiteLogo({ size = 'md', className }: SiteLogoProps) {
  const { dimension, icon } = LOGO_SIZES[size];

  return (
    <img
      className={className}
      src={assetUrl(icon)}
      width={dimension}
      height={dimension}
      alt=""
    />
  );
}
