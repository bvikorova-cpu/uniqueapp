/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import { Img, Section, Text } from 'npm:@react-email/components@0.0.22'
import { brand, styles } from './_brand.ts'

interface Props { siteUrl?: string }

export const EmailHeader = ({ siteUrl }: Props) => (
  <Section style={styles.header}>
    <a href={siteUrl || 'https://uniqueapp.fun'} style={{ textDecoration: 'none', display: 'block' }}>
      <Img
        src={brand.logoUrl}
        alt="Unique"
        width={72}
        height={72}
        style={styles.logo}
      />
    </a>
    <Text style={styles.tagline}>Connect · Create · Earn</Text>
  </Section>
)

export default EmailHeader
