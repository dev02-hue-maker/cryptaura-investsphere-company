"use client";

import { useState, useEffect } from 'react';
 import { Withdrawal, WithdrawalStatus } from '@/types/businesses';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { FiSearch, FiFilter, FiLoader, FiCheck, FiX, FiAlertCircle } from 'react-icons/fi';
import { approveWithdrawal, getAllWithdrawals, rejectWithdrawal } from '@/lib/withdrawal';

const statusOptions: { value: WithdrawalStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
];

const statusColors: Record<WithdrawalStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  failed: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

export default function AdminWithdrawalsTable() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
  });
  const [filters, setFilters] = useState({
    status: undefined as WithdrawalStatus | undefined,
    userId: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectNotes, setRejectNotes] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const { data, error, count } = await getAllWithdrawals({
        status: filters.status,
        userId: filters.userId,
        limit: pagination.pageSize,
        offset: (pagination.page - 1) * pagination.pageSize,
      });

      if (error) {
        toast.error('Failed to fetch withdrawals', { description: error });
        return;
      }

      setWithdrawals(data || []);
      setCount(count || 0);
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, [pagination.page, pagination.pageSize, filters.status, filters.userId]);

  const handleApprove = async (withdrawalId: string) => {
    try {
      setProcessingAction(true);
      const {  error, currentStatus } = await approveWithdrawal(withdrawalId);

      if (error) {
        toast.error('Failed to approve withdrawal', {
          description: currentStatus ? `Status: ${currentStatus}` : error,
        });
        return;
      }

      toast.success('Withdrawal approved successfully');
      fetchWithdrawals();
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedWithdrawal) return;

    try {
      setProcessingAction(true);
      const {  error, currentStatus } = await rejectWithdrawal(
        selectedWithdrawal.id,
        rejectNotes
      );

      if (error) {
        toast.error('Failed to reject withdrawal', {
          description: currentStatus ? `Status: ${currentStatus}` : error,
        });
        return;
      }

      toast.success('Withdrawal rejected successfully');
      setOpenRejectDialog(false);
      setRejectNotes('');
      fetchWithdrawals();
    } catch (error) {
      toast.error('An unexpected error occurred');
      console.error(error);
    } finally {
      setProcessingAction(false);
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({
      ...filters,
      status: value === 'all' ? undefined : (value as WithdrawalStatus),
    });
    setPagination({ ...pagination, page: 1 });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({
      ...filters,
      userId: searchTerm.trim(),
    });
    setPagination({ ...pagination, page: 1 });
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Withdrawal Requests</h1>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by user ID or email..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50"
            >
              <FiFilter />
              <span>Filter</span>
            </button>
          </form>

          <div className="w-full md:w-auto">
            <select
              onChange={handleStatusChange}
              value={filters.status || 'all'}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Crypto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wallet Address
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center py-8">
                        <FiLoader className="animate-spin text-blue-500 text-2xl" />
                      </div>
                    </td>
                  </tr>
                ) : withdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                      No withdrawals found
                    </td>
                  </tr>
                ) : (
                  withdrawals.map((withdrawal) => (
                    <tr key={withdrawal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{withdrawal.username}</div>
                        <div className="text-sm text-gray-500">{withdrawal.userEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {formatAmount(withdrawal.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {withdrawal.cryptoType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap max-w-xs truncate">
                        {withdrawal.walletAddress}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[withdrawal.status]}`}>
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {withdrawal.createdAt ? formatDate(withdrawal.createdAt) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">
                        {withdrawal.reference}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {withdrawal.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleApprove(withdrawal.id)}
                              disabled={processingAction}
                              className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50 flex items-center gap-1"
                            >
                              {processingAction ? (
                                <FiLoader className="animate-spin" />
                              ) : (
                                <>
                                  <FiCheck />
                                  Approve
                                </>
                              )}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedWithdrawal(withdrawal);
                                setOpenRejectDialog(true);
                              }}
                              disabled={processingAction}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 disabled:opacity-50 flex items-center gap-1"
                            >
                              <FiX />
                              Reject
                            </button>
                          </div>
                        )}
                        {withdrawal.status === 'rejected' && withdrawal.adminNotes && (
                          <div className="text-xs text-gray-500">
                            Reason: {withdrawal.adminNotes}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 px-2">
          <div className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.pageSize + 1}-
            {Math.min(pagination.page * pagination.pageSize, count)} of {count} withdrawals
          </div>
          <div className="flex gap-2">
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: Math.max(1, pagination.page - 1),
                })
              }
              disabled={pagination.page === 1 || loading}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() =>
                setPagination({
                  ...pagination,
                  page: pagination.page + 1,
                })
              }
              disabled={
                pagination.page * pagination.pageSize >= count || loading
              }
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      {openRejectDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-start mb-4">
              <div className="flex-shrink-0">
                <FiAlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">Reject Withdrawal?</h3>
                <div className="mt-2 text-sm text-gray-500">
                  Are you sure you want to reject this withdrawal request? Please provide
                  a reason for rejection.
                </div>
              </div>
            </div>
            <textarea
              placeholder="Reason for rejection..."
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setOpenRejectDialog(false);
                  setRejectNotes('');
                }}
                className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectNotes.trim() || processingAction}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-1"
              >
                {processingAction ? (
                  <FiLoader className="animate-spin" />
                ) : (
                  'Reject Withdrawal'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}