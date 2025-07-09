// SDK Loader - Handles dynamic loading of CipherPay SDK
let CipherPaySDK = null;
let ChainType = null;
let sdkInitialized = false;
let sdkInitPromise = null;

export async function loadSDK() {
    if (sdkInitPromise) return sdkInitPromise;

    sdkInitPromise = (async () => {
        // Check if we're in a browser environment and if the SDK should be used
        console.log('🔍 SDK Loader: Checking environment...');
        console.log('REACT_APP_USE_REAL_SDK:', process.env.REACT_APP_USE_REAL_SDK);

        if (process.env.REACT_APP_USE_REAL_SDK !== 'true') {
            console.log('❌ Real SDK disabled, using mock components');
            sdkInitialized = false;
            ChainType = { ethereum: 'ethereum', solana: 'solana' };
            return { CipherPaySDK: null, ChainType, sdkInitialized: false };
        }

        try {
            console.log('🚀 Attempting to load CipherPay SDK...');

            // Try to access the SDK from the global scope first (if loaded via script tag)
            if (window.CipherPaySDK) {
                console.log('✅ Found CipherPay SDK in global scope');
                CipherPaySDK = window.CipherPaySDK;
                ChainType = window.ChainType || { ethereum: 'ethereum', solana: 'solana' };
                sdkInitialized = true;
                console.log('🔧 CipherPaySDK constructor:', typeof CipherPaySDK);
                console.log('📦 Global SDK exports:', Object.keys(window).filter(key => key.includes('CipherPay')));
            } else {
                console.log('❌ CipherPay SDK not found in global scope');
                console.log('🔄 Falling back to mock components');
                // Set defaults for browser environment
                ChainType = { ethereum: 'ethereum', solana: 'solana' };
                sdkInitialized = false;
            }
        } catch (error) {
            console.warn('❌ Error loading CipherPay SDK:', error.message);
            console.log('🔄 Falling back to mock components');
            // Set defaults for browser environment
            ChainType = { ethereum: 'ethereum', solana: 'solana' };
            sdkInitialized = false;
        }

        return { CipherPaySDK, ChainType, sdkInitialized };
    })();

    return sdkInitPromise;
}

export function getSDKStatus() {
    console.log('📊 SDK Status:', {
        hasSDK: !!CipherPaySDK,
        hasChainType: !!ChainType,
        sdkInitialized,
        sdkType: typeof CipherPaySDK
    });
    return { CipherPaySDK, ChainType, sdkInitialized };
} 