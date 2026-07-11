import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const HERO_URL =
  'https://hkexinvest.com/__l5e/assets-v1/2038d292-d129-4cdc-a757-5a9d15f35f15/hkex-email-hero.png'

interface ShellProps {
  preview: string
  children: React.ReactNode
}

export const BrandedShell = ({ preview, children }: ShellProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={main}>
      <Container style={outer}>
        <Section style={{ margin: 0, padding: 0 }}>
          <Img
            src={HERO_URL}
            alt="HKEX — Trade. Invest. Grow."
            width="600"
            style={hero}
          />
        </Section>
        <Container style={inner}>{children}</Container>
        <Text style={legal}>
          © {new Date().getFullYear()} HKEX Invest · Trade. Invest. Grow.
        </Text>
      </Container>
    </Body>
  </Html>
)

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Arial, sans-serif',
  margin: 0,
  padding: 0,
}
const outer = {
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#0B1220',
  borderRadius: '12px',
  overflow: 'hidden',
}
const hero = {
  display: 'block',
  width: '100%',
  height: 'auto',
  border: 0,
  outline: 'none',
  textDecoration: 'none',
}
const inner = {
  padding: '28px 28px 8px',
  backgroundColor: '#0B1220',
  color: '#E5E7EB',
}
const legal = {
  fontSize: '11px',
  color: '#6B7280',
  textAlign: 'center' as const,
  padding: '16px 28px 24px',
  margin: 0,
  backgroundColor: '#0B1220',
}

export const styles = {
  h1: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    color: '#ffffff',
    margin: '0 0 16px',
  },
  text: {
    fontSize: '14px',
    color: '#E5E7EB',
    lineHeight: '1.6',
    margin: '0 0 20px',
  },
  link: { color: '#E31B23', textDecoration: 'underline' },
  button: {
    border: '1px solid #E31B23',
    backgroundColor: '#E31B23',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    borderRadius: '8px',
    padding: '12px 24px',
    textDecoration: 'none',
    display: 'inline-block',
  },
  footer: {
    fontSize: '12px',
    color: '#9CA3AF',
    margin: '24px 0 8px',
    lineHeight: '1.5',
  },
}