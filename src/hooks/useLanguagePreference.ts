import { useEffect } from 'react';
import i18n from '@/i18n/config';
import { supabase } from '@/integrations/supabase/client';

/**
 * Loads the logged-in user's preferred language from `profiles.preferred_language`
 * and applies it via i18next. Also saves the current language back when the user
 * is logged in and changes it manually.
 */
export function useLanguagePreference() {
  useEffect(() => {
    let isMounted = true;

    const loadPreference = async (userId: string) => {
      const { data } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('id', userId)
        .maybeSingle();
      if (!isMounted) return;
      const lng = (data as any)?.preferred_language;
      if (lng && lng !== i18n.language) {
        i18n.changeLanguage(lng);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadPreference(session.user.id);
      }
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) loadPreference(session.user.id);
    });

    // Persist manual changes (only when logged in)
    const handleChange = async (lng: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase
        .from('profiles')
        .update({ preferred_language: lng } as any)
        .eq('id', user.id);
    };
    i18n.on('languageChanged', handleChange);

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      i18n.off('languageChanged', handleChange);
    };
  }, []);
}
