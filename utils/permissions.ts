import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { Asset, useAssets } from "expo-asset";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import { Platform } from "react-native";
import uuid from "react-native-uuid";

// Helpers

const STORAGE_KEYS = {
    device_id: "device_id",
} as const;

async function getString(
    key: keyof typeof STORAGE_KEYS,
): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(key);
    } catch (error) {
        console.error(`Error getting ${key} from storage:`, error);
        return null;
    }
}

async function setString(
    key: keyof typeof STORAGE_KEYS,
    value: string,
): Promise<void> {
    try {
        await AsyncStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error setting ${key} in storage:`, error);
    }
}

// Device

const getUserTrackingPermission = async (): Promise<boolean> => {
    try {
        const { status } = await requestTrackingPermissionsAsync();
        return status === "granted";
    } catch (error) {
        console.error("Error requesting tracking permission:", error);
        return false;
    }
};

const getDeviceId = async (): Promise<string> => {
    let deviceId = await getString(STORAGE_KEYS.device_id);

    if (!deviceId) {
        try {
            if (Platform.OS === "ios") {
                const iosId = await Application.getIosIdForVendorAsync();
                deviceId = iosId || uuid.v4().toString();
            } else {
                deviceId = Application.getAndroidId() || uuid.v4().toString();
            }
            await setString(STORAGE_KEYS.device_id, deviceId);
        } catch (error) {
            console.error("Error generating device ID:", error);
            // Fallback to UUID if all else fails
            deviceId = uuid.v4().toString();
            await setString(STORAGE_KEYS.device_id, deviceId);
        }
    }

    return deviceId;
};

// Local assets

function useLoadAssets(assetModules: number[]): Asset[] | null {
    const [assets, error] = useAssets(assetModules);

    if (error) {
        console.error("Error loading assets:", error);
        return null;
    }

    return assets || null;
}

export { getDeviceId, getUserTrackingPermission, useLoadAssets };

