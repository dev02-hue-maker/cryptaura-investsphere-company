 
 
import { FaLeaf, FaBitcoin, FaChartLine } from "react-icons/fa";
 


export const businesses = [
  {
    id: 1,
    title: "Agriculture",
    icon: FaLeaf,
    image: "/iceben-agriculture.jpg",
    description:
      "Accilent Finance Limited invests in innovative farming techniques and advanced agribusiness ventures. Our focus is on productivity, profitability, and sustainability in agriculture.",
  },
  {
    id: 2,
    title: "Crypto Mining",
    icon: FaBitcoin,
    image: "/iceben-crypto.jpg",
    description:
      "As pioneers in the digital currency revolution, we invest in cutting-edge crypto mining operations to maximize returns through strategic asset allocation and secure technology.",
  },
  {
    id: 3,
    title: "Stock Trading",
    icon: FaChartLine,
    image: "/iceben-stock.jpg",
    description:
      "Our stock trading platform uses real-time analytics and market insights to identify opportunities and generate consistent returns for our clients.",
  },
];




export type CryptoType = 'BTC' | 'ETH' | 'BNB' | 'DOGE' | 'SOL' | 'USDT' | 'XRP' | 'LTC' | string;

export type DepositInput = {
  planId: string;
  amount: number;
  cryptoType: string;
  transactionHash?: string;
};

export  type InvestmentPlan = {
  id: string;
  title: string;
  percentage: number;
  minAmount: number;
  maxAmount: number;
  durationDays: number;
  interval: string;
  referralBonus: number;
};

export interface CryptoPaymentOption {
  id: string;
  name: string;
  symbol: string;
  network: string;
  walletAddress: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCryptoPaymentOption {
  name: string;
  symbol: string;
  network: string;
  walletAddress: string;
  isActive: boolean;
}

export interface UpdateCryptoPaymentOption extends Partial<CreateCryptoPaymentOption> {
  id: string;
}

export type DepositStatus = 'pending' | 'confirmed' | 'completed' | 'failed' | 'cancelled';

export  type Deposit = {
  id: string;
  amount: number;
  cryptoType: CryptoType;
  status: DepositStatus;
  reference: string;
  createdAt: string;
  processedAt?: string;
  transactionHash?: string;
  adminNotes?: string;
  planTitle?: string;
  userEmail?: string;
  username?: string;
  userId?: string;
};

export interface DepositFilters {
  status?: DepositStatus;
  userId?: string;
  cryptoType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'amount' | 'crypto_type' | 'status' | 'user_email' | 'plan_title';
  sortOrder?: 'asc' | 'desc';
}


// Withdrawal status types
export type WithdrawalStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'rejected';

// Input for initiating a withdrawal
export interface WithdrawalInput {
  amount: number;
  cryptoType: string;
  walletAddress: string;
}

// Withdrawal object
export interface Withdrawal {
  id: string;
  amount: number;
  cryptoType: string;
  status: WithdrawalStatus;
  reference: string;
  walletAddress: string;
  createdAt: string;
  processedAt?: string;
  adminNotes?: string;
  userEmail?: string;       // Only for admin views
  username?: string;  
  userId?: string;      // Only for admin views
}

export interface WithdrawalFilters {
  status?: WithdrawalStatus;
  userId?: string;
  cryptoType?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'created_at' | 'amount' | 'crypto_type' | 'status' | 'user_email';
  sortOrder?: 'asc' | 'desc';
}

export type ProfileData = {
  name: string;
  username: string;
  referralCode: string;
  email: string;
  phoneNumber: string;
  balance: number;
  totalBonusAndInterest: number; // Added new field
};

export type UpdateInvestmentPlanInput = {
  id: string;
  title?: string;
  percentage?: number;
  min_amount?: number;
  max_amount?: number;
  duration_days?: number;
  interval?: string;
  referral_bonus?: number;
};

export type UpdateUserProfileInput = {
  id: string;
  name?: string;
  username?: string;
  email?: string;
  phoneNumber?: string;
  balance?: number;
  totalBonusAndInterest?: number; 
};


export type Profile = {
  id: string;
  name: string;
  username: string;
  balance: number;
  email: string;
  totalBonusAndInterest: number;
  phoneNumber: string;
};

export  type UpdateProfileInput = {
  name?: string
  username?: string
  email?: string
  phoneNumber?: string
  currentPassword?: string // Needed for email changes
}

// export type ProfileData = {
//   name: string
//   username: string
//   email: string
//   phoneNumber: string
// }

export interface Loan {
  id: string;
  user_id: string;
  plan_id: string;
  amount: number;
  interest_rate: number;
  interest_amount: number;
  total_repayment: number;
  total_repayment_amount: number;
  status: string;
  reference: string;
  purpose: string;
  created_at: string;
  // Add any other fields you have
}
