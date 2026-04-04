import * as Localization from "expo-localization";

// -------------------------------
// Localization & Locale Info
// -------------------------------

export type LocaleInfo = {
    localeTag?: string;
    uses24h: boolean;
    timeZone?: string;
};

/**
 * Get the device's primary locale language tag
 */
export const getDeviceLocale = (): string => {
    return Localization.getLocales()[0].languageTag!;
};

/**
 * Get the device's timezone
 */
export const getDeviceTimeZone = (): string => {
    return Localization.getCalendars()[0].timeZone!;
};

/**
 * Check if device uses 24-hour clock
 */
export const uses24HourClock = (): boolean => {
    return Localization.getCalendars()[0].uses24hourClock!;
};

/**
 * Get comprehensive locale information
 */
export const getLocaleInfo = (): LocaleInfo => {
    try {
        const locales = Localization.getLocales?.() ?? [];
        const calendars = Localization.getCalendars?.() ?? [];
        const locale = locales[0];
        const calendar = calendars[0];
        return {
            localeTag: locale?.languageTag,
            uses24h: calendar?.uses24hourClock ?? true,
            timeZone: calendar?.timeZone ?? undefined,
        };
    } catch {
        return {
            uses24h: true,
        };
    }
};
