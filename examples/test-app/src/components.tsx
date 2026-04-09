import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppColors, type AppColors } from './theme';

export function ScreenTitle(props: {
  title: string;
  subtitle: string;
  badge?: string;
  testID?: string;
}) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.header} testID={props.testID}>
      <View style={styles.headerText}>
        <Text style={styles.title}>{props.title}</Text>
        <Text style={styles.subtitle}>{props.subtitle}</Text>
      </View>
      {props.badge ? <InlineBadge label={props.badge} tone="accent" /> : null}
    </View>
  );
}

export function SectionCard(props: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  tone?: 'base' | 'accent';
  testID?: string;
}) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View
      style={[styles.card, props.tone === 'accent' ? styles.cardAccent : null]}
      testID={props.testID}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{props.title}</Text>
        {props.subtitle ? <Text style={styles.cardSubtitle}>{props.subtitle}</Text> : null}
      </View>
      {props.children}
    </View>
  );
}

export function ActionButton(props: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'secondary' | 'danger';
  testID?: string;
}) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.button,
        props.kind === 'secondary' ? styles.buttonSecondary : null,
        props.kind === 'danger' ? styles.buttonDanger : null,
        pressed ? styles.buttonPressed : null,
      ]}
      testID={props.testID}
    >
      <Text
        style={[
          styles.buttonLabel,
          props.kind === 'secondary' ? styles.buttonLabelSecondary : null,
          props.kind === 'danger' ? styles.buttonLabelDanger : null,
        ]}
      >
        {props.label}
      </Text>
    </Pressable>
  );
}

export function ChoiceChip(props: {
  label: string;
  selected: boolean;
  onPress: () => void;
  testID?: string;
}) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <Pressable
      accessibilityRole="button"
      onPress={props.onPress}
      style={({ pressed }) => [
        styles.chip,
        props.selected ? styles.chipSelected : null,
        pressed ? styles.buttonPressed : null,
      ]}
      testID={props.testID}
    >
      <Text style={[styles.chipLabel, props.selected ? styles.chipLabelSelected : null]}>
        {props.label}
      </Text>
    </Pressable>
  );
}

export function ToggleRow(props: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
  testID?: string;
}) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.toggleRow} testID={props.testID}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{props.label}</Text>
        {props.description ? (
          <Text style={styles.toggleDescription}>{props.description}</Text>
        ) : null}
      </View>
      <Switch
        ios_backgroundColor={colors.lineStrong}
        thumbColor={props.value ? colors.accent : colors.card}
        trackColor={{ false: colors.lineStrong, true: colors.accentSoft }}
        value={props.value}
        onValueChange={props.onValueChange}
      />
    </View>
  );
}

export function TextField(
  props: TextInputProps & {
    label: string;
    testID?: string;
  },
) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.field} testID={props.testID}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        {...props}
        placeholderTextColor={colors.textSoft}
        style={[
          styles.fieldInput,
          props.multiline ? styles.fieldInputMultiline : null,
          props.style,
        ]}
      />
    </View>
  );
}

export function InlineBadge(props: {
  label: string;
  tone: 'accent' | 'success' | 'info' | 'neutral';
}) {
  const colors = useAppColors();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.badge,
        props.tone === 'accent' ? styles.badgeAccent : null,
        props.tone === 'success' ? styles.badgeSuccess : null,
        props.tone === 'info' ? styles.badgeInfo : null,
      ]}
    >
      <Text style={[styles.badgeLabel, props.tone === 'accent' ? styles.badgeLabelAccent : null]}>
        {props.label}
      </Text>
    </View>
  );
}

export function AppFrame(props: { children: ReactNode }) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  return (
    <View
      style={[
        styles.frame,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      {props.children}
    </View>
  );
}

export function ToastViewport(props: { message: string }) {
  const colors = useAppColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors);

  return (
    <View
      pointerEvents="none"
      style={[
        styles.toastViewport,
        {
          bottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <View style={styles.toast} testID="global-toast">
        <Text style={styles.toastLabel}>{props.message}</Text>
      </View>
    </View>
  );
}

function createStyles(colors: AppColors) {
  return StyleSheet.create({
    header: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
      marginBottom: 18,
    },
    headerText: {
      flex: 1,
      gap: 6,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 15,
      lineHeight: 22,
    },
    card: {
      backgroundColor: colors.card,
      borderColor: colors.line,
      borderRadius: 24,
      borderWidth: 1,
      gap: 14,
      marginBottom: 14,
      padding: 18,
    },
    cardAccent: {
      backgroundColor: colors.cardStrong,
      borderColor: colors.accentSoft,
    },
    cardHeader: {
      gap: 6,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 19,
      fontWeight: '700',
    },
    cardSubtitle: {
      color: colors.textSoft,
      fontSize: 14,
      lineHeight: 20,
    },
    button: {
      alignItems: 'center',
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    buttonSecondary: {
      backgroundColor: colors.card,
      borderColor: colors.line,
      borderWidth: 1,
    },
    buttonDanger: {
      backgroundColor: colors.danger,
      borderColor: colors.danger,
      borderWidth: 1,
    },
    buttonPressed: {
      opacity: 0.85,
    },
    buttonLabel: {
      color: colors.accentContrast,
      fontSize: 15,
      fontWeight: '700',
    },
    buttonLabelSecondary: {
      color: colors.text,
    },
    buttonLabelDanger: {
      color: colors.dangerContrast,
    },
    chip: {
      backgroundColor: colors.card,
      borderColor: colors.line,
      borderRadius: 999,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    chipSelected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    chipLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    chipLabelSelected: {
      color: colors.accentContrast,
    },
    toggleRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'space-between',
    },
    toggleText: {
      flex: 1,
      gap: 4,
    },
    toggleLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    toggleDescription: {
      color: colors.textSoft,
      fontSize: 13,
      lineHeight: 18,
    },
    field: {
      gap: 8,
    },
    fieldLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    fieldInput: {
      backgroundColor: colors.field,
      borderColor: colors.line,
      borderRadius: 16,
      borderWidth: 1,
      color: colors.text,
      fontSize: 16,
      minHeight: 52,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    fieldInputMultiline: {
      minHeight: 110,
      textAlignVertical: 'top',
    },
    badge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.cardStrong,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    badgeAccent: {
      backgroundColor: colors.accent,
    },
    badgeSuccess: {
      backgroundColor: colors.accentMuted,
    },
    badgeInfo: {
      backgroundColor: colors.accentSoft,
    },
    badgeLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    badgeLabelAccent: {
      color: colors.accentContrast,
    },
    frame: {
      backgroundColor: colors.surface,
      flex: 1,
      paddingHorizontal: 16,
    },
    toastViewport: {
      left: 16,
      position: 'absolute',
      right: 16,
    },
    toast: {
      backgroundColor: colors.cardStrong,
      borderColor: colors.lineStrong,
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    toastLabel: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
}
