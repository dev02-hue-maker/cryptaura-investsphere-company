/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import { useState, useEffect } from 'react';
import { getUserWithdrawals  } from '@/lib/withdrawal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiLoader, 
  FiClock, 
  FiCheckCircle, 
  FiXCircle, 
  FiChevronLeft, 
  FiChevronRight,
  FiFilter,
  FiRefreshCw
} from 'react-icons/fi';
import { format } from 'date-fns';
import { Withdrawal, WithdrawalStatus } from '@/types/businesses';

const statusConfig: Record<WithdrawalStatus, { color: string; icon: React.ReactNode }> = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: <FiClock className="text-yellow-500" />
  },
  processing: {
    color: 'bg-blue-100 text-blue-800',
    icon: <FiLoader className="text-blue-500 animate-spin" />
  },
  completed: {
    color: 'bg-green-100 text-green-800',
    icon: <FiCheckCircle className="text-green-500" />
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: <FiXCircle className="text-red-500" />
  },
  failed: {
    color: 'bg-red-100 text-red-800',
    icon: <FiXCircle className="text-red-500" />
  },
  cancelled: {
    color: 'bg-gray-100 text-gray-800',
    icon: <FiXCircle className="text-gray-500" />
  }
};

const ITEMS_PER_PAGE = 10;

export default function WithdrawalHistory() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error, count } = await getUserWithdrawals({
        status: statusFilter === 'all' ? undefined : statusFilter,
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE
      });

      if (error) {
        setError(error);
        return;
      }

      setWithdrawals(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
      setError('Failed to load withdrawal history');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [page, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWithdrawals();
  };

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Withdrawal History</h2>
            <p className="text-sm text-gray-500">
              {totalCount} total withdrawal{totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label="Refresh"
            >
              <FiRefreshCw className={`text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as WithdrawalStatus | 'all');
                  setPage(1);
                }}
                className="appearance-none pl-4 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
              </select>
              <FiFilter className="absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
            <FiXCircle className="text-red-500 text-xl mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {loading && withdrawals.length === 0 ? (
          <div className="flex justify-center items-center h-64">
            <FiLoader className="animate-spin text-blue-500 text-2xl" />
          </div>
        ) : withdrawals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No withdrawals found</p>
            <button
              onClick={handleRefresh}
              className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="border border-gray-100 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Crypto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {withdrawals.map((withdrawal) => (
                      <motion.tr
                        key={withdrawal.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-gray-900">
                            ${withdrawal.amount.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">{withdrawal.cryptoType}</div>
                          <div className="text-xs text-gray-500">{withdrawal.walletAddress}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex items-center text-xs rounded-full ${statusConfig[withdrawal.status].color}`}>
                            {statusConfig[withdrawal.status].icon}
                            <span className="ml-1.5 capitalize">{withdrawal.status}</span>
                          </span>
                          {withdrawal.adminNotes && (
                            <div className="text-xs text-gray-500 mt-1">{withdrawal.adminNotes}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-gray-700">
                            {format(new Date(withdrawal.createdAt), 'MMM d, yyyy')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {format(new Date(withdrawal.createdAt), 'h:mm a')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {withdrawal.reference}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft />
              Previous
            </button>
            
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </div>
            
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <FiChevronRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}