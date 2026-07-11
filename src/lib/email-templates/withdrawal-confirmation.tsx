import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface WithdrawalProps {
  amount: number | string
  currency: string
  status?: 'requested' | 'approved' | 'sent'
  reference?: string
  ctaUrl?: string
}

const LABELS: Record<string, string> = {
  requested: 'Withdrawal requested',
  approved: 'Withdrawal approved',
  sent: 'Withdrawal sent',
}

export const WithdrawalConfirmationEmail = ({ amount, currency, status = 'requested', reference, ctaUrl }: WithdrawalProps) => (
  <BrandedShell preview={`${LABELS[status]} — ${amount} ${currency}`}>
    <Heading style={styles.h1}>{LABELS[status] || 'Withdrawal update'}</Heading>
    <Text style={styles.text}>
      Amount: <strong>{amount} {currency}</strong>
      {reference ? <> · Reference: {reference}</> : null}
    </Text>
    <Text style={styles.text}>
      You will receive another update as soon as the transfer progresses.
    </Text>
    <Button style={styles.button} href={ctaUrl || 'https://hkexinvest.com/portal/activity'}>
      Track withdrawal
    </Button>
    <Text style={styles.footer}>If you didn&apos;t request this, secure your account and contact support.</Text>
  </BrandedShell>
)

export const template = {
  component: WithdrawalConfirmationEmail,
  subject: (d: Record<string, any>) => `${LABELS[d?.status ?? 'requested'] || 'Withdrawal update'} — ${d?.amount ?? ''} ${d?.currency ?? ''}`.trim(),
  displayName: 'Withdrawal Confirmation',
  previewData: { amount: '500.00', currency: 'USD', status: 'approved', reference: 'WD-1023' },
} satisfies TemplateEntry

export default WithdrawalConfirmationEmail