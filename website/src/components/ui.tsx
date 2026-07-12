import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className = '' }: ContainerProps) {
  return <div className={`container ${className}`.trim()}>{children}</div>;
}

type SectionProps = {
  id?: string;
  children: ReactNode;
  className?: string;
  tinted?: boolean;
};

export function Section({ id, children, className = '', tinted = false }: SectionProps) {
  return (
    <section id={id} className={`section ${tinted ? 'section--tinted' : ''} ${className}`.trim()}>
      <Container>{children}</Container>
    </section>
  );
}

type ButtonProps = {
  href?: string;
  to?: string;
  children: ReactNode;
  variant?: 'primary' | 'ghost';
  external?: boolean;
};

export function Button({ href, to, children, variant = 'primary', external }: ButtonProps) {
  const className = `btn btn--${variant}`;

  if (to) {
    return (
      <Link className={className} to={to}>
        {children}
      </Link>
    );
  }

  if (!href) {
    throw new Error('Button requires href or to');
  }

  const isExternal = external ?? !href.startsWith('/');
  return (
    <a
      className={className}
      href={href}
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}

type EyebrowProps = {
  children: ReactNode;
};

export function Eyebrow({ children }: EyebrowProps) {
  return <p className="eyebrow">{children}</p>;
}

type SectionHeadingProps = {
  title: string;
  lead?: string;
};

export function SectionHeading({ title, lead }: SectionHeadingProps) {
  return (
    <header className="section-heading">
      <h2>{title}</h2>
      {lead ? <p>{lead}</p> : null}
    </header>
  );
}
