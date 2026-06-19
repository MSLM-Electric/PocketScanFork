import { router } from 'expo-router';
import { useState } from 'react';
import { Appearance, StyleSheet, Switch, TouchableOpacity, View, Text } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SafeAreaView } from 'react-native-safe-area-context';

const CURRENT_USER = {
  name: 'Project Manager',
  username: 'pm_architect',
  email: 'architect@example.com',
  memberSince: 'April 2026',
};

type Language = 'English' | 'Russian';

export default function SettingsScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';

  const [language, setLanguage] = useState<Language>('Russian');

  const initials = CURRENT_USER.name
    .split(' ')
    .map((w) => w[0])
    .join('');

  function toggleTheme(value: boolean) {
    Appearance.setColorScheme(value ? 'dark' : 'light');
  }

  function cycleLanguage() {
    setLanguage((prev) => (prev === 'English' ? 'Russian' : 'English'));
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="gearshape.fill"
          style={styles.headerImage}
        />
      }>

      <SafeAreaView edges={[]}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Settings
        </ThemedText>
      </ThemedView>

      {/* User profile card */}
      <View style={[styles.profileCard, { borderColor: colors.icon + '33', backgroundColor: colors.tint + '11' }]}>
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <ThemedText style={[styles.avatarText, { color: isDark ? '#151718' : '#fff' }]}>
            {initials}
          </ThemedText>
        </View>
        <View style={styles.profileInfo}>
          <ThemedText style={[styles.profileName, { fontFamily: Fonts.rounded }]}>
            {CURRENT_USER.name}
          </ThemedText>
          <ThemedText style={[styles.profileMeta, { color: colors.icon }]}>
            @{CURRENT_USER.username}
          </ThemedText>
          <ThemedText style={[styles.profileMeta, { color: colors.icon }]}>
            {CURRENT_USER.email}
          </ThemedText>
        </View>
      </View>

      {/* Member since */}
      <View style={[styles.section, { borderColor: colors.icon + '33' }]}>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <ThemedText style={[styles.rowLabel, { color: colors.icon }]}>Member since</ThemedText>
          <ThemedText style={styles.rowValue}>{CURRENT_USER.memberSince}</ThemedText>
        </View>
      </View>

      {/* Server settings */}
      <View style={[styles.section, { borderColor: colors.icon + '33' }]}>
        <TouchableOpacity style={styles.row} onPress={() => router.push('/server_page')}>
          <ThemedText style={[styles.rowLabel, { color: colors.icon }]}>Настройки сервера</ThemedText>
          <IconSymbol name="chevron.right" size={14} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <ThemedText style={[styles.sectionHeader, { color: colors.icon }]}>PREFERENCES</ThemedText>
      <View style={[styles.section, { borderColor: colors.icon + '33' }]}>
        <View style={[styles.row, { borderBottomColor: colors.icon + '22', borderBottomWidth: 1 }]}>
          <ThemedText style={styles.rowLabel}>Theme</ThemedText>
          <View style={styles.rowRight}>
            <ThemedText style={[styles.rowValue, { color: colors.icon, marginRight: 10 }]}>
              {isDark ? 'Dark' : 'Light'}
            </ThemedText>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.icon + '55', true: colors.tint }}
              thumbColor="#fff"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.row} onPress={cycleLanguage}>
          <ThemedText style={styles.rowLabel}>Language</ThemedText>
          <View style={styles.rowRight}>
            <ThemedText style={[styles.rowValue, { color: colors.tint, marginRight: 6 }]}>
              {language}
            </ThemedText>
            <IconSymbol name="chevron.right" size={14} color={colors.icon} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Legal & Support */}
      <ThemedText style={[styles.sectionHeader, { color: colors.icon }]}>LEGAL & SUPPORT</ThemedText>
      <View style={[styles.section, { borderColor: colors.icon + '33' }]}>
        <TouchableOpacity style={[styles.row, { borderBottomColor: colors.icon + '22', borderBottomWidth: 1 }]}>
          <ThemedText style={styles.rowLabel}>Privacy Policy</ThemedText>
          <IconSymbol name="chevron.right" size={14} color={colors.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.row}>
          <ThemedText style={styles.rowLabel}>Contact Us</ThemedText>
          <IconSymbol name="chevron.right" size={14} color={colors.icon} />
        </TouchableOpacity>
      </View>

      {/* Log Out */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: '#e53e3e33' }]}
        onPress={() => router.replace('/login')}>
        <ThemedText style={{ color: '#e53e3e', fontWeight: '600', fontSize: 16 }}>
          Log Out
        </ThemedText>
      </TouchableOpacity>
</SafeAreaView>



    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileMeta: {
    fontSize: 13,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: 16,
    marginBottom: 6,
    marginLeft: 4,
  },
  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 15,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 24,
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
