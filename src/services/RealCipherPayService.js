import {
    CipherPaySDK,
    ChainType,
    ShieldedNote,
    ZKProof
} from '@cipherpay/sdk';

class RealCipherPayService {
    constructor() {
        this.sdk = null;
        this.isInitialized = false;
        this.config = {
            chainType: ChainType.EVM, // Default to EVM, can be changed
            rpcUrl: process.env.REACT_APP_RPC_URL || 'http://127.0.0.1:8899',
            relayerUrl: process.env.REACT_APP_RELAYER_URL || 'http://localhost:3000',
            relayerApiKey: process.env.REACT_APP_RELAYER_API_KEY,
            contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
            enableCompliance: true,
            enableCaching: true,
            enableStealthAddresses: true,
            cacheConfig: {
                maxSize: 1000,
                defaultTTL: 300000 // 5 minutes
            },
            // Add authentication configuration for relayer
            auth: {
                email: process.env.REACT_APP_RELAYER_EMAIL,
                password: process.env.REACT_APP_RELAYER_PASSWORD,
                apiKey: process.env.REACT_APP_RELAYER_API_KEY
            }
        };
    }

    async initialize() {
        try {
            console.log('Initializing CipherPay SDK...');

            // Configure circuit files for browser compatibility
            const circuitConfig = {
                transfer: {
                    wasmUrl: process.env.REACT_APP_TRANSFER_WASM_URL || '/circuits/transfer.wasm',
                    zkeyUrl: process.env.REACT_APP_TRANSFER_ZKEY_URL || '/circuits/transfer.zkey',
                    verificationKeyUrl: process.env.REACT_APP_TRANSFER_VKEY_URL || '/circuits/transfer.vkey.json'
                },
                merkle: {
                    wasmUrl: process.env.REACT_APP_MERKLE_WASM_URL || '/circuits/merkle.wasm',
                    zkeyUrl: process.env.REACT_APP_MERKLE_ZKEY_URL || '/circuits/merkle.zkey',
                    verificationKeyUrl: process.env.REACT_APP_MERKLE_VKEY_URL || '/circuits/merkle.vkey.json'
                }
            };

            // Initialize the SDK with configuration
            this.sdk = new CipherPaySDK({
                ...this.config,
                circuitConfig
            });

            // Start event monitoring
            await this.sdk.startEventMonitoring();

            this.isInitialized = true;
            console.log('CipherPay SDK initialized successfully');
        } catch (error) {
            console.error('Failed to initialize CipherPay SDK:', error);
            throw error;
        }
    }

    // Wallet Management
    async connectWallet() {
        if (!this.isInitialized) await this.initialize();

        try {
            // Connect to wallet through the SDK
            await this.sdk.walletProvider.connect();
            return this.sdk.walletProvider.getPublicAddress();
        } catch (error) {
            console.error('Failed to connect wallet:', error);
            throw error;
        }
    }

    async disconnectWallet() {
        if (this.sdk?.walletProvider) {
            try {
                await this.sdk.walletProvider.disconnect();
            } catch (error) {
                console.error('Failed to disconnect wallet:', error);
                throw error;
            }
        }
    }

    getPublicAddress() {
        return this.sdk?.walletProvider?.getPublicAddress() || null;
    }

    // Note Management
    getSpendableNotes() {
        return this.sdk?.getSpendableNotes() || [];
    }

    async getAllNotes() {
        if (!this.isInitialized) await this.initialize();
        try {
            return await this.sdk.getNotes();
        } catch (error) {
            console.error('Failed to get notes from SDK:', error);
            return [];
        }
    }

    getBalance() {
        return this.sdk?.getBalance() || 0n;
    }

    addNote(note) {
        if (this.sdk?.noteManager) {
            this.sdk.noteManager.addNote(note);
        }
    }

    // Transaction Management
    async createTransaction(recipientPublicKey, amount) {
        if (!this.isInitialized) await this.initialize();

        try {
            // Use the SDK's transfer method
            const transferRequest = {
                amount: BigInt(amount),
                recipientAddress: recipientPublicKey,
                stealthAddress: true,
                complianceCheck: true,
                metadata: {
                    timestamp: Date.now(),
                    source: 'cipherpay-ui'
                }
            };

            const result = await this.sdk.transfer(transferRequest);

            if (!result.success) {
                throw new Error(result.error || 'Transfer failed');
            }

            return {
                recipient: recipientPublicKey,
                amount: amount,
                timestamp: Date.now(),
                id: result.txHash,
                stealthAddress: result.stealthAddress,
                proof: result.proof,
                complianceStatus: result.complianceStatus
            };
        } catch (error) {
            console.error('Failed to create transaction:', error);
            throw error;
        }
    }

