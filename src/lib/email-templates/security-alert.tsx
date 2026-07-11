import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface SecurityAlertProps {
  event: string
  ip?: string
  device?: string
  when?: string
  ctaUrl?: string
}

export const SecurityAlertEmail = ({ event, ip, device, when, ctaUrl }: SecurityAlertProps) => (
  <BrandedShell preview={`Security alert: ${event}`}>
    <Heading style={styles.h1}>Security alert</Heading>
    <Text style={styles.text}>
      We detected: <strong>{event}</strong>
    </Text>
    {(ip || device || when) ? (
      <Text style={styles.text}>
        {when ? <>Time: {when}<br /></> : null}
        {device ? <>Device: {device}<br /></> : null}
        {ip ? <>IP: {ip}</> : null}
      </Text>
    ) : null}
    <Button style={styles.button} href={ctaUrl || 'https://hkexinvest.com/portal/security'}>
      Review activity
    </Button>
    <Text style={styles.footer}>
      If this was you, ignore this email. Otherwise, change your password immediately.
    </Text>
  </BrandedShell>
)

export const template = {
  component: SecurityAlertEmail,
  subject: (d: Record<string, any>) => `Security alert: ${d?.event ?? 'account activity'}`,
  displayName: 'Security Alert',
  previewData: { event: 'New sign-in from a new device', ip: '203.0.113.4', device: 'Chrome on macOS' },
} satisfies TemplateEntry

export default SecurityAlertEmail