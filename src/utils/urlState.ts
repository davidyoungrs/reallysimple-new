import { type CardData, initialCardData } from '../types';

/**
 * Encodes the card data into a base64 string
 */
export const encodeCardData = (data: CardData): string => {
    try {
        const jsonString = JSON.stringify(data);
        return btoa(encodeURIComponent(jsonString));
    } catch (e) {
        console.error('Failed to encode card data:', e);
        return '';
    }
};

/**
 * Decodes the card data from a base64 string
 */
export const decodeCardData = (encoded: string): CardData | null => {
    try {
        const jsonString = decodeURIComponent(atob(encoded));
        const parsed = JSON.parse(jsonString);

        // Basic validation - ensure at least socialLinks array exists
        if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.socialLinks)) {
            return null;
        }

        // Merge with initial data to ensure all fields exist (migrations)
        return { ...initialCardData, ...parsed };
    } catch (e) {
        console.error('Failed to decode card data:', e);
        return null;
    }
};

/**
 * Saves the current state to the URL query parameters
 */
export const saveToUrl = (data: CardData) => {
    try {
        const encoded = encodeCardData(data);
        const newUrl = `${window.location.pathname}?data=${encoded}`;
        window.history.replaceState({ path: newUrl }, '', newUrl);
        // If successful, clear the fallback to avoid conflicts
        localStorage.removeItem('cardData_fallback');
    } catch (e) {
        console.warn('Failed to save state to URL. Data might be too large. Falling back to local storage.', e);
        try {
            // Self-healing: Save to local storage
            localStorage.setItem('cardData_fallback', JSON.stringify(data));
            // Update URL to remove stale data (since we are now relying on local storage)
            const cleanUrl = window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        } catch (err) {
            console.error('Critical: Failed to save to local storage fallback.', err);
        }
    }
};

/**
 * Loads the state from the URL query parameters
 */
export const loadFromUrl = (): CardData | null => {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get('data');
    if (encoded) {
        return decodeCardData(encoded);
    }

    // Fallback: Check local storage
    try {
        const local = localStorage.getItem('cardData_fallback');
        if (local) {
            console.info('Recovered state from local storage fallback.');
            const parsed = JSON.parse(local);
            // Basic validation - ensure at least socialLinks array exists
            if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.socialLinks)) {
                return null;
            }
            // Merge with initial data
            return { ...initialCardData, ...parsed };
        }
    } catch (e) {
        console.error('Failed to load from local storage fallback:', e);
    }

    return null;
};
