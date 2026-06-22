/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_brand.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const RecoveryEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your Unique password 🔐</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brandName}>Unique</Heading>
          <Text style={styles.tagline}>Connect · Create · Earn</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Reset your password 🔐</Heading>
          <Text style={styles.text}>We received a request to reset the password for <Link href={`mailto:${recipient}`} style={styles.link}>{recipient}</Link> on <strong>{siteName}</strong>.</Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>Reset Password →</Button>
          </Section>
          <Text style={styles.muted}>This link expires in 1 hour. If you didn't request this, your password remains unchanged.</Text>
        </Section>
        <Section style={styles.footer}>
          Unique — Connect. Create. Earn. · <Link href={siteUrl} style={styles.link}>uniqueapp.fun</Link>
        </Section>
      </Container>
    </Body>
  </Html>
)
export default RecoveryEmail
