import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface WelcomeEmailProps {
  name?: string
  ctaUrl?: string
}

export const WelcomeEmail = ({ name, ctaUrl }: WelcomeEmailProps) => (
  <BrandedShell preview="Welcome to HKEX Invest">
    <Heading style={styles.h1}>Welcome{name ? `, ${name}` : ''}</Heading>
    <Text style={styles.text}>
      Your HKEX Invest account is ready. Trade, invest, and grow with a
      platform built for serious investors.
    </Text>
    <Button style={styles.button} href={ctaUrl || 'https://hkexinvest.com/app'}>
      Open your dashboard
    </Button>
    <Text style={styles.footer}>
      Need help? Reply to this email and our team will assist.
    </Text>
  </BrandedShell>
)

export const template = {
  component: WelcomeEmail,
  subject: 'Welcome to HKEX Invest',
  displayName: 'Welcome',
  previewData: { name: 'Investor' },
} satisfies TemplateEntry

export default WelcomeEmail