'use client';

import { useState, useEffect, useCallback } from 'react';

interface SavedScholarship {
  id?: string;
  ["Scholarship Name"]?: string;
  [key: string]: any;
}

export function useSavedScholarships(scholarship: SavedScholarship) {
  const key = scholarship.id || scholarship["Scholarship Name"] || JSON.stringify(scholarship); // ultra-safe unique key
  const [isSaved, setIsSaved] = useState(false);

  const getSavedList = useCallback((): SavedScholarship[] => {
    if (typeof window === 'undefined') return [];
    return JSON.parse(localStorage.getItem('savedScholarships') || '[]');
  }, []);

  useEffect(() => {
    const saved = getSavedList();
    const exists = saved.some((s) => (s.id || s["Scholarship Name"]) === (scholarship.id || scholarship["Scholarship Name"]));
    setIsSaved(exists);
  }, [key, getSavedList, scholarship]);

  const toggleSave = useCallback(() => {
    const saved = getSavedList();
    const existsIndex = saved.findIndex((s) => (s.id || s["Scholarship Name"]) === (scholarship.id || scholarship["Scholarship Name"]));

    let updated: SavedScholarship[];
    if (existsIndex > -1) {
      updated = saved.filter((_, i) => i !== existsIndex);
      setIsSaved(false);
    } else {
      updated = [...saved, scholarship];
      setIsSaved(true);
    }

    localStorage.setItem('savedScholarships', JSON.stringify(updated));
  }, [scholarship, getSavedList]);

  return { isSaved, toggleSave };
}