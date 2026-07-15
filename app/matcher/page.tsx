'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Sparkles,
  Unlock,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ScholarshipCard from '@/components/ScholarshipCard';
import { findScholarships, type StudentProfile } from '@/lib/findScholarships';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
];

const SCHOOL_TYPES = [
  'High School',
  '2-Year / Community College',
  '4-Year College / University',
  'Vocational / Trade School',
  'Graduate / Professional',
  'Other',
];

const YEARS_BY_TYPE: Record<string, string[]> = {
  'High School': ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Gap year'],
  '2-Year / Community College': ['1st year', '2nd year', 'Returning / transfer'],
  '4-Year College / University': ['Freshman', 'Sophomore', 'Junior', 'Senior', '5th year+'],
  'Vocational / Trade School': ['In program', 'Near completion', 'Recently enrolled'],
  'Graduate / Professional': ['1st year', '2nd year', '3rd year+', 'Thesis / dissertation'],
  Other: ['Incoming', 'Current student', 'Returning adult learner'],
};

const FIELDS_OF_STUDY = [
  'Computer Science / Technology',
  'Engineering',
  'Biology / Life Sciences',
  'Pre-Med / Healthcare',
  'Nursing',
  'Business / Finance',
  'Education',
  'Arts / Design / Music',
  'Humanities / Writing',
  'Social Sciences / Psychology',
  'Law / Criminal Justice',
  'Agriculture / Environmental',
  'Trades / Skilled Labor',
  'Undecided / Exploring',
];

const ACHIEVEMENTS = [
  'Honor Roll / High GPA',
  'Research experience',
  'Leadership roles',
  'Athletics / Sports',
  'Community service / Volunteering',
  'Arts, music, or performance',
  'Speech & Debate',
  'Internships / Work experience',
  'STEM competitions / Clubs',
  'Student government',
];

const BACKGROUNDS = [
  'First-generation college student',
  'Military / Veteran / Military family',
  'Pell Grant eligible / Financial need',
  'Low-to-moderate income household',
  'Rural or small-town background',
  'Underrepresented minority',
  'Student with a disability',
  'LGBTQ+',
  'Immigrant / Refugee / New American',
  'Single-parent household',
  'Foster care / Aging out of care',
  'Working student / Caregiver',
];

const GOALS = [
  'Healthcare / Medicine',
  'Tech / AI / Engineering',
  'Business / Entrepreneurship',
  'Public service / Government',
  'Education / Teaching',
  'Research / Academia',
  'Creative / Arts career',
  'Skilled trades / Technical career',
  'Law / Advocacy',
  'Nonprofit / Community impact',
];

type StepId =
  | 'basics'
  | 'location'
  | 'academics'
  | 'achievements'
  | 'background'
  | 'goals';

const STEPS: { id: StepId; title: string; subtitle: string }[] = [
  {
    id: 'basics',
    title: 'About you',
    subtitle: 'A few basics so we can personalize matches and outreach drafts.',
  },
  {
    id: 'location',
    title: 'Where you are',
    subtitle: 'Local awards often have smaller pools and higher win rates.',
  },
  {
    id: 'academics',
    title: 'Academics & interests',
    subtitle: 'What you study (or plan to study) shapes which awards fit.',
  },
  {
    id: 'achievements',
    title: 'Strengths & activities',
    subtitle: 'Select what stands out — add anything that is missing.',
  },
  {
    id: 'background',
    title: 'Your background',
    subtitle: 'Optional. Many scholarships exist specifically for these paths.',
  },
  {
    id: 'goals',
    title: 'Goals & extras',
    subtitle: 'Where you are headed — and anything else we should know.',
  },
];

interface FormState {
  name: string;
  schoolType: string;
  year: string;
  school: string;
  city: string;
  state: string;
  zip: string;
  gpa: string;
  fieldsOfStudy: string[];
  achievements: string[];
  backgrounds: string[];
  goals: string[];
  notes: string;
}

const initialForm: FormState = {
  name: '',
  schoolType: '',
  year: '',
  school: '',
  city: '',
  state: '',
  zip: '',
  gpa: '',
  fieldsOfStudy: [],
  achievements: [],
  backgrounds: [],
  goals: [],
  notes: '',
};

