'use client';

import { createCryptoPaymentOption, deleteCryptoPaymentOption, getCryptoPaymentOptions, toggleCryptoPaymentOptionStatus, updateCryptoPaymentOption } from '@/lib/investmentplan';
import { CryptoPaymentOption } from '@/types/businesses';
import React, { useState, useEffect } from 'react';
 

interface CryptoPaymentOptionFormData {
  name: string;
  symbol: string;
  network: string;
  walletAddress: string;
  isActive: boolean;
}

export const CryptoPaymentOptionsManager: React.FC = () => {
  const [paymentOptions, setPaymentOptions] = useState<CryptoPaymentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  
  // Form states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOption, setEditingOption] = useState<CryptoPaymentOption | null>(null);
  const [formData, setFormData] = useState<CryptoPaymentOptionFormData>({
    name: '',
    symbol: '',
    network: '',
    walletAddress: '',
    isActive: true
  });
  const [formLoading, setFormLoading] = useState(false);

  // Fetch payment options
  const fetchPaymentOptions = async () => {
    setLoading(true);
    setError('');
    const result = await getCryptoPaymentOptions();
    
    if (result.error) {
      setError(result.error);
    } else {
      setPaymentOptions(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPaymentOptions();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      network: '',
      walletAddress: '',
      isActive: true
    });
    setEditingOption(null);
    setIsFormOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingOption) {
        // Update existing option
        const result = await updateCryptoPaymentOption({
          id: editingOption.id,
          ...formData
        });

        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Payment option updated successfully!');
          await fetchPaymentOptions();
          resetForm();
        }
      } else {
        // Create new option
        const result = await createCryptoPaymentOption(formData);

        if (result.error) {
          setError(result.error);
        } else {
          setSuccess('Payment option created successfully!');
          await fetchPaymentOptions();
          resetForm();
        }
      }
    } catch (err) {
        console.log(err)
      setError('An unexpected error occurred');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit
  const handleEdit = (option: CryptoPaymentOption) => {
    setFormData({
      name: option.name,
      symbol: option.symbol,
      network: option.network,
      walletAddress: option.walletAddress,
      isActive: option.isActive
    });
    setEditingOption(option);
    setIsFormOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment option?')) {
      return;
    }

    setError('');
    setSuccess('');
    
    const result = await deleteCryptoPaymentOption(id);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess('Payment option deleted successfully!');
      await fetchPaymentOptions();
    }
  };

  // Handle status toggle
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    setError('');
    setSuccess('');
    
    const result = await toggleCryptoPaymentOptionStatus(id, !currentStatus);
    
    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(`Payment option ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      await fetchPaymentOptions();
    }
  };

  // Common crypto networks
  const commonNetworks = [
    'Bitcoin',
    'Ethereum',
    'Binance Smart Chain',
    'Polygon',
    'Solana',
    'Avalanche',
    'Arbitrum',
    'Optimism',
    'Tron'
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Crypto Payment Options</h1>
            <p className="text-gray-600">Manage cryptocurrency payment methods for your platform</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <span>+ Add Payment Option</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Options</div>
            <div className="text-2xl font-bold text-blue-900">{paymentOptions.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Active</div>
            <div className="text-2xl font-bold text-green-900">
              {paymentOptions.filter(opt => opt.isActive).length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Inactive</div>
            <div className="text-2xl font-bold text-orange-900">
              {paymentOptions.filter(opt => !opt.isActive).length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="text-sm text-purple-600 font-medium">Networks</div>
            <div className="text-2xl font-bold text-purple-900">
              {new Set(paymentOptions.map(opt => opt.network)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Create/Edit Form */}
      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingOption ? 'Edit Payment Option' : 'Add New Payment Option'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Bitcoin, Ethereum, USDT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  name="symbol"
                  value={formData.symbol}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., BTC, ETH, USDT"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Network *
                </label>
                <select
                  name="network"
                  value={formData.network}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Network</option>
                  {commonNetworks.map(network => (
                    <option key={network} value={network}>
                      {network}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wallet Address *
                </label>
                <input
                  type="text"
                  name="walletAddress"
                  value={formData.walletAddress}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="Enter wallet address"
                />
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="isActive"
                id="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                Active (available for payments)
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                disabled={formLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Saving...' : (editingOption ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Payment Options Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Symbol & Network
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wallet Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paymentOptions.map((option) => (
                <tr key={option.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{option.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-semibold">{option.symbol}</div>
                    <div className="text-sm text-gray-500">{option.network}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-mono max-w-xs truncate" title={option.walletAddress}>
                      {option.walletAddress}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(option.id, option.isActive)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        option.isActive
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {option.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {option.createdAt ? new Date(option.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(option)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(option.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {paymentOptions.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500">No payment options found</div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Payment Option
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CryptoPaymentOptionsManager;