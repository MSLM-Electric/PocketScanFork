import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { getLicenses, saveLicense, setBaseUrl } from './services/licenseApi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ServerPage() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [ipAddress, setIpAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Загружаем сохранённый IP при открытии страницы
  useEffect(() => {
    const loadIp = async () => {
      const saved = await AsyncStorage.getItem('serverIp');
      if (saved) {
        setIpAddress(saved);
        setBaseUrl(saved); // применяем к API-клиенту
        setStatus('✅ Загружен IP из памяти');
      }
    };
    loadIp();
  }, []);

  // Сохраняем IP и применяем его для API
  const saveIp = async () => {
    if (!ipAddress.trim()) {
      Alert.alert('Ошибка', 'Введите IP-адрес');
      return;
    }
    await AsyncStorage.setItem('serverIp', ipAddress.trim());
    setBaseUrl(ipAddress.trim());
    setStatus('✅ IP сохранён и применён');
  };

  // Проверка соединения
  const testConnection = async () => {
    setLoading(true);
    setStatus('⏳ Проверка соединения...');
    try {
      const data = await getLicenses(); // GET-запрос
      setStatus(`✅ Соединение установлено. Получено записей: ${data.length}`);
    } catch (error) {
      console.error(error);
      setStatus('❌ Ошибка соединения. Проверьте IP и запущен ли сервер.');
    } finally {
      setLoading(false);
    }
  };

  // Синхронизация: отправка локальных данных на сервер
  const syncToServer = async () => {
    setLoading(true);
    setStatus('⏳ Синхронизация...');
    try {
      const localData = await AsyncStorage.getItem('drivingLicenses');
      const licenses = localData ? JSON.parse(localData) : [];
      if (licenses.length === 0) {
        setStatus('⚠️ Нет локальных данных для отправки');
        setLoading(false);
        return;
      }
      // Отправляем каждую запись на сервер
      for (const item of licenses) {
        await saveLicense({
          full_name: item.fullName,
          birth_date: item.birthDate,
          doc_number: item.docNumber,
          category: item.category,
        });
      }
      setStatus(`✅ Отправлено ${licenses.length} записей на сервер`);
    } catch (error) {
      console.error(error);
      setStatus('❌ Ошибка синхронизации');
    } finally {
      setLoading(false);
    }
  };

  // Загрузка данных с сервера и обновление локального хранилища
  const loadFromServer = async () => {
    setLoading(true);
    setStatus('⏳ Загрузка с сервера...');
    try {
      const serverData = await getLicenses();
      if (!serverData || serverData.length === 0) {
        setStatus('ℹ️ На сервере нет данных');
        setLoading(false);
        return;
      }
      // Преобразуем серверные данные (snake_case) в формат для локального хранилища
      const formatted = serverData.map((item: any) => ({
        id: String(item.id),
        fullName: item.full_name,
        birthDate: item.birth_date,
        docNumber: item.doc_number,
        category: item.category,
        createdAt: item.created_at,
      }));
      await AsyncStorage.setItem('drivingLicenses', JSON.stringify(formatted));
      setStatus(`✅ Загружено ${formatted.length} записей с сервера`);
    } catch (error) {
      console.error(error);
      setStatus('❌ Ошибка загрузки с сервера');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Настройка сервера</Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>IP-адрес сервера:</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.icon, color: colors.text }]}
          placeholder="192.168.1.100"
          placeholderTextColor={colors.icon}
          value={ipAddress}
          onChangeText={setIpAddress}
        />
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.tint }]} onPress={saveIp}>
          <Text style={styles.buttonText}>Сохранить IP</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={testConnection}
          disabled={loading}>
          <Text style={styles.buttonText}>Проверить соединение</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={syncToServer}
          disabled={loading}>
          <Text style={styles.buttonText}>Синхронизировать → сервер</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={loadFromServer}
          disabled={loading}>
          <Text style={styles.buttonText}>Загрузить с сервера</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color={colors.tint} style={{ marginTop: 20 }} />}

      {status ? (
        <Text style={[styles.status, { color: colors.text }]}>{status}</Text>
      ) : null}

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={[styles.backText, { color: colors.tint }]}>← Назад</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  actions: { gap: 12, marginBottom: 20 },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#9c86f5', fontSize: 16, fontWeight: 'bold' },
  status: { fontSize: 16, marginTop: 16, textAlign: 'center' },
  backButton: { marginTop: 20, alignSelf: 'center' },
  backText: { fontSize: 16, fontWeight: '600' },
});