function ChipMultiSelect({
  options,
  selected,
  onChange,
  otherPlaceholder = 'Add your own…',
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  otherPlaceholder?: string;
}) {
  const [custom, setCustom] = useState('');

  const toggle = (opt: string) => {
    onChange(
      selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]
    );
  };

  const addCustom = () => {
    const value = custom.trim();
    if (!value) return;
    const label = value.startsWith('Other:') ? value : value;
    if (!selected.some((s) => s.toLowerCase() === label.toLowerCase())) {
      onChange([...selected, label]);
    }
    setCustom('');
  };

  const customs = selected.filter((s) => !options.includes(s));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all',
                active
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'border-border bg-white text-gray-700 hover:border-primary/40 hover:bg-blue-50/60'
              )}
            >
              {active && <Check className="size-3.5" />}
              {opt}
            </button>
          );
        })}
      </div>

      {customs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {customs.map((c) => (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-sm font-medium text-emerald-800"
            >
              {c}
              <button
                type="button"
                aria-label={`Remove ${c}`}
                onClick={() => onChange(selected.filter((s) => s !== c))}
                className="rounded-full p-0.5 hover:bg-emerald-100"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder={otherPlaceholder}
          className="h-11 flex-1 rounded-xl text-base"
        />
        <Button
          type="button"
          variant="outline"
          onClick={addCustom}
          disabled={!custom.trim()}
          className="h-11 shrink-0 rounded-xl px-4"
        >
          <Plus className="size-4" />
          Add
        </Button>
      </div>
    </div>
  );
}

function buildProfile(form: FormState): StudentProfile {
  const backgrounds = form.backgrounds;
  const military = backgrounds.some((b) => /military|veteran/i.test(b));
  const first_gen = backgrounds.some((b) => /first-generation|first gen/i.test(b));
  const pell = backgrounds.some((b) => /pell|financial need/i.test(b));
  const low_income = backgrounds.some((b) => /low-to-moderate|low income|income/i.test(b));
  const rural = backgrounds.some((b) => /rural|small-town/i.test(b));

  const hometown = [form.city, form.state].filter(Boolean).join(', ');

  return {
    name: form.name.trim() || undefined,
    school: form.school.trim() || form.schoolType || 'my school',
    schoolType: form.schoolType || undefined,
    year: form.year || undefined,
    city: form.city.trim() || undefined,
    state: form.state || undefined,
    zip: form.zip.trim() || undefined,
    hometown: hometown || form.city.trim() || undefined,
    gpa: form.gpa.trim() || undefined,
    fieldsOfStudy: form.fieldsOfStudy,
    excellence_areas: form.achievements,
    backgrounds,
    goals: form.goals,
    notes: form.notes.trim() || undefined,
    military,
    first_gen,
    pell,
    low_income,
    rural,
  };
}

export default function MatcherPage() {
  const { isAuthenticated } = useAuth();
  const accessMode: 'demo' | 'full' = isAuthenticated ? 'full' : 'demo';

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  const step = STEPS[stepIndex];
  const progress = Math.round(((stepIndex + (results ? 1 : 0)) / (STEPS.length + 1)) * 100);
  const yearOptions = useMemo(
    () => YEARS_BY_TYPE[form.schoolType] || YEARS_BY_TYPE.Other,
    [form.schoolType]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const validateStep = (): boolean => {
    switch (step.id) {
      case 'basics':
        if (!form.schoolType) {
          setError('Please select the type of school you attend.');
          return false;
        }
        return true;
      case 'location':
        if (!form.city.trim() || !form.state) {
          setError('City and state help us find local scholarships — both are required.');
          return false;
        }
        if (form.zip && !/^\d{5}(-\d{4})?$/.test(form.zip.trim())) {
          setError('Enter a valid 5-digit ZIP code (or leave it blank).');
          return false;
        }
        return true;
      case 'academics':
        if (form.fieldsOfStudy.length === 0) {
          setError('Select at least one field of study, or add your own.');
          return false;
        }
        return true;
      case 'achievements':
      case 'background':
      case 'goals':
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((i) => i + 1);
      setError(null);
      return;
    }
    void submit();
  };

  const goBack = () => {
    setError(null);
    if (results) {
      setResults(null);
      return;
    }
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  };

  const submit = async () => {
    setIsSubmitting(true);
    setError(null);
    const built = buildProfile(form);
    setProfile(built);

    try {
      const matches = await findScholarships(built);
      setResults(matches);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Something went wrong finding matches.';
      setError(message);
      setResults([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const restart = () => {
    setForm(initialForm);
    setStepIndex(0);
    setResults(null);
    setProfile(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/40">
      <main className="mx-auto max-w-3xl space-y-10 px-4 py-12 sm:px-6 sm:py-16">
        {/* Header */}
        <div className="space-y-5 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-sm font-medium text-gray-800 shadow-sm">
            <Sparkles className="size-4 text-amber-500" />
            Personalized scholarship matcher
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {results ? 'Your matches' : 'Find scholarships that fit you'}
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-gray-700 sm:text-lg">
            {results
              ? accessMode === 'demo'
                ? 'Demo results show fit scores and eligibility — sign in to unlock contacts and outreach tools.'
                : 'Ranked by fit. Contact organizers and save awards to your student account.'
              : 'Answer a few questions. We’ll match you based on location, interests, and background.'}
          </p>
          <div
            className={cn(
              'mx-auto flex max-w-xl flex-col items-center gap-3 rounded-2xl border px-5 py-4 sm:flex-row sm:justify-between',
              accessMode === 'demo'
                ? 'border-amber-200 bg-amber-50 text-amber-950'
                : 'border-emerald-200 bg-emerald-50 text-emerald-950'
            )}
          >
            <p className="flex items-center gap-2 text-sm font-medium">
              {accessMode === 'demo' ? (
                <>
                  <Lock className="size-4 shrink-0" /> Demo mode — try free, contacts hidden
                </>
              ) : (
                <>
                  <Unlock className="size-4 shrink-0" /> Full access — contacts & save unlocked
                </>
              )}
            </p>
            {accessMode === 'demo' && (
              <Link href="/login?next=/matcher&intent=full">
                <Button size="sm" className="rounded-xl">
                  Sign in for full access
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Progress */}
        {!results && (
          <div className="mb-8">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-gray-500">
              <span>
                Step {stepIndex + 1} of {STEPS.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${Math.max(progress, 6)}%` }}
              />
            </div>
            <div className="mt-3 hidden gap-1 sm:flex">
              {STEPS.map((s, i) => (
                <div
                  key={s.id}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i <= stepIndex ? 'bg-primary' : 'bg-gray-200'
                  )}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {results !== null ? (
          <div className="space-y-6">
            <Card className="border-0 shadow-lg ring-1 ring-black/5">
              <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-emerald-50">
                <CardTitle className="text-xl font-semibold text-gray-900 sm:text-2xl">
                  {results.length > 0
                    ? `${results.length} scholarship${results.length === 1 ? '' : 's'} matched`
                    : 'No strong matches yet'}
                </CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {results.length > 0
                    ? 'Sorted by relevance. Higher scores mean a closer fit to your characteristics.'
                    : 'Try broadening fields of study, checking a nearby city, or exploring Quick local search. New awards are added regularly.'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6 flex flex-wrap gap-2">
                  {profile?.city && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">
                      <MapPin className="size-3" />
                      {profile.city}
                      {profile.state ? `, ${profile.state}` : ''}
                    </span>
                  )}
                  {profile?.fieldsOfStudy?.slice(0, 3).map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {f}
                    </span>
                  ))}
                  {(profile?.fieldsOfStudy?.length || 0) > 3 && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      +{(profile?.fieldsOfStudy?.length || 0) - 3} more
                    </span>
                  )}
                </div>

                {error && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                    {error}
                  </div>
                )}

                <div className="grid gap-8">
                  {results.map((sch, idx) => (
                    <ScholarshipCard
                      key={sch.id || sch['Scholarship Name'] || idx}
                      scholarship={sch}
                      studentProfile={profile || undefined}
                      accessMode={accessMode}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button variant="outline" onClick={goBack} className="rounded-xl">
                    <ArrowLeft className="size-4" />
                    Edit answers
                  </Button>
                  <Button onClick={restart} className="rounded-xl">
                    Start over
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-0 shadow-xl ring-1 ring-black/5">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl font-semibold text-gray-900">
                {step.title}
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                {step.subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              {step.id === 'basics' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="name">First name (optional)</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Used in personalized email drafts"
                      className="h-11 rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>School type *</Label>
                    <Select
                      value={form.schoolType}
                      onValueChange={(v) => {
                        update('schoolType', v);
                        update('year', '');
                      }}
                    >
                      <SelectTrigger className="h-11 w-full rounded-xl text-base">
                        <SelectValue placeholder="Select school type" />
                      </SelectTrigger>
                      <SelectContent>
                        {SCHOOL_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {t}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.schoolType && (
                    <div className="space-y-2">
                      <Label>Current year / status</Label>
                      <Select value={form.year} onValueChange={(v) => update('year', v)}>
                        <SelectTrigger className="h-11 w-full rounded-xl text-base">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          {yearOptions.map((y) => (
                            <SelectItem key={y} value={y}>
                              {y}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="school">School name (optional)</Label>
                    <Input
                      id="school"
                      value={form.school}
                      onChange={(e) => update('school', e.target.value)}
                      placeholder="e.g. Lincoln High School, State University"
                      className="h-11 rounded-xl text-base"
                    />
                  </div>
                </div>
              )}

              {step.id === 'location' && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="city">City / town *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => update('city', e.target.value)}
                        placeholder="Where you live or attend school"
                        className="h-11 rounded-xl text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>State *</Label>
                      <Select value={form.state} onValueChange={(v) => update('state', v)}>
                        <SelectTrigger className="h-11 w-full rounded-xl text-base">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {US_STATES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP code (optional)</Label>
                    <Input
                      id="zip"
                      value={form.zip}
                      onChange={(e) => update('zip', e.target.value)}
                      placeholder="12345"
                      inputMode="numeric"
                      maxLength={10}
                      className="h-11 max-w-xs rounded-xl text-base"
                    />
                    <p className="text-xs text-muted-foreground">
                      Helps prioritize community and regional awards near you.
                    </p>
                  </div>
                </div>
              )}

              {step.id === 'academics' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="gpa">Unweighted GPA (optional)</Label>
                    <Input
                      id="gpa"
                      value={form.gpa}
                      onChange={(e) => update('gpa', e.target.value)}
                      placeholder="e.g. 3.6"
                      className="h-11 max-w-xs rounded-xl text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Field(s) of study / interest *</Label>
                    <p className="text-xs text-muted-foreground">
                      Select all that apply, or type your own major or pathway.
                    </p>
                    <ChipMultiSelect
                      options={FIELDS_OF_STUDY}
                      selected={form.fieldsOfStudy}
                      onChange={(v) => update('fieldsOfStudy', v)}
                      otherPlaceholder="Other major or interest…"
                    />
                  </div>
                </div>
              )}

              {step.id === 'achievements' && (
                <div className="space-y-2">
                  <Label>Key strengths & activities</Label>
                  <p className="text-xs text-muted-foreground">
                    Optional but recommended — many awards look for these signals.
                  </p>
                  <ChipMultiSelect
                    options={ACHIEVEMENTS}
                    selected={form.achievements}
                    onChange={(v) => update('achievements', v)}
                    otherPlaceholder="Other achievement or activity…"
                  />
                </div>
              )}

              {step.id === 'background' && (
                <div className="space-y-2">
                  <Label>Background (optional)</Label>
                  <p className="text-xs text-muted-foreground">
                    Only used for matching. Select what applies, or write your own.
                  </p>
                  <ChipMultiSelect
                    options={BACKGROUNDS}
                    selected={form.backgrounds}
                    onChange={(v) => update('backgrounds', v)}
                    otherPlaceholder="Other identity or circumstance…"
                  />
                </div>
              )}

              {step.id === 'goals' && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label>Post-graduation / career goals</Label>
                    <ChipMultiSelect
                      options={GOALS}
                      selected={form.goals}
                      onChange={(v) => update('goals', v)}
                      otherPlaceholder="Other goal or plan…"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Anything else we should know?</Label>
                    <textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => update('notes', e.target.value)}
                      placeholder="Clubs, constraints, unique story, languages, specific interests…"
                      rows={4}
                      className="w-full resize-y rounded-xl border border-input bg-input/30 px-3 py-2.5 text-base outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between gap-3 border-t pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={goBack}
                  disabled={stepIndex === 0 || isSubmitting}
                  className="rounded-xl"
                >
                  <ArrowLeft className="size-4" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={isSubmitting}
                  className="min-w-[140px] rounded-xl px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Matching…
                    </>
                  ) : stepIndex === STEPS.length - 1 ? (
                    <>
                      See my matches
                      <Sparkles className="size-4" />
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
