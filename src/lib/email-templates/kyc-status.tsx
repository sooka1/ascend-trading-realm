import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface KycStatusProps {
  status: 'approved' | 'rejected' | 'pending' | 'more_info' | string
  reason?: string
  ctaUrl?: string
}

const HEAD: Record<string, string> = {
  approved: 'Your identity has been verified',
  rejected: 'Your identity verification was rejected',
  pending: 'Your identity verification is under review',
  more_info: 'Additional information required',
}

export const KycStatusEmail = ({ status, reason, ctaUrl }: KycStatusProps) => (
  <BrandedShell preview={HEAD[status] || 'KYC status update'}>
    <Heading style={styles.h1}>{HEAD[status] || 'KYC status update'}</Heading>
    {reason ? <Text style={styles.text}>{reason}</Text> : null}
    <Text style={styles.text}>
      {status === 'approved'
        ? 'You now have full access to deposits, withdrawals, and trading features.'
        : 'Please open your account to review the details and take next steps.'}
    </Text>
    <Button style={styles.button} href={ctaUrl || 'https://hkexinvest.com/portal/kyc'}>
      Open KYC center
    </Button>
    <Text style={styles.footer}>Questions? Reply to this email or contact support.</Text>
  </BrandedShell>
)

export const template = {
  component: KycStatusEmail,
  subject: (d: Record<string, any>) => HEAD[d?.status ?? ''] || 'KYC status update',
  displayName: 'KYC Status',
  previewData: { status: 'approved' },
} satisfies TemplateEntry

export default KycStatusEmail