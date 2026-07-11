import * as React from 'react'
import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'
import type { TemplateEntry } from './registry'

interface TradeAlertProps {
  symbol: string
  side: 'BUY' | 'SELL' | string
  price: number | string
  quantity: number | string
  event?: 'opened' | 'closed' | 'filled'
  pnl?: number | string
  ctaUrl?: string
}

export const TradeAlertEmail = ({ symbol, side, price, quantity, event = 'filled', pnl, ctaUrl }: TradeAlertProps) => (
  <BrandedShell preview={`${side} ${symbol} @ ${price}`}>
    <Heading style={styles.h1}>Trade {event}: {symbol}</Heading>
    <Text style={styles.text}>
      <strong style={{ color: side === 'BUY' ? '#22C55E' : '#E31B23' }}>{side}</strong> · {quantity} @ {price}
    </Text>
    {pnl !== undefined ? (
      <Text style={styles.text}>PnL: <strong>{pnl}</strong></Text>
    ) : null}
    <Button style={styles.button} href={ctaUrl || 'https://hkexinvest.com/portal/activity'}>
      Open position
    </Button>
    <Text style={styles.footer}>Automated trade notification. Manage alerts in your account settings.</Text>
  </BrandedShell>
)

export const template = {
  component: TradeAlertEmail,
  subject: (d: Record<string, any>) => `${d?.side ?? ''} ${d?.symbol ?? ''} @ ${d?.price ?? ''}`.trim(),
  displayName: 'Trade Alert',
  previewData: { symbol: 'AAPL', side: 'BUY', price: '227.35', quantity: 10, event: 'filled' },
} satisfies TemplateEntry

export default TradeAlertEmail