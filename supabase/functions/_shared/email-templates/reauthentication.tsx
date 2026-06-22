/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text } from 'npm:@react-email/components@0.0.22'
import { styles } from './_brand.ts'

interface Props { siteName: string; siteUrl: string; recipient: string; token: string }

export const ReauthenticationEmail = ({ siteName, siteUrl, recipient, token }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Unique verification code: {token}</Preview>
    <Body style={styles.main}>
      <Container style={styles.container}>
        <Section style={styles.header}>
          <Heading style={styles.brandName}>Unique</Heading>
          <Text style={styles.tagline}>Connect · Create · Earn</Text>
        </Section>
        <Section style={styles.body}>
          <Heading style={styles.h1}>Verification code</Heading>
          <Text style={styles.text}>Use the code below to confirm a sensitive action on <strong>{siteName}</strong> as <Link href={`mailto:${recipient}`} style={styles.link}>{recipient}</Link>.</Text>
          <Section style={styles.codeBox}>{token}</Section>
          <Text style={styles.muted}>This code expires in 10 minutes. If you didn't request it, change your password immediately.</Text>
        </Section>
        <Section style={styles.footer}>
          Unique — Connect. Create. Earn. · <Link href={siteUrl} style={styles.link}>uniqueapp.fun</Link>
        </Section>
      </Container>
    </Body>
  </Html>
)
export default ReauthenticationEmail
