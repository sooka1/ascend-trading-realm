import * as React from 'react'

import { Button, Heading, Link, Text } from '@react-email/components'
import { BrandedShell, styles } from './_shell'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <BrandedShell preview={`Confirm your email for ${siteName}`}>
    <Heading style={styles.h1}>Confirm your email</Heading>
    <Text style={styles.text}>
          Thanks for signing up for{' '}
          <Link href={siteUrl} style={styles.link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
    <Text style={styles.text}>
          Please confirm your email address (
          <Link href={`mailto:${recipient}`} style={styles.link}>
            {recipient}
          </Link>
          ) by clicking the button below:
        </Text>
    <Button style={styles.button} href={confirmationUrl}>
          Verify Email
        </Button>
    <Text style={styles.footer}>
          If you didn't create an account, you can safely ignore this email.
        </Text>
  </BrandedShell>
)

export default SignupEmail
