import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Alert } from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const handleCapture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo) setCapturedUri(photo.uri);
    } finally {
      setCapturing(false);
    }
  };

  const handleRetake = () => setCapturedUri(null);

  const handleUse = () => {
    console.log('handleUse started...');
    Alert.alert('DEBUG', 'Кнопка нажата');
  if (capturedUri) {
    router.push({ pathname: '/result', params: { uri: capturedUri } });
  } else {
    Alert.alert('Ошибка', 'capturedUri = null');
  }
  };

  // Permission not yet determined
  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Permission denied — show prompt
  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.centered, { backgroundColor: colors.background }]}>
        <IconSymbol name="camera.fill" size={48} color={colors.tint} />
        <Text style={[styles.permissionTitle, { color: colors.text }]}>
          Camera Access Required
        </Text>
        <Text style={[styles.permissionSub, { color: colors.icon }]}>
          PocketScan needs camera access to scan documents.
        </Text>
        <TouchableOpacity
          style={[styles.grantButton, { backgroundColor: colors.tint }]}
          onPress={requestPermission}>
          <Text style={styles.grantButtonText}>Grant Permission</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
          <Text style={[styles.cancelText, { color: colors.icon }]}>Cancel</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Preview captured photo
  if (capturedUri) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
        <SafeAreaView edges={['bottom']} style={styles.previewActions}>
          <TouchableOpacity
            style={[styles.actionButton, { borderColor: colors.tint }]}
            onPress={handleRetake}>
            <IconSymbol name="arrow.counterclockwise" size={20} color={colors.tint} />
            <Text style={[styles.actionLabel, { color: colors.tint }]}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.tint }]}
            onPress={handleUse}>
            <IconSymbol name="checkmark" size={20} color="#fff" />
            <Text style={[styles.actionLabel, { color: '#fff' }]}>Use Document</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  // Live camera view
  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back">
        {/* Document frame guide */}
        <View style={styles.frameGuide}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
      </CameraView>

      <SafeAreaView edges={['bottom', 'top']} style={styles.controls}>
        <TouchableOpacity style={styles.closeButton} onPress={() => router.back()}>
          <IconSymbol name="xmark" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.hint}>Align document within the frame</Text>
        <TouchableOpacity
          style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
          onPress={handleCapture}
          disabled={capturing}>
          {capturing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.captureInner} />
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
const CORNER_COLOR = '#fff';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 },
  camera: { flex: 1 },

  // Frame guide overlay
  frameGuide: {
    position: 'absolute',
    top: '15%',
    left: '8%',
    right: '8%',
    bottom: '20%',
  },
  corner: {
    position: 'absolute',
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: CORNER_COLOR,
  },
  topLeft: { top: 0, left: 0, borderTopWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  topRight: { top: 0, right: 0, borderTopWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: CORNER_THICKNESS, borderLeftWidth: CORNER_THICKNESS },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: CORNER_THICKNESS, borderRightWidth: CORNER_THICKNESS },

  // Controls overlay
  controls: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 32,
    pointerEvents: 'box-none',
  },
  closeButton: {
    alignSelf: 'flex-start',
    marginLeft: 20,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 24,
  },
  hint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButtonDisabled: { opacity: 0.5 },
  captureInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#fff',
  },

  // Preview
  preview: { flex: 1, backgroundColor: '#000' },
  previewActions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    backgroundColor: '#000',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  actionLabel: { fontSize: 15, fontWeight: '600' },

  // Permission screen
  permissionTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center' },
  permissionSub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  grantButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 8,
  },
  grantButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { marginTop: 4 },
  cancelText: { fontSize: 14 },
});
