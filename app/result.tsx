import { router, useLocalSearchParams } from 'expo-router';
//import * as TextExtractor from 'expo-text-extractor';
import MlkitOcr from 'rn-mlkit-ocr';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, ScrollView, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ResultScreen() {
  // Получаем параметр uri из навигации
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [recognizedText, setRecognizedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
    const [extractedFields, setExtractedFields] = useState<null | {
    fullName: string;
    birthDate: string;
    docNumber: string;
    category: string;
  }>(null);
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];


  // Извлечение полей по жёстко заданным индексам
  const extractFieldsFromBlocks = (blocks: any[]) => {
    try {
      // Фамилия и имя (индексы из вашего примера)
      const surname = blocks[2]?.lines[1]?.text || '';
      const firstName = blocks[2]?.lines[3]?.text || '';
      const fullName = `${surname} ${firstName}`.trim();
      // Дата рождения
      const birthDate = blocks[2]?.lines[5]?.text || '';
      // Серия документа (номер)
      const docNumber = blocks[8]?.lines[0]?.text || '';
      // Категория
      const category = blocks[12]?.lines[0]?.text || '';

      return { fullName, birthDate, docNumber, category };
    } catch (error) {
      console.error('Ошибка извлечения полей:', error);
      return null;
    }
  };

  // Сохранение документа в AsyncStorage
  const saveDocument = async () => {
    if (!extractedFields) {
      Alert.alert('Ошибка', 'Нет данных для сохранения');
      return;
    }
    try {
      const existing = await AsyncStorage.getItem('drivingLicenses');
      const licenses = existing ? JSON.parse(existing) : [];
      const newLicense = {
        id: Date.now().toString(),
        ...extractedFields,
        createdAt: new Date().toISOString(),
      };
      licenses.push(newLicense);
      await AsyncStorage.setItem('drivingLicenses', JSON.stringify(licenses));
      console.log('Сохранено:', licenses);
      Alert.alert('Успех', 'Документ сохранён', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить документ');
    }
  };


  useEffect(() => {
    const recognizeText = async () => {
      if (!uri) {
        setRecognizedText('Ошибка: URI изображения отсутствует.');
        setIsLoading(false);
        return;
      }

      try {
        // Запускаем распознавание текста на устройстве
        const result = await MlkitOcr.recognizeText(uri, 'latin');
        setRecognizedText(result.text || 'Текст не найден');
        if (result.blocks) {
          const fields = extractFieldsFromBlocks(result.blocks);
          setExtractedFields(fields);
        } else {
          console.log('Нет блоков в результате');
        }
      } catch (error) {
        console.error('Ошибка распознавания:', error);
        setRecognizedText('Произошла ошибка при обработке изображения.');
      } finally {
        setIsLoading(false);
      }
    };

    recognizeText();
  }, [uri]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, { color: colors.text }]}>Распознанный текст</Text>
        <Text style={[styles.text, { color: colors.text }]}>
          {recognizedText || 'Текст не распознан.'}
        </Text>
      </ScrollView>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint, flex: 1, marginRight: 10 }]}
          onPress={saveDocument}
          disabled={!extractedFields}>
          <Text style={styles.buttonText}>Сохранить документ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint, flex: 1 }]}
          onPress={() => router.back()}>
          <Text style={styles.buttonText}>Назад к камере</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  text: { fontSize: 16, lineHeight: 24 },
    buttonRow: {
    flexDirection: 'row',
    padding: 20,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#9f9af0', fontSize: 18, fontWeight: 'bold' },
});