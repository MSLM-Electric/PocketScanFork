import * as Clipboard from 'expo-clipboard';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import passports from '@/repo/passport.json';

function isExpired(expiryDate: string) {
  return new Date(expiryDate) < new Date();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function Row({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.row, { borderBottomColor: colors.icon + '18' }]}>
      <Text style={[styles.rowLabel, { color: colors.icon }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

export default function PassportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const passport = passports.find((p) => p.id === id);

  if (!passport) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Passport not found.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: colors.tint, marginTop: 12 }}>Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const { parsed, mrz, scannedAt } = passport;
  const expired = isExpired(parsed.expiryDate);

  const handleShare = async () => {
    const text = [
      `PASSPORT — ${parsed.nationality}`,
      `Name: ${parsed.givenNames} ${parsed.surname}`,
      `Document #: ${parsed.documentNumber}`,
      `Date of Birth: ${formatDate(parsed.dateOfBirth)}`,
      `Sex: ${parsed.sex === 'M' ? 'Male' : 'Female'}`,
      `Expiry: ${formatDate(parsed.expiryDate)}`,
      ``,
      `MRZ:`,
      mrz.line1,
      mrz.line2,
    ].join('\n');

    await Clipboard.setStringAsync(text);
    Alert.alert('Copied', 'Passport data copied to clipboard.');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={[]}>
      <Stack.Screen
        options={{
          headerStyle: { backgroundColor: colors.background },
          headerRight: () => (
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => Alert.alert('Edit', 'Edit coming soon.')} hitSlop={8}>
                <IconSymbol name="pencil" size={20} color={colors.tint} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} hitSlop={8}>
                <IconSymbol name="square.and.arrow.up" size={20} color={colors.tint} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Passport card */}
        <View style={[styles.passportCard, { backgroundColor: colors.tint }]}>
          <View style={styles.passportCardTop}>
            <IconSymbol name="doc.text.viewfinder" size={28} color="#fff" />
            <Text style={styles.passportCardType}>PASSPORT</Text>
            <View style={[styles.validBadge, { backgroundColor: expired ? '#FF3B30' : '#30D158' }]}>
              <Text style={styles.validBadgeText}>{expired ? 'EXPIRED' : 'VALID'}</Text>
            </View>
          </View>
          <Text style={styles.passportName}>
            {parsed.givenNames} {parsed.surname}
          </Text>
          <Text style={styles.passportNationality}>{parsed.nationality}</Text>
        </View>

        {/* Details */}
        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon + '22' }]}>
          <Text style={[styles.sectionTitle, { color: colors.icon, fontFamily: Fonts!.rounded }]}>
            Personal Information
          </Text>
          <Row label="Surname" value={parsed.surname} colors={colors} />
          <Row label="Given Names" value={parsed.givenNames} colors={colors} />
          <Row label="Nationality" value={parsed.nationality} colors={colors} />
          <Row label="Sex" value={parsed.sex === 'M' ? 'Male' : 'Female'} colors={colors} />
          <Row label="Date of Birth" value={formatDate(parsed.dateOfBirth)} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.background, borderColor: colors.icon + '22' }]}>
          <Text style={[styles.sectionTitle, { color: colors.icon, fontFamily: Fonts!.rounded }]}>
            Document
          </Text>
          <Row label="Document Number" value={parsed.documentNumber} colors={colors} />
          <Row label="Expiry Date" value={formatDate(parsed.expiryDate)} colors={colors} />
          <Row label="Scanned" value={formatDate(scannedAt)} colors={colors} />
        </View>

        {/* MRZ */}
        <View style={[styles.mrzBox, { backgroundColor: colors.icon + '10', borderColor: colors.icon + '22' }]}>
          <Text style={[styles.mrzLabel, { color: colors.icon }]}>Machine Readable Zone</Text>
          <Text style={[styles.mrzLine, { color: colors.text }]}>{mrz.line1}</Text>
          <Text style={[styles.mrzLine, { color: colors.text }]}>{mrz.line2}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  scroll: { padding: 16, gap: 14, paddingBottom: 40 },

  passportCard: {
    borderRadius: 20,
    padding: 22,
    gap: 6,
  },
  passportCardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  passportCardType: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 1.5, flex: 1 },
  validBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  validBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  passportName: { color: '#fff', fontSize: 22, fontWeight: '800' },
  passportNationality: { color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  section: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    padding: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: { fontSize: 13 },
  rowValue: { fontSize: 13, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },

  mrzBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
  mrzLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 },
  mrzLine: { fontFamily: 'monospace', fontSize: 12, letterSpacing: 1 },

  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 20, marginRight: 4 },
});
