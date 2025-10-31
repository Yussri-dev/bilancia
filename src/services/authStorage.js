import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = '@bilancia_token';

/**
 * Save the JWT token securely.
 * @param {string} token
 */
export const saveToken = async (token) => {
    try {
        if (token) {
            await AsyncStorage.setItem(TOKEN_KEY, token);
        } else {
            console.warn('Attempted to save an empty token');
        }
    } catch (error) {
        console.error('Error saving token:', error);
    }
};

/**
 * Retrieve the saved JWT token.
 * @returns {Promise<string|null>}
 */
export const getToken = async () => {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error retrieving token:', error);
        return null;
    }
};

/**
 * Remove the JWT token (used on logout).
 */
export const removeToken = async () => {
    try {
        await AsyncStorage.removeItem(TOKEN_KEY);
    } catch (error) {
        console.error('Error removing token:', error);
    }
};
