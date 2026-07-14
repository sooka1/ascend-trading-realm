import * as React from 'react'

import { Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'

interface MagicLinkEmailProps {
  siteName: string
  token: string
}

const codeStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '16px 28px',
  fontSize: '30px',
  fontWeight: 700,
  letterSpacing: '10px',
  color: '#ffffff',
  backgroundColor: '#1a1a1a',
  borderRadius: '10px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}

export const MagicLinkEmail = ({ siteName, token }: MagicLinkEmailProps) => (
  <BrandedShell preview={`Your ${siteName} login code`}>
    <Heading style={styles.h1}>Your login code</Heading>
    <Text style={styles.text}>
      Enter this 6-digit code in {siteName} to sign in. It expires in 5 minutes.
    </Text>
    <Text style={{ ...styles.text, textAlign: 'center', margin: '24px 0' }}>
      <span style={codeStyle}>{token}</span>
    </Text>
    <Text style={styles.footer}>
      If you didn't request this code, you can safely ignore this email.
    </Text>
  </BrandedShell>
)

export default MagicLinkEmail
