import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import Features from '@/components/landing/Features'
import HowItWorks from '@/components/landing/HowItWorks'
import InteractiveDemo from '@/components/landing/InteractiveDemo'
import Footer from '@/components/landing/Footer'

function SectionDivider({ variant = 'default' }: { variant?: 'default' | 'glow' }) {
  return (
    <div
      style={{
        width: '100%',
        height: '1px',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <div
        style={{
          position: 'absolute',
          left: '15%',
          right: '15%',
          height: '1px',
          background:
            variant === 'glow'
              ? 'linear-gradient(90deg, transparent, rgba(0, 232, 156, 0.3) 30%, rgba(255, 180, 68, 0.3) 70%, transparent)'
              : 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0.06) 70%, transparent)',
        }}
      />
      {variant === 'glow' && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '60px',
            background:
              'radial-gradient(ellipse, rgba(0, 232, 156, 0.08), transparent 70%)',
            pointerEvents: 'none',
          }}
        />
      )}
    </div>
  )
}

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <SectionDivider variant="glow" />
        <Features />
        <SectionDivider />
        <HowItWorks />
        <SectionDivider variant="glow" />
        <InteractiveDemo />
      </main>
      <Footer />
    </>
  )
}
