"use client"
import { getAllDeposits } from '@/lib/investmentplan';
import { Deposit, DepositFilters, DepositStatus } from '@/types/businesses';
import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
 
// Status color mapping
const STATUS_COLORS = {
  pending: '#FFB74D',
  confirmed: '#29B6F6',
  completed: '#66BB6A',
  failed: '#EF5350',
  cancelled: '#78909C'
};

const STATUS_OPTIONS: { value: DepositStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'cancelled', label: 'Cancelled' }
];

const CRYPTO_OPTIONS = [
  { value: '', label: 'All Cryptos' },
  { value: 'BTC', label: 'Bitcoin' },
  { value: 'ETH', label: 'Ethereum' },
  { value: 'USDT', label: 'Tether' },
  { value: 'BNB', label: 'Binance Coin' }
];

const SORT_OPTIONS = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'amount-desc', label: 'Amount (High to Low)' },
  { value: 'amount-asc', label: 'Amount (Low to High)' },
  { value: 'crypto_type-asc', label: 'Crypto Type (A-Z)' },
  { value: 'user_email-asc', label: 'User Email (A-Z)' },
  { value: 'plan_title-asc', label: 'Plan Title (A-Z)' }
];

export const DepositsDashboard: React.FC = () => {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [totalCount, setTotalCount] = useState(0);

  // Filters state
  const [filters, setFilters] = useState<DepositFilters>({
    limit: 50,
    offset: 0,
    sortBy: 'created_at',
    sortOrder: 'desc'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<DepositStatus | ''>('');
  const [cryptoFilter, setCryptoFilter] = useState('');
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // Fetch deposits
  const fetchDeposits = async () => {
    setLoading(true);
    const result = await getAllDeposits({
      ...filters,
      status: statusFilter || undefined,
      cryptoType: cryptoFilter || undefined,
      search: searchTerm || undefined,
      dateFrom: dateRange.from || undefined,
      dateTo: dateRange.to || undefined
    });
    
    if (result.error) {
      setError(result.error);
    } else {
      setDeposits(result.data || []);
      setTotalCount(result.count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeposits();
  }, [filters, statusFilter, cryptoFilter, searchTerm, dateRange]);

  // Chart data preparations
  const chartData = useMemo(() => {
    const statusCount = deposits.reduce((acc, deposit) => {
      acc[deposit.status] = (acc[deposit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const cryptoCount = deposits.reduce((acc, deposit) => {
      acc[deposit.cryptoType] = (acc[deposit.cryptoType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const planCount = deposits.reduce((acc, deposit) => {
      const planTitle = deposit.planTitle || 'Unknown';
      acc[planTitle] = (acc[planTitle] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const dailyData = deposits.reduce((acc, deposit) => {
      const date = new Date(deposit.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      acc[date].amount += deposit.amount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    return {
      statusData: Object.entries(statusCount).map(([status, count]) => ({
        name: status.charAt(0).toUpperCase() + status.slice(1),
        value: count,
        color: STATUS_COLORS[status as DepositStatus]
      })),
      cryptoData: Object.entries(cryptoCount).map(([crypto, count]) => ({
        name: crypto,
        value: count
      })),
      planData: Object.entries(planCount).map(([plan, count]) => ({
        name: plan,
        value: count
      })),
      dailyData: Object.values(dailyData).sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    };
  }, [deposits]);

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [DepositFilters['sortBy'], 'asc' | 'desc'];
    setFilters(prev => ({ ...prev, sortBy, sortOrder }));
  };

  const handlePageChange = (newOffset: number) => {
    setFilters(prev => ({ ...prev, offset: newOffset }));
  };

  const formatAmount = (amount: number, cryptoType: string) => {
    return `${amount} ${cryptoType}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

//   const truncateHash = (hash: string, length: number = 8) => {
//     if (!hash) return 'N/A';
//     return `${hash.substring(0, length)}...${hash.substring(hash.length - length)}`;
//   };

  if (loading && deposits.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Deposits Management</h1>
        <p className="text-gray-600">Total deposits: {totalCount}</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">Total Amount</div>
            <div className="text-2xl font-bold text-blue-900">
              {deposits.reduce((sum, deposit) => sum + deposit.amount, 0).toFixed(8)}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">Completed</div>
            <div className="text-2xl font-bold text-green-900">
              {deposits.filter(d => d.status === 'completed').length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="text-sm text-orange-600 font-medium">Pending</div>
            <div className="text-2xl font-bold text-orange-900">
              {deposits.filter(d => d.status === 'pending').length}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Crypto Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Crypto Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.cryptoData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Investment Plan Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold mb-4">Plan Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.planData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Deposits Trend */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Daily Deposits Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData.dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Total Amount" />
            <Line type="monotone" dataKey="count" stroke="#82ca9d" name="Deposit Count" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              placeholder="Search by transaction hash, reference, user, plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as DepositStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {STATUS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Crypto Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Crypto Type
            </label>
            <select
              value={cryptoFilter}
              onChange={(e) => setCryptoFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CRYPTO_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Range Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Crypto & Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Hash
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reference
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deposits.map((deposit) => (
                <tr key={deposit.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {deposit.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {deposit.userEmail}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatAmount(deposit.amount, deposit.cryptoType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {deposit.cryptoType}
                    </div>
                    <div className="text-sm text-gray-500">
                      {deposit.planTitle}
                    </div>
                  </td>
                  {/* <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 font-mono" title={deposit.transactionHash}>
                      {truncateHash(deposit.transactionHash)}
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        deposit.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : deposit.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : deposit.status === 'confirmed'
                          ? 'bg-blue-100 text-blue-800'
                          : deposit.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {deposit.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(deposit.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {deposit.reference}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filters.limit && totalCount > filters.limit && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center w-full">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{filters.offset! + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(filters.offset! + filters.limit!, totalCount)}
                </span>{' '}
                of <span className="font-medium">{totalCount}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(Math.max(0, filters.offset! - filters.limit!))}
                  disabled={filters.offset === 0}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(filters.offset! + filters.limit!)}
                  disabled={filters.offset! + filters.limit! >= totalCount}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {deposits.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-500">No deposits found</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DepositsDashboard;