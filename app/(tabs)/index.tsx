import { router } from 'expo-router';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import passports from '@/repo/passport.json';

import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

type Passport = (typeof passports)[number];

interface DrivingLicense {
  id: string;
  fullName: string;
  birthDate: string;
  docNumber: string;
  category: string;
  createdAt: string;
}

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
      onPress={() => router.push(`/passport/${item.id}` as never)}>
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
  const [licenses, setLicenses] = useState<DrivingLicense[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<DrivingLicense | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadLicenses = async () => {
    try {
      console.log('Загружено прав:', licenses);
      const data = await AsyncStorage.getItem('drivingLicenses');
      if (data) setLicenses(JSON.parse(data));
    } catch (error) {
      console.error('Ошибка загрузки прав:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadLicenses();
    }, [])
  );

  useEffect(() => {
    console.log('Загружено прав при входе в приложение:', licenses);
    loadLicenses();
    // Обновление при возврате на этот экран
    const unsubscribe = router.events?.on('focus', loadLicenses);
    return () => unsubscribe?.();
  }, []);

  const deleteLicense = async (id: string) => {
    Alert.alert(
      'Удалить документ?',
      'Вы уверены, что хотите удалить этот документ?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: async () => {
            try {
              const updated = licenses.filter(item => item.id !== id);
              await AsyncStorage.setItem('drivingLicenses', JSON.stringify(updated));
              setLicenses(updated);
              setModalVisible(false);
            } catch (error) {
              Alert.alert('Ошибка', 'Не удалось удалить документ');
            }
          }
        }
      ]
    );
  };

  const renderLicenseItem = ({ item }: { item: DrivingLicense }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.background, borderColor: colors.icon + '22' }]}
      onPress={() => {
        setSelectedLicense(item);
        setModalVisible(true);
      }}>
      <View style={[styles.cardIcon, { backgroundColor: colors.tint + '18' }]}>
        <IconSymbol name="car.fill" size={26} color={colors.tint} />
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { color: colors.text, fontFamily: Fonts!.rounded }]}>
          {item.fullName || 'Без имени'}
        </Text>
        <Text style={[styles.cardMeta, { color: colors.icon }]}>Рождение: {item.birthDate}</Text>
        <Text style={[styles.cardMeta, { color: colors.icon }]}>Категория: {item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <ThemedText type="title" style={{ fontFamily: Fonts!.rounded }}>My Documents</ThemedText>
        <Text style={[styles.subtitle, { color: colors.icon }]}>
          Паспортов: {passports.length} | Прав: {licenses.length}
        </Text>
      </View>

      <FlatList
        data={passports}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => <PassportCard item={item} colors={colors} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        ListHeaderComponent={
          licenses.length > 0 ? (
            <View style={{ marginBottom: 16 }}>
              <Text style={[styles.sectionHeader, { color: colors.text }]}>Водительские права</Text>
            </View>
          ) : null
        }
        ListFooterComponent={
          licenses.length > 0 ? (
            <FlatList
              data={licenses}
              keyExtractor={(item) => item.id}
              renderItem={renderLicenseItem}
              scrollEnabled={false}
              ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            />
          ) : (
            <Text style={[styles.emptyText, { color: colors.icon }]}>
              Нет сохранённых прав. Отсканируйте и сохраните документ.
            </Text>
          )
        }
      />

      {/* Модальное окно с деталями */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Детали документа</Text>
            {selectedLicense && (
              <>
                <Text style={[styles.modalLabel, { color: colors.text }]}>ФИО:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedLicense.fullName}</Text>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Дата рождения:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedLicense.birthDate}</Text>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Серия документа:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedLicense.docNumber}</Text>
                <Text style={[styles.modalLabel, { color: colors.text }]}>Категория:</Text>
                <Text style={[styles.modalValue, { color: colors.text }]}>{selectedLicense.category}</Text>
                <Text style={[styles.modalMeta, { color: colors.icon }]}>
                  Сохранено: {new Date(selectedLicense.createdAt).toLocaleString()}
                </Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Закрыть</Text>
            </TouchableOpacity>

            {/* Кнопка удаления */}
            <TouchableOpacity
              style={[styles.modalDeleteButton, { borderColor: '#FF3B30' }]}
              onPress={() => selectedLicense && deleteLicense(selectedLicense.id)}>
              <Text style={[styles.modalDeleteText, { color: '#FF3B30' }]}>Удалить документ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  cardIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700' },
  cardMeta: { fontSize: 12 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalLabel: { fontWeight: '600', marginTop: 8 },
  modalValue: { marginBottom: 8 },
  modalMeta: { fontSize: 12, marginTop: 12, fontStyle: 'italic' },
  modalButton: { marginTop: 20, paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#9f9af0', fontSize: 16, fontWeight: 'bold' },
  modalDeleteButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalDeleteText: {
    fontWeight: '600',
  },
});