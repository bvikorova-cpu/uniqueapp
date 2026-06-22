/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Button, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_brand.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; confirmationUrl: string }

export const SignupEmail = ({ siteName, siteUrl, recipient, confirmationUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to Unique — confirm your email and claim your welcome credits 🎉</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brandName}>Unique</Heading>
          <Text style={styles.tagline}>Connect · Create · Earn</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Welcome to {siteName}! 🎉</Heading>
          <Text style={styles.text}>
            Hi there, thanks for joining <strong>Unique</strong> — the all-in-one social, dating, and creator platform.
          </Text>
          <Text style={styles.text}>
            Confirm your email <Link href={`mailto:${recipient}`} style={styles.link}>{recipient}</Link> to activate your account and unlock your welcome credits.
          </Text>
          <Section style={styles.buttonWrap}>
            <Button style={styles.button} href={confirmationUrl}>Confirm Email →</Button>
          </Section>
          <Text style={styles.muted}>If the button doesn't work, copy this link: <Link href={confirmationUrl} style={styles.link}>{confirmationUrl}</Link></Text>
          <Text style={styles.muted}>If you didn't create an account, you can safely ignore this email.</Text>
        </Section>
        <Section style={styles.footer}>
          Unique — Connect. Create. Earn. · <Link href={siteUrl} style={styles.link}>uniqueapp.fun</Link>
        </Section>
      </Container>
    </Body>
  </Html>
)
export default SignupEmail
