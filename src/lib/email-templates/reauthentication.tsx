import * as React from 'react'

import { Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <BrandedShell preview="Your verification code">
    <Heading style={styles.h1}>Confirm reauthentication</Heading>
    <Text style={styles.text}>Use the code below to confirm your identity:</Text>
    <Text style={codeStyle}>{token}</Text>
    <Text style={styles.footer}>
      This code will expire shortly. If you didn't request this, you can
      safely ignore this email.
    </Text>
  </BrandedShell>
)

export default ReauthenticationEmail
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '26px',
  fontWeight: 'bold' as const,
  color: '#ffffff',
  letterSpacing: '4px',
  padding: '14px 20px',
  backgroundColor: '#111827',
  border: '1px solid #E31B23',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '0 0 24px',
}
