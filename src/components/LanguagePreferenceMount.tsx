import { useLanguagePreference } from '@/hooks/useLanguagePreference';

/**
 * Mount once inside <AuthProvider> to sync the user's preferred_language
 * from their profile and persist manual changes back to the database.
 */
export function LanguagePreferenceMount() {
  useLanguagePreference();
  return null;
}
