import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface DepositProps {
  amount: number | string
  currency: string
  reference?: string
  ctaUrl?: string
}

export const DepositConfirmationEmail = ({ amount, currency, reference, ctaUrl }: DepositProps) => (
  <BrandedShell preview={`Deposit received — ${amount} ${currency}`}>
    <Heading style={styles.h1}>Deposit confirmed</Heading>
    <Text style={styles.text}>
      We have received your deposit of <strong>{amount} {currency}</strong>
      {reference ? <> (ref: {reference})</> : null}. Funds are now available in
      your trading account.
    </Text>
    <Button style={styles.button} href={ctaUrl || 'https://hkexinvest.com/portal/accounts'}>
      View account
    </Button>
    <Text style={styles.footer}>If you didn&apos;t make this deposit, contact support immediately.</Text>
  </BrandedShell>
)

export const template = {
  component: DepositConfirmationEmail,
  subject: (d: Record<string, any>) => `Deposit received — ${d?.amount ?? ''} ${d?.currency ?? ''}`.trim(),
  displayName: 'Deposit Confirmation',
  previewData: { amount: '1,000.00', currency: 'USD', reference: 'DEP-4821' },
} satisfies TemplateEntry

export default DepositConfirmationEmail