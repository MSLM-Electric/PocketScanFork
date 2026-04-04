import { router } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={[styles.code, { color: colors.icon }]}>404</ThemedText>
      <ThemedText type="title" style={{ fontFamily: Fonts.rounded, marginBottom: 12 }}>
        Page Not Found
      </ThemedText>
      <ThemedText style={{ color: colors.icon, textAlign: 'center', marginBottom: 40 }}>
        The screen you&apos;re looking for doesn&apos;t exist.
      </ThemedText>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.tint }]}
        onPress={() => router.replace('/(tabs)')}>
        <ThemedText style={[styles.buttonText, { color: colorScheme === 'dark' ? '#151718' : '#fff' }]}>
          Go Home
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  code: {
    fontSize: 72,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
