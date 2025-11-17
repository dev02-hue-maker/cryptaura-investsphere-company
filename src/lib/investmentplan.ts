"use server";
import { CreateCryptoPaymentOption, CryptoPaymentOption, Deposit, DepositFilters, DepositInput, DepositStatus, InvestmentPlan, UpdateCryptoPaymentOption, UpdateInvestmentPlanInput } from "@/types/businesses";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";
import nodemailer from "nodemailer";
import { redirect } from "next/navigation";
import { processReferralBonus } from "./referral";

async function sendDepositApprovalEmail(userId: string, details: {
  amount: number;
  depositId: string;
  cryptoType: string;
}) {
  try {
    const { data: user } = await supabase
      .from('cryptaura_profile')
      .select('email, username')
      .eq('id', userId)
      .single();

    if (!user?.email) {
      console.error('No email found for user:', userId);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Cryptaura Finance Limited <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: `Deposit of $${details.amount} Approved Successfully`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">Deposit Approved</h2>
          <p>Dear ${user.username || 'Valued Customer'},</p>
          
          <p>We are pleased to inform you that your deposit of 
          <strong>$${details.amount}</strong> in <strong>${details.cryptoType}</strong> 
          has been <strong>successfully approved</strong>.</p>
    
          <p><strong>Deposit ID:</strong> ${details.depositId}</p>
    
          <p>Your funds have been credited to your account and will now begin accruing returns based on your selected investment plan.</p>
    
          <p>If you have any questions or require further assistance, please don't hesitate to contact us.</p>
    
          <p style="margin-top: 30px;">
            <strong>Cryptaura Finance Limited</strong><br>
            <a href="mailto:cryptaura@gmail.com">cryptaura@gmail.com</a><br>
            <em>Empowering Smart Investments</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Deposit approval email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send deposit approval email:', error);
  }
}

// Helper function to send deposit rejection email
async function sendDepositRejectionEmail(userId: string, details: {
  amount: number;
  depositId: string;
  cryptoType: string;
  adminNotes: string;
}) {
  try {
    const { data: user } = await supabase
      .from('cryptaura_profile')
      .select('email, username')
      .eq('id', userId)
      .single();

    if (!user?.email) {
      console.error('No email found for user:', userId);
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `Cryptaura Finance Limited <${process.env.EMAIL_USERNAME}>`,
      to: user.email,
      subject: `Deposit of $${details.amount} Rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c0392b;">Deposit Rejected</h2>
          <p>Dear ${user.username || 'Valued Customer'},</p>
          
          <p>Unfortunately, your deposit request of 
          <strong>$${details.amount}</strong> in <strong>${details.cryptoType}</strong> 
          was not approved.</p>
    
          <p><strong>Deposit ID:</strong> ${details.depositId}</p>
    
          ${details.adminNotes ? `
            <p><strong>Note from our team:</strong> ${details.adminNotes}</p>
          ` : ''}
    
          <p>If you have any questions or require further clarification, feel free to reach out to our support team.</p>
    
          <p style="margin-top: 30px;">
            <strong>Cryptaura Finance Limited</strong><br>
            <a href="mailto:cryptaura@gmail.com">cryptaura@gmail.com</a><br>
            <em>Empowering Smart Investments</em>
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Deposit rejection email sent to:', user.email);
  } catch (error) {
    console.error('Failed to send deposit rejection email:', error);
  }
}

export async function getInvestmentPlans(): Promise<{ data?: InvestmentPlan[]; error?: string }> {
  try {
    const { data: plans, error } = await supabase
      .from('cryptaura_investment_plans')
      .select('*')
      .order('min_amount', { ascending: true });

    if (error) {
      console.error('Error fetching investment plans:', error);
      return { error: 'Failed to fetch investment plans' };
    }

    return {
      data: plans?.map(plan => ({
        id: plan.id,
        title: plan.title,
        percentage: plan.percentage,
        minAmount: plan.min_amount,
        maxAmount: plan.max_amount,
        durationDays: plan.duration_days,
        interval: plan.interval,
        referralBonus: plan.referral_bonus,
        imageUrl: plan.image_url,
        features: plan.features,
        isPopular: plan.is_popular
      })) || []
    };
  } catch (err) {
    console.error('Unexpected error in getInvestmentPlans:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateInvestmentPlan(input: UpdateInvestmentPlanInput): Promise<{ success: boolean; error?: string }> {
  try {
    const { id, ...updateFields } = input;

    const { error } = await supabase
      .from('cryptaura_investment_plans')
      .update({
        ...updateFields,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating investment plan:', error);
      return { success: false, error: 'Failed to update investment plan' };
    }

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in updateInvestmentPlan:', err);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

// Get all crypto payment options
// cryptoPaymentOptions.ts
export async function getCryptoPaymentOptions(): Promise<{ data?: CryptoPaymentOption[]; error?: string }> {
  try {
    const { data: options, error } = await supabase
      .from('cryptaura_crypto_payment_options')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching crypto payment options:', error);
      return { error: 'Failed to fetch payment options' };
    }

    return {
      data: options?.map(option => ({
        id: option.id,
        name: option.name,
        symbol: option.symbol,
        network: option.network,
        walletAddress: option.wallet_address,
        isActive: option.is_active,
        createdAt: option.created_at,
        updatedAt: option.updated_at
      })) || []
    };
  } catch (err) {
    console.error('Unexpected error in getCryptoPaymentOptions:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getCryptoPaymentOptionById(id: string): Promise<{ data?: CryptoPaymentOption; error?: string }> {
  try {
    const { data: option, error } = await supabase
      .from('cryptaura_crypto_payment_options')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching crypto payment option:', error);
      return { error: 'Failed to fetch payment option' };
    }

    if (!option) {
      return { error: 'Payment option not found' };
    }

    return {
      data: {
        id: option.id,
        name: option.name,
        symbol: option.symbol,
        network: option.network,
        walletAddress: option.wallet_address,
        isActive: option.is_active,
        createdAt: option.created_at,
        updatedAt: option.updated_at
      }
    };
  } catch (err) {
    console.error('Unexpected error in getCryptoPaymentOptionById:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function createCryptoPaymentOption(
  optionData: CreateCryptoPaymentOption
): Promise<{ data?: CryptoPaymentOption; error?: string }> {
  try {
    const { data: option, error } = await supabase
      .from('cryptaura_crypto_payment_options')
      .insert({
        name: optionData.name,
        symbol: optionData.symbol,
        network: optionData.network,
        wallet_address: optionData.walletAddress,
        is_active: optionData.isActive
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating crypto payment option:', error);
      return { error: 'Failed to create payment option' };
    }

    return {
      data: {
        id: option.id,
        name: option.name,
        symbol: option.symbol,
        network: option.network,
        walletAddress: option.wallet_address,
        isActive: option.is_active,
        createdAt: option.created_at,
        updatedAt: option.updated_at
      }
    };
  } catch (err) {
    console.error('Unexpected error in createCryptoPaymentOption:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function updateCryptoPaymentOption(
  optionData: UpdateCryptoPaymentOption
): Promise<{ data?: CryptoPaymentOption; error?: string }> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    
    if (optionData.name !== undefined) updateData.name = optionData.name;
    if (optionData.symbol !== undefined) updateData.symbol = optionData.symbol;
    if (optionData.network !== undefined) updateData.network = optionData.network;
    if (optionData.walletAddress !== undefined) updateData.wallet_address = optionData.walletAddress;
    if (optionData.isActive !== undefined) updateData.is_active = optionData.isActive;
    
    updateData.updated_at = new Date().toISOString();

    const { data: option, error } = await supabase
      .from('cryptaura_crypto_payment_options')
      .update(updateData)
      .eq('id', optionData.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating crypto payment option:', error);
      return { error: 'Failed to update payment option' };
    }

    return {
      data: {
        id: option.id,
        name: option.name,
        symbol: option.symbol,
        network: option.network,
        walletAddress: option.wallet_address,
        isActive: option.is_active,
        createdAt: option.created_at,
        updatedAt: option.updated_at
      }
    };
  } catch (err) {
    console.error('Unexpected error in updateCryptoPaymentOption:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function deleteCryptoPaymentOption(
  id: string
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase
      .from('cryptaura_crypto_payment_options')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting crypto payment option:', error);
      return { error: 'Failed to delete payment option' };
    }

    return {};
  } catch (err) {
    console.error('Unexpected error in deleteCryptoPaymentOption:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function toggleCryptoPaymentOptionStatus(
  id: string,
  isActive: boolean
): Promise<{ data?: CryptoPaymentOption; error?: string }> {
  try {
    const { data: option, error } = await supabase
      .from('cryptaura_crypto_payment_options')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error toggling crypto payment option status:', error);
      return { error: 'Failed to update payment option status' };
    }

    return {
      data: {
        id: option.id,
        name: option.name,
        symbol: option.symbol,
        network: option.network,
        walletAddress: option.wallet_address,
        isActive: option.is_active,
        createdAt: option.created_at,
        updatedAt: option.updated_at
      }
    };
  } catch (err) {
    console.error('Unexpected error in toggleCryptoPaymentOptionStatus:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function initiateDeposit({
  planId,
  amount,
  cryptoType,
  transactionHash
}: DepositInput): Promise<{ success?: boolean; error?: string; depositId?: string }> {
  try {
    console.log('[initiateDeposit] Starting deposit process with params:', {
      planId,
      amount,
      cryptoType,
      transactionHash: transactionHash ? 'provided' : 'not provided'
    });

    // 1. Get current session
    console.log('[initiateDeposit] Getting user session...');
    const session = await getSession();
    if (!session?.user) {
      console.warn('[initiateDeposit] No authenticated user found');
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');  
      }
      return { error: 'Not authenticated' };
    }
    console.log('[initiateDeposit] User authenticated:', session.user.id);

    const userId = session.user.id;

    // 2. Validate amount against selected plan - ENHANCED DEBUGGING
    console.log(`[initiateDeposit] Validating plan ${planId} and amount ${amount}...`);
    
    // First, let's check what plans exist for debugging
    const { data: allPlans, error: allPlansError } = await supabase
      .from('cryptaura_investment_plans')
      .select('id, title, min_amount, max_amount');

    if (allPlansError) {
      console.error('[initiateDeposit] Error fetching all plans:', allPlansError);
    } else {
      console.log('[initiateDeposit] Available plans:', allPlans);
    }

    // Now fetch the specific plan
    const { data: plan, error: planError } = await supabase
      .from('cryptaura_investment_plans')
      .select('id, title, min_amount, max_amount, percentage, duration_days')
      .eq('id', planId)
      .single();

    console.log('[initiateDeposit] Plan query result:', { plan, planError });

    if (planError) {
      console.error('[initiateDeposit] Plan validation failed:', planError);
      
      // Provide more specific error messages
      if (planError.code === 'PGRST116') { // No rows returned
        return { error: `Investment plan not found. Please select a valid plan. Provided planId: ${planId}` };
      }
      
      return { error: `Database error: ${planError.message}` };
    }

    if (!plan) {
      console.error('[initiateDeposit] Plan not found for ID:', planId);
      return { error: `Investment plan not found. Please select a valid plan.` };
    }

    console.log('[initiateDeposit] Plan validated:', {
      id: plan.id,
      title: plan.title,
      min_amount: plan.min_amount,
      max_amount: plan.max_amount,
      amount_provided: amount
    });

    // Validate amount range
    if (amount < plan.min_amount) {
      console.warn(`[initiateDeposit] Amount ${amount} below minimum ${plan.min_amount}`);
      return { error: `Amount must be at least $${plan.min_amount} for the ${plan.title}` };
    }

    if (amount > plan.max_amount) {
      console.warn(`[initiateDeposit] Amount ${amount} above maximum ${plan.max_amount}`);
      return { error: `Amount cannot exceed $${plan.max_amount} for the ${plan.title}` };
    }

    console.log('[initiateDeposit] Amount validated successfully');

    // 3. Get wallet address for selected crypto
    console.log(`[initiateDeposit] Getting wallet address for ${cryptoType}...`);
    
    // First, check available crypto options for debugging
    const { data: allCryptoOptions, error: allCryptoError } = await supabase
      .from('cryptaura_crypto_payment_options')
      .select('symbol, name, wallet_address');

    if (allCryptoError) {
      console.error('[initiateDeposit] Error fetching all crypto options:', allCryptoError);
    } else {
      console.log('[initiateDeposit] Available crypto options:', allCryptoOptions);
    }

    const { data: cryptoOption, error: cryptoError } = await supabase
      .from('cryptaura_crypto_payment_options')
      .select('wallet_address, name, symbol')
      .eq('symbol', cryptoType.toUpperCase()) // Ensure case matching
      .eq('is_active', true)
      .single();

    if (cryptoError || !cryptoOption) {
      console.error('[initiateDeposit] Crypto validation failed:', cryptoError || 'Crypto option not found');
      
      if (cryptoError?.code === 'PGRST116') {
        return { error: `Cryptocurrency ${cryptoType} is not supported. Please select a valid payment method.` };
      }
      
      return { error: `Invalid cryptocurrency selected: ${cryptoError?.message || 'Not found'}` };
    }

    console.log('[initiateDeposit] Wallet address retrieved for:', cryptoOption.name);

    // 4. Generate reference
    const reference = `DEP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const narration = `Investment deposit for ${plan.title}`;
    console.log('[initiateDeposit] Generated reference:', reference);

    // 5. Create deposit record
    console.log('[initiateDeposit] Creating deposit record...');
    const { data: deposit, error: depositError } = await supabase
      .from('cryptaura_deposits')
      .insert([{
        user_id: userId,
        plan_id: planId,
        amount,
        crypto_type: cryptoType.toUpperCase(),
        wallet_address: cryptoOption.wallet_address,
        transaction_hash: transactionHash,
        reference,
        narration,
        status: 'pending'
      }])
      .select()
      .single();

    if (depositError || !deposit) {
      console.error('[initiateDeposit] Deposit creation failed:', depositError);
      
      // Provide more specific error messages
      if (depositError?.code === '23503') { // Foreign key violation
        return { error: 'Invalid user or plan reference. Please try again.' };
      }
      
      if (depositError?.code === '23505') { // Unique violation
        return { error: 'Duplicate transaction detected. Please use a different transaction hash.' };
      }
      
      return { error: `Failed to initiate deposit: ${depositError?.message || 'Unknown error'}` };
    }

    console.log('[initiateDeposit] Deposit created successfully:', deposit.id);

    // 6. Notify admin
    console.log('[initiateDeposit] Sending admin notification...');
    await sendDepositNotificationToAdmin({
      userId,
      userEmail: session.user.email || '',
      amount,
      planId,
      cryptoType,
      reference,
      depositId: deposit.id,
      walletAddress: cryptoOption.wallet_address,
      transactionHash
    });
    console.log('[initiateDeposit] Admin notification sent');

    console.log('[initiateDeposit] Deposit process completed successfully');
    return { success: true, depositId: deposit.id };
  } catch (err) {
    console.error('[initiateDeposit] Unexpected error:', err);
    return { error: 'An unexpected error occurred during deposit initiation' };
  }
}

async function sendDepositNotificationToAdmin(params: {
  userId: string;
  userEmail: string;
  amount: number;
  planId: string;
  cryptoType: string;
  reference: string;
  depositId: string;
  walletAddress: string;
  transactionHash?: string;
}) {
  try {
    console.log('[sendDepositNotificationToAdmin] Preparing email notification for deposit:', params.depositId);

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Get plan title for email
    console.log('[sendDepositNotificationToAdmin] Fetching plan details...');
    const { data: plan } = await supabase
      .from('cryptaura_investment_plans')
      .select('title')
      .eq('id', params.planId)
      .single();

    const mailOptions = {
      from: `Cryptaura <${process.env.EMAIL_USERNAME}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `New Deposit Request - ${params.amount} ${params.cryptoType}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2a52be;">New Deposit Request</h2>
          <p><strong>User ID:</strong> ${params.userId}</p>
          <p><strong>User Email:</strong> ${params.userEmail}</p>
          <p><strong>Plan:</strong> ${plan?.title || params.planId}</p>
          <p><strong>Amount:</strong> ${params.amount}</p>
          <p><strong>Crypto Type:</strong> ${params.cryptoType}</p>
          <p><strong>Wallet Address:</strong> ${params.walletAddress}</p>
          ${params.transactionHash ? `<p><strong>Transaction Hash:</strong> ${params.transactionHash}</p>` : ''}
          <p><strong>Reference:</strong> ${params.reference}</p>
          
          <div style="margin-top: 30px;">
            <a href="${process.env.ADMIN_URL}/deposits/${params.depositId}/approve" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Approve Deposit
            </a>
            <a href="${process.env.ADMIN_URL}/deposits/${params.depositId}/reject" 
               style="background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-left: 10px;">
              Reject Deposit
            </a>
          </div>
        </div>
      `,
    };

    console.log('[sendDepositNotificationToAdmin] Sending email...');
    await transporter.sendMail(mailOptions);
    console.log('[sendDepositNotificationToAdmin] Email sent successfully');
  } catch (error) {
    console.error('[sendDepositNotificationToAdmin] Failed to send email:', error);
  }
}

// Approve a deposit
export async function approveDeposit(depositId: string): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    // 1. Verify deposit exists and is pending
    const { data: deposit, error: fetchError } = await supabase
      .from('cryptaura_deposits')
      .select('status, user_id, amount, plan_id, crypto_type')
      .eq('id', depositId)
      .single();

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError);
      return { error: 'Deposit not found' };
    }

    if (deposit.status !== 'pending') {
      return { 
        error: 'Deposit already processed',
        currentStatus: deposit.status 
      };
    }

    // 2. Update user balance FIRST
    console.log(`[approveDeposit] Updating balance for user ${deposit.user_id} with amount ${deposit.amount}`);
    
    const { error: balanceError } = await supabase.rpc('cryptaura_increment_balance', {
      user_id: deposit.user_id,
      amount: deposit.amount
    });

    if (balanceError) {
      console.error('Balance update failed:', balanceError);
      return { error: 'Failed to update user balance' };
    }

    console.log(`[approveDeposit] Successfully updated user balance`);

    // 3. Process referral bonus
    if (deposit.amount > 0) {
      console.log(`[approveDeposit] Processing referral bonus for user ${deposit.user_id}`);
      const { error: referralError } = await processReferralBonus(deposit.user_id, deposit.amount);
      if (referralError) {
        console.error('Referral bonus processing failed:', referralError);
        // Continue with deposit approval even if referral bonus fails
      } else {
        console.log(`[approveDeposit] Referral bonus processed successfully`);
      }
    }

    // 4. Update deposit status to completed
    console.log(`[approveDeposit] Updating deposit status to completed`);
    const { error: updateError } = await supabase
      .from('cryptaura_deposits')
      .update({ 
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .eq('id', depositId);

    if (updateError) {
      console.error('Deposit status update failed:', updateError);
      
      // Rollback balance update if deposit status update fails
      await supabase.rpc('cryptaura_decrement_balance', {
        user_id: deposit.user_id,
        amount: deposit.amount
      });
      
      return { error: 'Failed to approve deposit' };
    }

    console.log(`[approveDeposit] Deposit status updated successfully`);

    // 5. Send confirmation to user
    console.log(`[approveDeposit] Sending approval email`);
    await sendDepositApprovalEmail(deposit.user_id, {
      amount: deposit.amount,
      depositId,
      cryptoType: deposit.crypto_type
    });

    console.log(`[approveDeposit] Deposit approval completed successfully`);
    return { success: true };
  } catch (err) {
    console.error('Unexpected error in approveDeposit:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Reject a deposit
export async function rejectDeposit(depositId: string, adminNotes: string = ''): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    // 1. Verify deposit exists and is pending
    const { data: deposit, error: fetchError } = await supabase
      .from('cryptaura_deposits')
      .select('status, user_id, amount, plan_id, crypto_type')
      .eq('id', depositId)
      .single();

    if (fetchError || !deposit) {
      console.error('Deposit fetch failed:', fetchError);
      return { error: 'Deposit not found' };
    }

    if (deposit.status !== 'pending') {
      return { 
        error: 'Deposit already processed',
        currentStatus: deposit.status 
      };
    }

    // 2. Update status to rejected
    const { error: updateError } = await supabase
      .from('cryptaura_deposits')
      .update({ 
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes
      })
      .eq('id', depositId);

    if (updateError) {
      console.error('Rejection failed:', updateError);
      return { error: 'Failed to reject deposit' };
    }

    // 3. Send rejection notification to user
    await sendDepositRejectionEmail(deposit.user_id, {
      amount: deposit.amount,
      depositId,
      cryptoType: deposit.crypto_type,
      adminNotes
    });

    return { success: true };
  } catch (err) {
    console.error('Unexpected error in rejectDeposit:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get user deposits
export async function getUserDeposits(
  filters: {
    status?: DepositStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<{ data?: Deposit[]; error?: string; count?: number }> {
  try {
    // 1. Get current session
    const session = await getSession();
    if (!session?.user) {
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      } else {
        redirect('/signin');
      }
      return { error: 'Not authenticated' };
    }

    const userId = session.user.id;

    // 2. Build base query
    let query = supabase
      .from('cryptaura_deposits')
      .select(`
        id,
        amount,
        crypto_type,
        status,
        reference,
        created_at,
        processed_at,
        transaction_hash,
        cryptaura_investment_plans!inner(title)
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    // 3. Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    // 4. Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching deposits:', error);
      return { error: 'Failed to fetch deposits' };
    }

    return {
        data: data?.map(deposit => ({
            id: deposit.id,
            amount: deposit.amount,
            cryptoType: deposit.crypto_type,
            status: deposit.status,
            reference: deposit.reference,
            createdAt: deposit.created_at,
            processedAt: deposit.processed_at,
            transactionHash: deposit.transaction_hash,
            planTitle: deposit.cryptaura_investment_plans[0]?.title 
          })),
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in getUserDeposits:', err);
    return { error: 'An unexpected error occurred' };
  }
}

export async function getAllDepositss(): Promise<{ data?: Deposit[]; error?: string }> {
  try {
    // Execute simple query to get all deposits
    const { data, error } = await supabase
      .from('cryptaura_deposits')
      .select(`
        id,
        amount,
        crypto_type,
        status,
        reference,
        created_at,
        processed_at,
        transaction_hash,
        admin_notes
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching deposits:', error);
      return { error: 'Failed to fetch deposits' };
    }

    // Simplify the data mapping
    return {
      data: data?.map(deposit => ({
        id: deposit.id,
        amount: deposit.amount,
        cryptoType: deposit.crypto_type,
        status: deposit.status,
        reference: deposit.reference,
        createdAt: deposit.created_at,
        processedAt: deposit.processed_at,
        transactionHash: deposit.transaction_hash,
        adminNotes: deposit.admin_notes
      }))
    };
  } catch (err) {
    console.error('Unexpected error in getAllDeposits:', err);
    return { error: 'An unexpected error occurred' };
  }
}

// Get all deposits (admin)
export async function getAllDeposits(
  filters: DepositFilters = {}
): Promise<{ data?: Deposit[]; error?: string; count?: number }> {
  try {
    // 1. Build base query
    let query = supabase
      .from('cryptaura_deposits')
      .select(`
        id,
        amount,
        crypto_type,
        status,
        reference,
        created_at,
        processed_at,
        transaction_hash,
        admin_notes,
        user_id,
        cryptaura_investment_plans!inner(title),
        cryptaura_profile!inner(email, username)
      `, { count: 'exact' });

    // 2. Apply filters
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    if (filters.userId) {
      query = query.eq('user_id', filters.userId);
    }

    if (filters.cryptoType) {
      query = query.eq('crypto_type', filters.cryptoType);
    }

    if (filters.dateFrom) {
      query = query.gte('created_at', filters.dateFrom);
    }

    if (filters.dateTo) {
      query = query.lte('created_at', filters.dateTo);
    }

    if (filters.search) {
      query = query.or(`
        transaction_hash.ilike.%${filters.search}%,
        reference.ilike.%${filters.search}%,
        cryptaura_profile.username.ilike.%${filters.search}%,
        cryptaura_profile.email.ilike.%${filters.search}%,
        cryptaura_investment_plans.title.ilike.%${filters.search}%
      `);
    }

    // 3. Apply sorting
    const sortBy = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder || 'desc';
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // 4. Apply pagination
    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset !== undefined && filters.limit) {
      query = query.range(filters.offset, filters.offset + filters.limit - 1);
    }

    // 5. Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching deposits:', error);
      return { error: 'Failed to fetch deposits' };
    }

    return {
      data: data?.map(deposit => ({
        id: deposit.id,
        amount: deposit.amount,
        cryptoType: deposit.crypto_type,
        status: deposit.status,
        reference: deposit.reference,
        createdAt: deposit.created_at,
        processedAt: deposit.processed_at,
        transactionHash: deposit.transaction_hash,
        adminNotes: deposit.admin_notes,
        planTitle: deposit.cryptaura_investment_plans[0]?.title,
        userEmail: deposit.cryptaura_profile[0]?.email,
        username: deposit.cryptaura_profile[0]?.username,
        userId: deposit.user_id
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('Unexpected error in getAllDeposits:', err);
    return { error: 'An unexpected error occurred' };
  }
}