import { router, useLocalSearchParams } from 'expo-router';
import * as TextRecognition from 'expo-text-recognition';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ResultScreen() {
  // Получаем параметр uri из навигации
  const { uri } = useLocalSearchParams<{ uri: string }>();
  const [recognizedText, setRecognizedText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    const recognizeText = async () => {
      if (!uri) {
        setRecognizedText('Ошибка: URI изображения отсутствует.');
        setIsLoading(false);
        return;
      }

      try {
        // Запускаем распознавание текста на устройстве
        const result = await TextRecognition.recognizeText(uri);
        if (result && result.text) {
          setRecognizedText(result.text);
        } else {
          setRecognizedText('Текст на изображении не найден.');
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
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Распознавание текста...</Text>
          </View>
        ) : (
          <View style={styles.resultContent}>
            <Text style={[styles.title, { color: colors.text }]}>Распознанный текст</Text>
            <Text style={[styles.text, { color: colors.text }]}>
              {recognizedText || 'Текст не распознан.'}
            </Text>
          </View>
        )}
      </ScrollView>
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Назад к камере</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 20 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultContent: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  text: { fontSize: 16, lineHeight: 24 },
  loadingText: { marginTop: 12, fontSize: 16 },
  button: { margin: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});