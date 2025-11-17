'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLock, 
  FiEye, 
  FiEyeOff, 
  FiCheck, 
  FiX, 
  FiAlertCircle,
  FiShield,
  FiCopy,
  FiRefreshCw
} from 'react-icons/fi';
 
import { toast } from 'sonner';
import { createSecretPhrase } from '@/lib/phrase';

export default function SecretPhraseCreator() {
  const [phrase, setPhrase] = useState('');
  const [confirmPhrase, setConfirmPhrase] = useState('');
  const [showPhrase, setShowPhrase] = useState(false);
  const [showConfirmPhrase, setShowConfirmPhrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Input, 2: Confirm, 3: Success

  // Validation states
  const [validation, setValidation] = useState({
    wordCount: false,
    wordLength: false,
    confirmationMatch: false
  });

  // Validate phrase as user types
  const validatePhrase = (text: string) => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    
    setValidation(prev => ({
      ...prev,
      wordCount: words.length === 12,
      wordLength: words.every(word => word.length >= 3 && word.length <= 15)
    }));
  };

  const handlePhraseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPhrase(value);
    validatePhrase(value);
  };

  const handleConfirmPhraseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setConfirmPhrase(value);
    setValidation(prev => ({
      ...prev,
      confirmationMatch: value === phrase
    }));
  };

  const generateRandomWords = () => {
    // Simple random word generator (in production, use a proper BIP39 wordlist)
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance'
    ];
    
    const randomWords = Array.from({ length: 12 }, () => 
      words[Math.floor(Math.random() * words.length)]
    );
    
    const generatedPhrase = randomWords.join(' ');
    setPhrase(generatedPhrase);
    validatePhrase(generatedPhrase);
    toast.info('Random phrase generated. Please save it securely!');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(phrase);
    toast.success('Phrase copied to clipboard');
  };

  const resetForm = () => {
    setPhrase('');
    setConfirmPhrase('');
    setShowPhrase(false);
    setShowConfirmPhrase(false);
    setStep(1);
    setValidation({
      wordCount: false,
      wordLength: false,
      confirmationMatch: false
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 1) {
      if (!validation.wordCount || !validation.wordLength) {
        toast.error('Please enter a valid 12-word phrase');
        return;
      }
      setStep(2);
      return;
    }

    if (step === 2) {
      if (!validation.confirmationMatch) {
        toast.error('Phrases do not match');
        return;
      }

      setIsLoading(true);
      try {
        const result = await createSecretPhrase(phrase);
        
        if (result.error) {
          toast.error(result.error);
          return;
        }

        toast.success('Wallet connected successfully!');
        setStep(3);
      } catch (error) {
        console.error('Failed to create secret phrase:', error);
        toast.error('Failed to save secret phrase. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getWordCount = () => {
    return phrase.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (step === 3) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Wallet Connected Successfully!
          </h3>
          <p className="text-gray-600 mb-6">
            Your secret phrase has been securely stored.
          </p>
          <button
            onClick={resetForm}
            className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Add Another Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShield className="w-6 h-6 text-teal-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          {step === 1 ? 'Connect Your Wallet' : 'Confirm Secret Phrase'}
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          {step === 1 
            ? 'Enter your 12-word secret recovery phrase to connect your wallet'
            : 'Please re-enter your phrase to confirm it\'s correct'
          }
        </p>
      </motion.div>

      {/* Security Warning */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6"
      >
        <div className="flex items-start">
          <FiAlertCircle className="w-5 h-5 text-orange-500 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-orange-800 mb-1">Security Notice</h4>
            <p className="text-orange-700 text-sm">
              Never share your secret phrase with anyone. Store it securely offline. 
              This phrase gives full access to your wallet.
            </p>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Input Phrase */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Recovery Phrase (12 words)
                </label>
                
                <div className="relative">
                  <textarea
                    value={phrase}
                    onChange={handlePhraseChange}
                    placeholder="Enter your 12-word recovery phrase separated by spaces"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none pr-20"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  
                  {/* Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPhrase(!showPhrase)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPhrase ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>

                  {/* Word Counter */}
                  <div className="absolute right-3 bottom-3 text-xs text-gray-500 bg-white px-2 py-1 rounded">
                    {getWordCount()}/12
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  <button
                    type="button"
                    onClick={generateRandomWords}
                    className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <FiRefreshCw className="w-4 h-4 mr-2" />
                    Generate Random
                  </button>
                  
                  {phrase && (
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex items-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <FiCopy className="w-4 h-4 mr-2" />
                      Copy Phrase
                    </button>
                  )}
                </div>

                {/* Validation Indicators */}
                <div className="mt-4 space-y-2">
                  <div className="flex items-center text-sm">
                    {validation.wordCount ? (
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <FiX className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={validation.wordCount ? 'text-green-600' : 'text-gray-600'}>
                      Exactly 12 words
                    </span>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    {validation.wordLength ? (
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <FiX className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={validation.wordLength ? 'text-green-600' : 'text-gray-600'}>
                      All words between 3-15 characters
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Confirm Phrase */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Your Secret Phrase
                </label>
                
                <div className="relative">
                  <textarea
                    value={confirmPhrase}
                    onChange={handleConfirmPhraseChange}
                    placeholder="Re-enter your 12-word recovery phrase to confirm"
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none pr-20"
                    spellCheck={false}
                    autoComplete="off"
                  />
                  
                  {/* Show/Hide Toggle */}
                  <button
                    type="button"
                    onClick={() => setShowConfirmPhrase(!showConfirmPhrase)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPhrase ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>

                {/* Confirmation Match Indicator */}
                <div className="mt-3">
                  <div className="flex items-center text-sm">
                    {validation.confirmationMatch ? (
                      <FiCheck className="w-4 h-4 text-green-500 mr-2" />
                    ) : (
                      <FiX className="w-4 h-4 text-red-500 mr-2" />
                    )}
                    <span className={validation.confirmationMatch ? 'text-green-600' : 'text-gray-600'}>
                      Phrases match
                    </span>
                  </div>
                </div>
              </div>

              {/* Display Original Phrase for Reference */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Your Entered Phrase:</h4>
                <p className="text-sm text-gray-600 font-mono bg-white p-3 rounded border">
                  {showPhrase ? phrase : '•'.repeat(phrase.length)}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Back
            </button>
          )}
          
          <button
            type="submit"
            disabled={
              isLoading || 
              (step === 1 && (!validation.wordCount || !validation.wordLength)) ||
              (step === 2 && !validation.confirmationMatch)
            }
            className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                {step === 1 ? 'Verifying...' : 'Connecting...'}
              </>
            ) : (
              step === 1 ? 'Continue to Confirm' : 'Connect Wallet'
            )}
          </button>
        </div>
      </form>

      {/* Additional Security Tips */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <h4 className="font-medium text-blue-800 mb-2 flex items-center">
          <FiLock className="w-4 h-4 mr-2" />
          Security Best Practices
        </h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Store your phrase in multiple secure locations</li>
          <li>• Never store digitally in plain text</li>
          <li>• Use hardware wallets for large amounts</li>
          <li>• Be wary of phishing attempts</li>
        </ul>
      </motion.div>
    </div>
  );
}