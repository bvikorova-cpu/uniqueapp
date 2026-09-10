# Flyer Studio language and readability correction

## Changes
- Keep the entire Flyer Studio interface in English, regardless of the platform language selector.
- Preserve the flyer output language selector so users can generate a flyer in any supported language.
- Strengthen the generation instructions so supplied copy is professionally translated, proofread, idiomatic, and suitable for advertising before it is rendered.
- Increase the contrast of the description under “Promotional Flyer Studio” for mobile and desktop readability.

## Technical details
- Use fixed English UI copy through the existing English translation namespace without changing the global language.
- Update the Edge Function prompt to separate protected factual data from translatable marketing copy and require native-level localization.
- Redeploy the Flyer generation function and verify the page and checks.
