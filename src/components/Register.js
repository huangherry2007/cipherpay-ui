import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCipherPay } from '../contexts/CipherPayContext';

function Register() {
  const navigate = useNavigate();
  const {
    isInitialized,
    isConnected,
    connectWallet,
    createDeposit,
    loading,
    error,
    clearError
  } = useCipherPay();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [registrationStep, setRegistrationStep] = useState('form'); // form, wallet, deposit, success
  const [walletConnected, setWalletConnected] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositHash, setDepositHash] = useState('');

  useEffect(() => {
    if (isConnected) {
      setWalletConnected(true);
    }
  }, [isConnected]);

  const handleTraditionalRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // TODO: Implement traditional registration logic here
    console.log('Traditional registration attempt:', username, password);
    navigate('/');
  };

  const handleWalletConnect = async () => {
    if (!isInitialized) {
      alert('CipherPay service is still initializing. Please wait...');
      return;
    }

    try {
      clearError();
      await connectWallet();
      setWalletConnected(true);
      setRegistrationStep('deposit');
    } catch (err) {
      console.error('Failed to connect wallet:', err);
    }
  };

  const handleDeposit = async (e) => {
    e.preventDefault();

    if (!walletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (Number(depositAmount) <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }

    try {
      clearError();
      setRegistrationStep('depositing');

      const txHash = await createDeposit(depositAmount);
      setDepositHash(txHash);
      setRegistrationStep('success');

      // Redirect to dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard');
      }, 3000);

    } catch (err) {
      console.error('Deposit failed:', err);
      setRegistrationStep('deposit');
    }
  };

  if (loading && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Initializing CipherPay...</h2>
            <p className="mt-2 text-sm text-gray-600">Please wait while we set up your secure environment.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create Your CipherPay Account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Join the privacy-preserving payment revolution
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traditional Registration */}
        {registrationStep === 'form' && (
          <div className="mt-8 space-y-6">
            <form className="space-y-6" onSubmit={handleTraditionalRegister}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Choose a username"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-white border-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Account
                </button>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-50 text-gray-500">Or start with</span>
              </div>
            </div>

            {/* Wallet Registration */}
            <div>
              <button
                onClick={handleWalletConnect}
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Connecting...' : 'Connect Wallet & Start'}
              </button>
            </div>

            <div className="text-center">
              <a href="/" className="font-medium text-indigo-600 hover:text-indigo-500">
                Already have an account? Sign in
              </a>
            </div>
          </div>
        )}

        {/* Deposit Step */}
        {registrationStep === 'deposit' && (
          <div className="mt-8 space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Wallet Connected!</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Your wallet has been successfully connected. Now let's make your first deposit.</p>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={handleDeposit}>
              <div>
                <label htmlFor="depositAmount" className="block text-sm font-medium text-gray-700">
                  Initial Deposit Amount (ETH)
                </label>
                <input
                  id="depositAmount"
                  name="depositAmount"
                  type="number"
                  step="0.001"
                  required
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="0.1"
                />
                <p className="mt-1 text-sm text-gray-500">
                  This will be your initial shielded balance for privacy-preserving transactions.
                </p>
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Make Deposit'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Deposit Progress */}
        {registrationStep === 'depositing' && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900">Processing Deposit</h3>
              <p className="text-gray-600">Please wait while we process your deposit...</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {registrationStep === 'success' && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Registration Successful!</h3>
              <p className="text-gray-600 mb-4">Your CipherPay account has been created and your deposit is being processed.</p>
              {depositHash && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Deposit Transaction Hash:</p>
                  <p className="text-sm font-mono text-gray-900 break-all">{depositHash}</p>
                </div>
              )}
              <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Register; 