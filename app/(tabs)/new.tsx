import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NewScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const colors = Colors[colorScheme];

  const [cameraOpen, setCameraOpen] = useState(false);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

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

  const handleUse = () => {
    console.log('handleUse запустился!')
    if (capturedUri) {
      router.push({ pathname: '/result', params: { uri: capturedUri } });
    }
  };

  const handleClose = () => {
    setCameraOpen(false);
    setCapturedUri(null);
  };

  return (
    <>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
          <IconSymbol size={310} color="#808080" name="plus.circle.fill" style={styles.headerImage} />
        }>
        <SafeAreaView edges={[]}>
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
              New Scan
            </ThemedText>
          </ThemedView>
          <ThemedText style={{ color: colors.icon }}>
            Choose what you&apos;d like to scan or create.
          </ThemedText>

          <View style={styles.options}>
            <TouchableOpacity
              style={[styles.optionCard, { borderColor: colors.icon + '33', backgroundColor: colors.tint + '11' }]}
              onPress={async () => {
              if (!permission?.granted) {
                const { granted } = await requestPermission();
                if (!granted) {
                  Alert.alert('Camera Access Required', 'Please allow camera access in Settings to scan documents.');
                  return;
                }
              }
              setCameraOpen(true);
            }}>
              <IconSymbol name="doc.text.viewfinder" size={32} color={colors.tint} />
              <ThemedText style={[styles.optionLabel, { fontFamily: Fonts.rounded }]}>
                Scan Document
              </ThemedText>
              <ThemedText style={[styles.optionSub, { color: colors.icon }]}>
                Capture a physical document
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.optionCard, { borderColor: colors.icon + '33', backgroundColor: colors.tint + '11' }]}>
              <IconSymbol name="photo.badge.plus" size={32} color={colors.tint} />
              <ThemedText style={[styles.optionLabel, { fontFamily: Fonts.rounded }]}>
                Import from Photos
              </ThemedText>
              <ThemedText style={[styles.optionSub, { color: colors.icon }]}>
                Pick an image from your library
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ParallaxScrollView>

      <Modal visible={cameraOpen} animationType="slide" statusBarTranslucent>
        {capturedUri ? (
          /* Preview captured photo */
          <View style={styles.cameraContainer}>
            <Image source={{ uri: capturedUri }} style={styles.preview} resizeMode="contain" />
            <SafeAreaView edges={['bottom']} style={styles.previewActions}>
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.tint, borderWidth: 1.5 }]}
                onPress={() => setCapturedUri(null)}>
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
        ) : (
          /* Live camera */
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back">
              <View style={styles.frameGuide}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
              </View>
            </CameraView>
            <SafeAreaView edges={['top', 'bottom']} style={styles.controls} pointerEvents="box-none">
              <TouchableOpacity style={styles.closeButton} onPress={handleUse}>
                <IconSymbol name="xmark" size={22} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.hint}>Align document within the frame</Text>
              <TouchableOpacity
                style={[styles.captureButton, capturing && styles.captureButtonDisabled]}
                onPress={handleCapture}
                disabled={capturing}>
                {capturing
                  ? <ActivityIndicator color="#fff" />
                  : <View style={styles.captureInner} />}
              </TouchableOpacity>
            </SafeAreaView>
          </View>
        )}
      </Modal>
    </>
  );
}

const CORNER = 28;
const BORDER = 3;

const styles = StyleSheet.create({
  headerImage: { color: '#808080', bottom: -90, left: -35, position: 'absolute' },
  titleContainer: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  options: { marginTop: 16, gap: 12 },
  optionCard: { padding: 20, borderRadius: 16, borderWidth: 1, gap: 6 },
  optionLabel: { fontSize: 16, fontWeight: '700' },
  optionSub: { fontSize: 13 },

  // Camera modal
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },

  frameGuide: { position: 'absolute', top: '15%', left: '8%', right: '8%', bottom: '20%' },
  corner: { position: 'absolute', width: CORNER, height: CORNER, borderColor: '#fff' },
  topLeft: { top: 0, left: 0, borderTopWidth: BORDER, borderLeftWidth: BORDER },
  topRight: { top: 0, right: 0, borderTopWidth: BORDER, borderRightWidth: BORDER },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: BORDER, borderLeftWidth: BORDER },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: BORDER, borderRightWidth: BORDER },

  controls: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 8, paddingBottom: 32,
  },
  closeButton: {
    alignSelf: 'flex-start', marginLeft: 20, padding: 10,
    backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 24,
  },
  hint: {
    color: 'rgba(255,255,255,0.8)', fontSize: 13,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  captureButton: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
  },
  captureButtonDisabled: { opacity: 0.5 },
  captureInner: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#fff' },

  preview: { flex: 1, backgroundColor: '#000' },
  previewActions: { flexDirection: 'row', gap: 12, padding: 20, backgroundColor: '#000' },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, paddingVertical: 14, borderRadius: 14,
  },
  actionLabel: { fontSize: 15, fontWeight: '600' },

});
