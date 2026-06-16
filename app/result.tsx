import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  ScrollView,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MlkitOcr from 'rn-mlkit-ocr';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { saveLicense, getLicenses } from '@/app/services/licenseApi';

// Разрешённые категории (отсортированы по убыванию длины)
const ALLOWED_CATEGORIES = ['DE', 'CE', 'D1', 'C1', 'B1', 'A1', 'D', 'C', 'B', 'A', 'M', 'T'];

function isValidCategoryString(str: string): boolean {
  const clean = str.replace(/\s/g, '');
  if (clean === '') return false;

  const memo = new Map<string, boolean>();

  function canForm(s: string, used: Set<string>): boolean {
    if (s === '') return true;
    const key = s + '|' + Array.from(used).sort().join(',');
    if (memo.has(key)) return memo.get(key)!;

    for (const cat of ALLOWED_CATEGORIES) {
      if (s.startsWith(cat) && !used.has(cat)) {
        const newUsed = new Set(used);
        newUsed.add(cat);
        if (canForm(s.slice(cat.length), newUsed)) {
          memo.set(key, true);
          return true;
        }
      }
    }
    memo.set(key, false);
    return false;
  }

  return canForm(clean, new Set());
}

function extractFieldsFromText(fullText: string) {
  const lines = fullText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  const words = fullText.split(/\s+/).filter(w => w.length > 0);

  // Стоп-слова
  const stopWords = new Set([
    'RUS', 'PECA.', 'GIBDD', 'RESP.', 'BASHKORTOSTAN', 'TADZHIKISTAN', 'TATARSTAN',
    'TAAKMKMCTAH', 'PERMIS', 'DE', 'CONDUIRE', 'DRIVING', 'LICENCE',
    'BOAMTENbCKOE', 'YI0CTOBEPEHME', '5AUKOPTOCTAH', 'PERMIS DE CONDUIRE', 'DRIVING LiCENSE',
    '1.', '2', '3.', '4a)', '4b)', '4c)', '5.', '6.', '8.', '9.'
  ]);

  let fullName = '';
  let birthDate = '';
  let docNumber = '';
  let category = '';

  // --- 1. Дата рождения (исключаем 4a/b/c) ---
  const dateRegex = /\b(\d{2}\.\d{2}\.\d{4})\b/g;
  const dates = [];
  let match;
  while ((match = dateRegex.exec(fullText)) !== null) {
    dates.push({ date: match[1], index: match.index });
  }
  for (const d of dates) {
    const context = fullText.substring(Math.max(0, d.index - 30), d.index);
    if (!context.includes('4a)') && !context.includes('4b)') && !context.includes('4c)')) {
      birthDate = d.date;
      break;
    }
  }

  // --- 2. Серия документа (XX XX XXXXXX) ---
  const seriesMatch = fullText.match(/\b(\d{2}\s\d{2}\s\d{6})\b/);
  if (seriesMatch) docNumber = seriesMatch[1];

  // --- 3. Категория (с поддержкой пробелов) ---
  // Сначала ищем одиночное слово, которое валидно
  for (const w of words) {
    const clean = w.replace(/[^A-Za-z0-9]/g, '');
    if (isValidCategoryString(clean) && !stopWords.has(clean)) {
      category = clean;
      break;
    }
  }
  // Если не нашли, ищем комбинацию из двух соседних слов (с пробелом)
  if (!category) {
    for (let i = 0; i < words.length - 1; i++) {
      const combined = words[i] + ' ' + words[i+1];
      const clean = combined.replace(/[^A-Za-z0-9\s]/g, '');
      if (isValidCategoryString(clean) && !stopWords.has(clean.replace(/\s/g, ''))) {
        category = clean;
        break;
      }
    }
  }
  // Если не нашли, ищем комбинацию из двух слов (слитно)
  if (!category) {
    for (let i = 0; i < words.length - 1; i++) {
      const combined = words[i] + words[i+1];
      const clean = combined.replace(/[^A-Za-z0-9]/g, '');
      if (isValidCategoryString(clean) && !stopWords.has(clean)) {
        category = clean;
        break;
      }
    }
  }

  // --- 4. Имя и фамилия (две подряд идущие строки из букв, без цифр и стоп-слов) ---
  const nameCandidates = lines.filter(line => {
    return /^[A-Za-zА-Яа-я\s\-']+$/.test(line) &&
           !stopWords.has(line) &&
           !/^\d/.test(line) &&
           !/\d/.test(line) &&
           line.length > 1;
  });

  if (nameCandidates.length >= 2) {
    fullName = nameCandidates[0] + ' ' + nameCandidates[1];
  } else if (nameCandidates.length === 1) {
    fullName = nameCandidates[0];
  }

  // fallback: ищем после "RUS"
  if (!fullName) {
    const rusIndex = lines.findIndex(line => line === 'RUS');
    if (rusIndex !== -1) {
      const nextLines = lines.slice(rusIndex + 1, rusIndex + 5);
      const possible = nextLines.filter(line => /^[A-Za-zА-Яа-я\s\-']+$/.test(line) && !stopWords.has(line));
      if (possible.length >= 2) fullName = possible[0] + ' ' + possible[1];
      else if (possible.length === 1) fullName = possible[0];
    }
  }

  return { fullName, birthDate, docNumber, category };
}

export default function ResultScreen() {
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
	    await saveLicense(extractedFields);
      Alert.alert('Успех', 'Документ сохранён', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить документ');
    }
  };

  useEffect(() => {
    const recognize = async () => {
      if (!uri) {
        setRecognizedText('Ошибка: URI изображения отсутствует.');
        setIsLoading(false);
        return;
      }
      try {
        const result = await MlkitOcr.recognizeText(uri, 'latin');
        setRecognizedText(result.text || 'Текст не найден');
        const fields = extractFieldsFromText(result.text);
        setExtractedFields(fields);
      } catch (error) {
        console.log('Ошибка распознавания:', error);
        setRecognizedText('Произошла ошибка при обработке изображения.');
      } finally {
        setIsLoading(false);
      }
    };
    recognize();
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
          <Text style={[styles.buttonText, { color: '#000' }]}>Сохранить документ</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint, flex: 1 }]}
          onPress={() => router.back()}>
          <Text style={[styles.buttonText, { color: '#000' }]}>Назад к камере</Text>
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
  buttonRow: { flexDirection: 'row', padding: 20 },
  button: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { fontSize: 18, fontWeight: 'bold' },
});