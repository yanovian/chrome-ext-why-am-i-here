import { Features } from '@/components/Features';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { HowItWorks } from '@/components/HowItWorks';
import { PrivacyStrip } from '@/components/PrivacyStrip';
import { Showcase } from '@/components/Showcase';

export function HomePage() {
  return (
    <>
      <Hero />
      <main>
        <Features />
        <HowItWorks />
        <Showcase />
        <PrivacyStrip />
      </main>
      <Footer />
    </>
  );
}
