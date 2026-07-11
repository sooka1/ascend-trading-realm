import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface BroadcastEmailProps {
  title: string
  body?: string
  ctaLabel?: string
  ctaUrl?: string
}

export const BroadcastEmail = ({ title, body, ctaLabel, ctaUrl }: BroadcastEmailProps) => (
  <BrandedShell preview={title}>
    <Heading style={styles.h1}>{title}</Heading>
    {body
      ? body.split('\n').map((line, i) => (
          <Text key={i} style={styles.text}>
            {line}
          </Text>
        ))
      : null}
    {ctaLabel && ctaUrl ? (
      <Button style={styles.button} href={ctaUrl}>
        {ctaLabel}
      </Button>
    ) : null}
    <Text style={styles.footer}>
      You are receiving this because you have an account on HKEX Invest.
    </Text>
  </BrandedShell>
)

export const template = {
  component: BroadcastEmail,
  subject: (d: Record<string, any>) => String(d?.title ?? 'HKEX Invest'),
  displayName: 'Broadcast',
  previewData: {
    title: 'Important update from HKEX Invest',
    body: 'We have released a new feature.',
    ctaLabel: 'View details',
    ctaUrl: 'https://hkexinvest.com',
  },
} satisfies TemplateEntry

export default BroadcastEmail