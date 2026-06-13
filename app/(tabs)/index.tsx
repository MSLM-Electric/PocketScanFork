import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import passports from '@/repo/passport.json';
import { Button } from 'react-native';

type Passport = (typeof passports)[number];

function isExpired(expiryDate: string) {
  return new Date(expiryDate) < new Date();
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function PassportCard({ item, colors }: { item: Passport; colors: typeof Colors.light }) {
  const expired = isExpired(item.parsed.expiryDate);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background, borderColor: colors.icon + '22' }]}
      onPress={() => router.push(`/passport/${item.id}` as never)}
      activeOpacity={0.75}>
      <View style={[styles.cardIcon, { backgroundColor: colors.tint + '18' }]}>
        <IconSymbol name="doc.text.viewfinder" size={26} color={colors.tint} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: colors.text, fontFamily: Fonts!.rounded }]}>
          {item.parsed.givenNames} {item.parsed.surname}
        </Text>
        <Text style={[styles.cardMeta, { color: colors.icon }]}>
          {item.parsed.nationality}  ·  #{item.parsed.documentNumber}
        </Text>
        <Text style={[styles.cardMeta, { color: colors.icon }]}>
          Scanned {formatDate(item.scannedAt)}
        </Text>
      </View>
      <View style={[styles.badge, { backgroundColor: expired ? '#FF3B3022' : '#30D15822' }]}>
        <Text style={[styles.badgeText, { color: expired ? '#FF3B30' : '#30D158' }]}>
          {expired ? 'Expired' : 'Valid'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  console.log('Главный экран загружен');

  const testLog = () => {
    console.log('Нажата кнопка');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts!.rounded }}>
          My Documents
        </ThemedText>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          {passports.length} scanned
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>PocketScan</Text>
        <Button title="Test Log" onPress={testLog} />
      </View>

      <FlatList
        data={passports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PassportCard item={item} colors={colors} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12, gap: 2 },
  subtitle: { fontSize: 14 },
  list: { paddingHorizontal: 16, paddingBottom: 32 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardMeta: { fontSize: 12 },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
});
