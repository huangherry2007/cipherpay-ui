# CipherPay Services

This directory contains the service layer for the CipherPay UI, with a flexible service selection mechanism.

## Service Files

### `CipherPayService.js` - Production Service
- **Purpose**: Full integration with the real CipherPay SDK
- **Use Case**: Production environments, real blockchain interactions
- **Features**: 
  - Real Solana blockchain integration
  - Actual wallet connections and transactions
  - ZK proof generation and verification
  - Event monitoring and compliance

### `FallbackCipherPayService.js` - Development Service
- **Purpose**: Mock implementations for development and testing
- **Use Case**: Development, testing, when SDK is unavailable
- **Features**:
  - Mock wallet provider with test addresses
  - Mock note management with sample data
  - Mock ZK proof generation and verification
  - Graceful degradation when real SDK fails

### `index.js` - Service Selection
- **Purpose**: Automatically selects the appropriate service based on environment variables
- **Logic**: 
  - Uses `CipherPayService` when `REACT_APP_USE_REAL_SDK=true`
  - Uses `FallbackCipherPayService` when `REACT_APP_USE_FALLBACK_SERVICE=true`
  - Defaults to `FallbackCipherPayService` if no environment variables are set

## Environment Variables

### For Production (Real SDK)
```bash
REACT_APP_USE_REAL_SDK=true
REACT_APP_USE_FALLBACK_SERVICE=false  # Optional, defaults to false
```

### For Development (Fallback Service)
```bash
REACT_APP_USE_FALLBACK_SERVICE=true
REACT_APP_USE_REAL_SDK=false  # Optional, defaults to false
```

### For Auto-Selection (Recommended)
```bash
# Let the service selection mechanism decide based on SDK availability
# No environment variables needed - will use fallback by default
```

## Usage

### In Components
```javascript
import cipherPayService from '../services';

// The service is automatically selected based on environment variables
await cipherPayService.initialize();
```

### Direct Import (Advanced)
```javascript
import { CipherPayService, FallbackCipherPayService } from '../services';

// Create specific service instances if needed
const realService = new CipherPayService();
const fallbackService = new FallbackCipherPayService();
```

## Service Selection Logic

1. **Check `REACT_APP_USE_FALLBACK_SERVICE`**: If `true`, use `FallbackCipherPayService`
2. **Check `REACT_APP_USE_REAL_SDK`**: If `true`, use `CipherPayService`
3. **Default**: Use `FallbackCipherPayService` for safety

This ensures that:
- Development can continue even if the SDK is not available
- Production can use the real SDK when available
- The system gracefully degrades when needed
- Clear separation of concerns between real and mock implementations 