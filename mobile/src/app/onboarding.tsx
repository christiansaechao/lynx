import { useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { forwardRef, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useOrientationLock } from '@/hooks/use-orientation-lock';
import { ThemedText } from '@/components/themed-text';
import { DEFAULT_TEMPLATE_ID } from '@/constants/cardTemplates';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useCardStore } from '@/store/useCardStore';
import { consumePendingFullName } from '@/utils/pendingFullName';
import { supabase } from '@/utils/supabase';

/** Postgres unique_violation. Raised by the unique index on cards.owner_user_id. */
const UNIQUE_VIOLATION = '23505';

interface IdentityFieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  /** 'next' advances to the following field; 'done' submits. */
  returnKeyType: 'next' | 'done';
  onSubmitEditing: () => void;
  textContentType: 'name' | 'jobTitle' | 'organizationName';
  editable: boolean;
}

const IdentityField = forwardRef<TextInput, IdentityFieldProps>(function IdentityField(
  { label, placeholder, value, onChangeText, returnKeyType, onSubmitEditing, textContentType, editable },
  ref,
) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText variant="label" themeColor="textSecondary">
        {label}
      </ThemedText>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        // These are proper nouns, so autocorrect fights the user rather than
        // helping -- it will happily "fix" an unusual surname or company name.
        autoCapitalize="words"
        autoCorrect={false}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        // Lets iOS offer the value from the user's own contact card.
        textContentType={textContentType}
        editable={editable}
        // submitBehavior="submit" keeps the keyboard up while focus moves to
        // the next field; without it the keyboard dismisses and reopens
        // between every field.
        submitBehavior={returnKeyType === 'next' ? 'submit' : 'blurAndSubmit'}
        style={[styles.input, { color: theme.text, borderBottomColor: theme.hairline, fontFamily: Fonts?.serif }]}
      />
    </View>
  );
});

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const router = useRouter();

  const session = useAuthStore((s) => s.session);
  const setCardStatus = useAuthStore((s) => s.setCardStatus);
  const setCard = useCardStore((s) => s.setCard);
  const setIdentity = useCardStore((s) => s.setIdentity);

  const [fullName, setFullName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameRef = useRef<TextInput>(null);
  const titleRef = useRef<TextInput>(null);
  const companyRef = useRef<TextInput>(null);

  useOrientationLock(ScreenOrientation.OrientationLock.PORTRAIT_UP);

  // Apple hands back the user's name on first authorization only, and
  // signInWithApple stashed it for exactly this moment. It is a starting value,
  // not a commitment: the field stays editable, and so does the card later.
  useEffect(() => {
    let active = true;

    consumePendingFullName().then((stored) => {
      if (!active) return;

      if (stored) {
        setFullName(stored);
        // Name is already filled, so land the cursor on the first field that
        // actually needs input rather than making the user step past it.
        titleRef.current?.focus();
      } else {
        nameRef.current?.focus();
      }
    });

    return () => {
      active = false;
    };
  }, []);

  const trimmedName = fullName.trim();
  const trimmedTitle = jobTitle.trim();
  const trimmedCompany = company.trim();

  // All three are required by the database for an 'employed' card: full_name is
  // NOT NULL, and cards_context_fields_check demands company_name and job_title
  // be non-null when context = 'employed'. Blocking here is what keeps that
  // constraint from ever failing at the server.
  const canSubmit = Boolean(trimmedName && trimmedTitle && trimmedCompany) && !submitting;

  const handleMint = async () => {
    if (!canSubmit) return;

    const userId = session?.user.id;
    if (!userId) {
      setError('You are not signed in. Please sign in again.');
      return;
    }

    setSubmitting(true);
    setError(null);

    // Direct insert rather than an RPC: the cards_insert_own RLS policy already
    // authorizes exactly this write via auth.uid(), and a single-row insert has
    // nothing to make atomic. A SECURITY DEFINER function would only bypass
    // that policy and have to re-check the same thing by hand.
    const { data: insertedCard, error: insertError } = await supabase
      .from('cards')
      .insert({
        owner_user_id: userId,
        // Hardcoded until the job-seeker picker exists. Note that context is a
        // text column with a CHECK, not an enum, so TypeScript cannot catch a
        // typo here -- only the database will, at runtime.
        context: 'employed',
        full_name: trimmedName,
        job_title: trimmedTitle,
        company_name: trimmedCompany,
        email: session.user.email ?? null,
        // id, material_id, style, created_at and updated_at all take their
        // database defaults.
      })
      // Return the new row's id so the store can target link writes and the
      // local cache without waiting for a cold-start re-fetch.
      .select('id')
      .single();

    if (insertError) {
      // The user already has a card -- a double-tap that beat the submitting
      // guard, or a stale 'missing' status. Either way the card exists, so
      // carry on into the app instead of showing a dead end.
      if (insertError.code === UNIQUE_VIOLATION) {
        setCardStatus('exists');
        router.replace('/transition');
        return;
      }

      setError(insertError.message);
      setSubmitting(false);
      return;
    }

    // Displace the mockup default in the card store, otherwise the card screen
    // shows seeded placeholder content instead of what was just typed.
    setCard({
      fields: {
        context: 'employed',
        fullName: trimmedName,
        jobTitle: trimmedTitle,
        companyName: trimmedCompany,
        department: '',
        location: '',
        phone: '',
        email: session.user.email ?? '',
      },
      links: [],
      materialId: 'bone',
      templateId: DEFAULT_TEMPLATE_ID,
      fieldStyles: {},
    });

    // Bind the store to the new row so link edits persist to the DB and the
    // local cache from here on, without a cold-start re-fetch.
    if (insertedCard) setIdentity({ cardId: insertedCard.id, userId });

    // Status before navigation: the Stack guards key on session alone, so this
    // cannot unmount the screen mid-navigation, and it means a cold start after
    // minting routes straight to the card.
    setCardStatus('exists');
    router.replace('/transition');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: theme.background }]}
      // The layout is space-between with 26px inputs and wide gaps, so on a
      // smaller iPhone the keyboard would otherwise cover Company and the
      // mint button entirely.
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View
          style={[
            styles.screen,
            { paddingTop: insets.top + Spacing.xxl, paddingBottom: insets.bottom + Spacing.lg },
          ]}>
          <View style={styles.header}>
            <ThemedText variant="title" font="serif" style={styles.headline}>
              Define the{'\n'}Object.
            </ThemedText>
            <ThemedText variant="body" themeColor="textSecondary" style={styles.subhead}>
              Enter the details that will be inscribed on your primary card.
            </ThemedText>
          </View>

          <View style={styles.fields}>
            <IdentityField
              ref={nameRef}
              label="Full Name"
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChangeText={setFullName}
              returnKeyType="next"
              onSubmitEditing={() => titleRef.current?.focus()}
              textContentType="name"
              editable={!submitting}
            />
            <IdentityField
              ref={titleRef}
              label="Job Title"
              placeholder="e.g. Lead Designer"
              value={jobTitle}
              onChangeText={setJobTitle}
              returnKeyType="next"
              onSubmitEditing={() => companyRef.current?.focus()}
              textContentType="jobTitle"
              editable={!submitting}
            />
            <IdentityField
              ref={companyRef}
              label="Company"
              placeholder="e.g. Acme Corp"
              value={company}
              onChangeText={setCompany}
              returnKeyType="done"
              onSubmitEditing={handleMint}
              textContentType="organizationName"
              editable={!submitting}
            />
          </View>

          <View style={styles.footer}>
            {error ? (
              <ThemedText variant="body" style={styles.error}>
                {error}
              </ThemedText>
            ) : null}

            <Pressable
              style={[styles.mintButton, { backgroundColor: theme.text }, !canSubmit && styles.mintButtonDisabled]}
              onPress={handleMint}
              disabled={!canSubmit}>
              {submitting ? (
                <ActivityIndicator color={theme.background} />
              ) : (
                <ThemedText variant="button" style={{ color: theme.background }}>
                  MINT CARD
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
  },
  header: {
    gap: Spacing.md,
  },
  headline: {
    fontSize: 34,
    lineHeight: 40,
  },
  subhead: {
    maxWidth: 300,
  },
  fields: {
    gap: Spacing.xxl,
  },
  field: {
    gap: Spacing.md,
  },
  input: {
    fontSize: 26,
    lineHeight: 32,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    gap: Spacing.md,
  },
  mintButton: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // The button is high-contrast black-on-white, so without this the disabled
  // state is invisible and the button reads as simply broken.
  mintButtonDisabled: {
    opacity: 0.35,
  },
  error: {
    color: '#FF6B6B',
    textAlign: 'center',
  },
});
