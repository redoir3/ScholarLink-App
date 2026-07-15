'use client';

import { useState, useEffect, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabaseClient';
import { useAuth } from '@/lib/auth-context';

interface SavedScholarship {
  id?: string | number;
  ['Scholarship Name']?: string;
  [key: string]: unknown;
}

function localKey(s: SavedScholarship) {
  return String(s.id ?? s['Scholarship Name'] ?? JSON.stringify(s));
}

export function useSavedScholarships(scholarship: SavedScholarship) {
  const { user, isAuthenticated } = useAuth();
  const key = localKey(scholarship);
  const [isSaved, setIsSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  const getLocal = useCallback((): SavedScholarship[] => {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('savedScholarships') || '[]');
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (isAuthenticated && user) {
        try {
          const supabase = createSupabaseClient();
          const name = scholarship['Scholarship Name'] || key;
          const { data } = await supabase
            .from('saved_scholarships')
            .select('id')
            .eq('user_id', user.id)
            .eq('scholarship_name', name)
            .maybeSingle();
          if (!cancelled) setIsSaved(!!data);
          return;
        } catch {
          /* fall through to local */
        }
      }
      if (!cancelled) {
        const saved = getLocal();
        setIsSaved(saved.some((s) => localKey(s) === key));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [key, user, isAuthenticated, scholarship, getLocal]);

  const toggleSave = useCallback(async () => {
    if (!isAuthenticated || !user) {
      // Prompt via redirect-friendly flag
      if (typeof window !== 'undefined') {
        const next = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?next=${next}&intent=save`;
      }
      return;
    }

    setBusy(true);
    const name = String(scholarship['Scholarship Name'] || key);
    const supabase = createSupabaseClient();

    try {
      if (isSaved) {
        await supabase
          .from('saved_scholarships')
          .delete()
          .eq('user_id', user.id)
          .eq('scholarship_name', name);
        setIsSaved(false);
        // Keep local in sync
        const local = getLocal().filter((s) => localKey(s) !== key);
        localStorage.setItem('savedScholarships', JSON.stringify(local));
      } else {
        const { error } = await supabase.from('saved_scholarships').upsert(
          {
            user_id: user.id,
            scholarship_id: scholarship.id != null ? String(scholarship.id) : null,
            scholarship_name: name,
            scholarship_data: scholarship,
          },
          { onConflict: 'user_id,scholarship_name' }
        );
        if (error) throw error;
        setIsSaved(true);
        const local = getLocal().filter((s) => localKey(s) !== key);
        local.push(scholarship);
        localStorage.setItem('savedScholarships', JSON.stringify(local));
      }
    } catch (e) {
      console.error('Save failed', e);
      // Local fallback so UX still works before SQL migration
      const saved = getLocal();
      const existsIndex = saved.findIndex((s) => localKey(s) === key);
      let updated: SavedScholarship[];
      if (existsIndex > -1) {
        updated = saved.filter((_, i) => i !== existsIndex);
        setIsSaved(false);
      } else {
        updated = [...saved, scholarship];
        setIsSaved(true);
      }
      localStorage.setItem('savedScholarships', JSON.stringify(updated));
    } finally {
      setBusy(false);
    }
  }, [isAuthenticated, user, isSaved, scholarship, key, getLocal]);

  return { isSaved, toggleSave, busy, requiresAuth: !isAuthenticated };
}
