import { router } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function LoginScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.inner}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded, marginBottom: 8 }}>
          PocketScan
        </ThemedText>
        <ThemedText style={{ color: colors.icon, marginBottom: 40 }}>
          Sign in to your account
        </ThemedText>

        <TextInput
          style={[styles.input, { borderColor: colors.icon, color: colors.text, backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#f5f5f5' }]}
          placeholder="Email"
          placeholderTextColor={colors.icon}
          keyboardType="email-address"
          autoCapitalize="none"
          defaultValue="aisha@pocketscan.app"
        />
        <TextInput
          style={[styles.input, { borderColor: colors.icon, color: colors.text, backgroundColor: colorScheme === 'dark' ? '#1e2022' : '#f5f5f5' }]}
          placeholder="Password"
          placeholderTextColor={colors.icon}
          secureTextEntry
          defaultValue="••••••••"
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={() => router.replace('/(tabs)')}>
          <ThemedText style={[styles.buttonText, { color: colorScheme === 'dark' ? '#151718' : '#fff' }]}>
            Sign In
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/forgot-password')} style={styles.link}>
          <ThemedText style={[styles.linkText, { color: colors.tint }]}>
            Forgot password?
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/register')} style={styles.link}>
          <ThemedText style={{ color: colors.icon }}>
            Don&apos;t have an account?{' '}
            <ThemedText style={[styles.linkText, { color: colors.tint }]}>Register</ThemedText>
          </ThemedText>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 14,
  },
  button: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  linkText: {
    fontWeight: '600',
  },
});
