import * as React from 'react'

import { Button, Heading, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <BrandedShell preview={`Reset your password for ${siteName}`}>
    <Heading style={styles.h1}>Reset your password</Heading>
    <Text style={styles.text}>
      We received a request to reset your password for {siteName}. Click the
      button below to choose a new password.
    </Text>
    <Button style={styles.button} href={confirmationUrl}>
      Reset Password
    </Button>
    <Text style={styles.footer}>
      If you didn't request a password reset, you can safely ignore this
      email. Your password will not be changed.
    </Text>
  </BrandedShell>
)

export default RecoveryEmail
