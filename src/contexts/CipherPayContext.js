import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import cipherPayService from '../services/CipherPayService';

const CipherPayContext = createContext();

export const useCipherPay = () => {
    const context = useContext(CipherPayContext);
    if (!context) {
        throw new Error('useCipherPay must be used within a CipherPayProvider');
    }
    return context;
};

export const CipherPayProvider = ({ children }) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [publicAddress, setPublicAddress] = useState(null);
    const [balance, setBalance] = useState(0);
    const [spendableNotes, setSpendableNotes] = useState([]);
    const [allNotes, setAllNotes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize the service
    useEffect(() => {
        const initializeService = async () => {
            try {
                setLoading(true);
                setError(null);
                await cipherPayService.initialize();
                setIsInitialized(true);
                updateServiceStatus();
            } catch (err) {
                setError(err.message);
                console.error('Failed to initialize CipherPay service:', err);
            } finally {
                setLoading(false);
            }
        };

        initializeService();
    }, []);

    const updateServiceStatus = () => {
        if (!cipherPayService.isInitialized) return;

        const status = cipherPayService.getServiceStatus();
        setIsInitialized(status.isInitialized);
        setIsConnected(status.isConnected);
        setPublicAddress(status.publicAddress);
        setBalance(status.balance);
        setSpendableNotes(cipherPayService.getSpendableNotes());
        setAllNotes(cipherPayService.getAllNotes());
    };

    // Wallet Management
    const connectWallet = async () => {
        try {
            setLoading(true);
            setError(null);
            const address = await cipherPayService.connectWallet();
            setPublicAddress(address);
            setIsConnected(true);
            updateServiceStatus();
            return address;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const disconnectWallet = async () => {
        try {
            setLoading(true);
            setError(null);
            await cipherPayService.disconnectWallet();
            setIsConnected(false);
            setPublicAddress(null);
            updateServiceStatus();
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Transaction Management
    const createTransaction = async (recipientPublicKey, amount) => {
        try {
            setLoading(true);
            setError(null);
            const transaction = await cipherPayService.createTransaction(recipientPublicKey, amount);
            return transaction;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const sendTransaction = async (transaction) => {
        try {
            setLoading(true);
            setError(null);
            const receipt = await cipherPayService.sendTransaction(transaction);
            updateServiceStatus(); // Refresh balance and notes
            return receipt;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const checkTransactionStatus = async (txHash) => {
        try {
            setError(null);
            return await cipherPayService.checkTransactionStatus(txHash);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Deposit Management
    const createDeposit = async (amount) => {
        try {
            setLoading(true);
            setError(null);
            const txHash = await cipherPayService.createDeposit(amount);
            updateServiceStatus(); // Refresh balance and notes
            return txHash;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Proof Management
    const generateProof = async (input) => {
        try {
            setLoading(true);
            setError(null);
            const proof = await cipherPayService.generateProof(input);
            return proof;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verifyProof = async (proof, publicSignals, verifierKey) => {
        try {
            setError(null);
            return await cipherPayService.verifyProof(proof, publicSignals, verifierKey);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // View Key Management
    const exportViewKey = () => {
        try {
            setError(null);
            return cipherPayService.exportViewKey();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const generateProofOfPayment = (note) => {
        try {
            setError(null);
            return cipherPayService.generateProofOfPayment(note);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const verifyProofOfPayment = (proof, note, viewKey) => {
        try {
            setError(null);
            return cipherPayService.verifyProofOfPayment(proof, note, viewKey);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Merkle Tree Operations
    const fetchMerkleRoot = async () => {
        try {
            setError(null);
            return await cipherPayService.fetchMerkleRoot();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const getMerklePath = async (commitment) => {
        try {
            setError(null);
            return await cipherPayService.getMerklePath(commitment);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    // Utility functions
    const refreshData = useCallback(() => {
        updateServiceStatus();
    }, []);

    const clearError = () => {
        setError(null);
    };

    const value = {
        // State
        isInitialized,
        isConnected,
        publicAddress,
        balance,
        spendableNotes,
        allNotes,
        loading,
        error,

        // Wallet Management
        connectWallet,
        disconnectWallet,

        // Transaction Management
        createTransaction,
        sendTransaction,
        checkTransactionStatus,

        // Deposit Management
        createDeposit,

        // Proof Management
        generateProof,
        verifyProof,

        // View Key Management
        exportViewKey,
        generateProofOfPayment,
        verifyProofOfPayment,

        // Merkle Tree Operations
        fetchMerkleRoot,
        getMerklePath,

        // Utility
        refreshData,
        clearError
    };

    return (
        <CipherPayContext.Provider value={value}>
            {children}
        </CipherPayContext.Provider>
    );
}; 