    async sendTransaction(transaction) {
        if (!this.isInitialized) await this.initialize();

        try {
            // The transaction is already sent when created via SDK
            // This method is kept for compatibility with the UI
            return {
                txHash: transaction.id,
                status: 'success'
            };
        } catch (error) {
            console.error('Failed to send transaction:', error);
            throw error;
        }
    }

    async checkTransactionStatus(txHash) {
        if (!this.isInitialized) await this.initialize();

        try {
            return await this.sdk.relayerClient.checkTxStatus(txHash);
        } catch (error) {
            console.error('Failed to check transaction status:', error);
            throw error;
        }
    }

    // Deposit Management
    async createDeposit(amount) {
        if (!this.isInitialized) await this.initialize();

        try {
            const txHash = await this.sdk.walletProvider.signAndSendDepositTx(
                this.getPublicAddress(),
                amount.toString()
            );
            return txHash;
        } catch (error) {
            console.error('Failed to create deposit:', error);
            throw error;
        }
    }

    // Proof Management
    async generateProof(input) {
        if (!this.isInitialized) await this.initialize();

        try {
            const proof = await this.sdk.zkProver.generateTransferProof(input);
            return proof;
        } catch (error) {
            console.error('Failed to generate proof:', error);
            throw error;
        }
    }

    async verifyProof(proof, publicSignals, verifierKey) {
        if (!this.isInitialized) await this.initialize();

        try {
            return await this.sdk.zkProver.verifyProof(proof, publicSignals, verifierKey);
        } catch (error) {
            console.error('Failed to verify proof:', error);
            throw error;
        }
    }

    // View Key Management
    exportViewKey() {
        return this.sdk?.viewKeyManager?.exportViewKey() || null;
    }

    generateProofOfPayment(note) {
        return this.sdk?.viewKeyManager?.generateProofOfPayment(note) || null;
    }

    verifyProofOfPayment(proof, note, viewKey) {
        return this.sdk?.viewKeyManager?.verifyProofOfPayment(proof, note, viewKey) || false;
    }

    // Merkle Tree Operations
    async fetchMerkleRoot() {
        if (!this.isInitialized) await this.initialize();

        try {
            return await this.sdk.merkleTreeClient.fetchMerkleRoot();
        } catch (error) {
            console.error('Failed to fetch Merkle root:', error);
            throw error;
        }
    }

    async getMerklePath(commitment) {
        if (!this.isInitialized) await this.initialize();

        try {
            return await this.sdk.merkleTreeClient.getMerklePath(commitment);
        } catch (error) {
            console.error('Failed to get Merkle path:', error);
            throw error;
        }
    }

    // Withdrawal Management
    async withdraw(amount, recipientAddress) {
        if (!this.isInitialized) await this.initialize();

        try {
            const withdrawRequest = {
                amount: BigInt(amount),
                recipientAddress: recipientAddress,
                complianceCheck: true,
                metadata: {
                    timestamp: Date.now(),
                    source: 'cipherpay-ui'
                }
            };

            const result = await this.sdk.withdraw(withdrawRequest);

            if (!result.success) {
                throw new Error(result.error || 'Withdrawal failed');
            }

            return {
                txHash: result.txHash,
                proof: result.proof,
                complianceStatus: result.complianceStatus
            };
        } catch (error) {
            console.error('Failed to withdraw:', error);
            throw error;
        }
    }

    // Compliance Management
    async generateComplianceReport(startTime, endTime) {
        if (!this.isInitialized) await this.initialize();

        try {
            return this.sdk.generateComplianceReport(startTime, endTime);
        } catch (error) {
            console.error('Failed to generate compliance report:', error);
            throw error;
        }
    }

    // Cache Management
    getCacheStats() {
        if (!this.isInitialized) return null;
        return this.sdk.getCacheStats();
    }

    // Utility Methods
    isConnected() {
        return this.sdk?.walletProvider && this.getPublicAddress() !== null;
    }

    async getServiceStatus() {
        const allNotes = await this.getAllNotes();
        return {
            isInitialized: this.isInitialized,
            isConnected: this.isConnected(),
            publicAddress: this.getPublicAddress(),
            balance: this.getBalance(),
            spendableNotes: this.getSpendableNotes().length,
            totalNotes: allNotes.length,
            cacheStats: this.getCacheStats(),
            chainType: this.config.chainType
        };
    }

    // Configuration Management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('Configuration updated:', this.config);
    }

    // Cleanup
    async destroy() {
        if (this.sdk) {
            try {
                this.sdk.stopEventMonitoring();
                this.sdk.destroy();
                this.sdk = null;
                this.isInitialized = false;
                console.log('CipherPay SDK destroyed successfully');
            } catch (error) {
                console.error('Failed to destroy SDK:', error);
            }
        }
    }
}

// Create a singleton instance
const realCipherPayService = new RealCipherPayService();

export default realCipherPayService; 