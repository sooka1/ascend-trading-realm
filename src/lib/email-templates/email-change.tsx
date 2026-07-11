import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'

interface EmailChangeEmailProps {
  siteName: string
  // oldEmail is the user's current address (HookData.OldEmail). For the
  // NEW-recipient half of a secure email_change fanout, `email` equals the
  // recipient (NEW), so the "from" line must render oldEmail to read
  // "from OLD to NEW" instead of "from NEW to NEW".
  oldEmail: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <BrandedShell preview={`Confirm your email change for ${siteName}`}>
    <Heading style={styles.h1}>Confirm your email change</Heading>
    <Text style={styles.text}>
          You requested to change your email address for {siteName} from{' '}
          <Link href={`mailto:${oldEmail}`} style={styles.link}>
            {oldEmail}
          </Link>{' '}
          to{' '}
          <Link href={`mailto:${newEmail}`} style={styles.link}>
            {newEmail}
          </Link>
          .
        </Text>
    <Text style={styles.text}>
          Click the button below to confirm this change:
        </Text>
    <Button style={styles.button} href={confirmationUrl}>
          Confirm Email Change
        </Button>
    <Text style={styles.footer}>
          If you didn't request this change, please secure your account
          immediately.
        </Text>
  </BrandedShell>
)

export default EmailChangeEmail
