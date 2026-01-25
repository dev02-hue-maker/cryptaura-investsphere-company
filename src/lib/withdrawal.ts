"use server";
import { Withdrawal, WithdrawalFilters, WithdrawalInput, WithdrawalStatus } from "@/types/businesses";
import { getSession } from "./auth";
import { supabase } from "./supabaseClient";
import { sendWithdrawalNotificationToAdmin } from "./email";
 import nodemailer from "nodemailer";

 

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Initiate a withdrawal request
export async function initiateWithdrawal({
    amount,
    cryptoType,
    walletAddress
  }: WithdrawalInput): Promise<{ success?: boolean; error?: string; withdrawalId?: string }> {
    try {
      console.log('[initiateWithdrawal] Starting withdrawal process...');
  
      // 1. Get current session
      const session = await getSession();
      if (!session?.user) {
        return { error: 'Not authenticated' };
      }
  
      const userId = session.user.id;
      const userEmail = session.user.email || '';
  
      // 2. Check user balance and profile
      const { data: profile, error: profileError } = await supabase
        .from('cryptaura_profile')
        .select('balance, username')
        .eq('id', userId)
        .single();
  
      if (profileError || !profile) {
        return { error: 'Failed to fetch user balance' };
      }
  
      if (profile.balance < amount) {
        return { error: 'Insufficient balance for withdrawal' };
      }
  
      // 3. Validate minimum withdrawal amount
      const MIN_WITHDRAWAL = 10;
      if (amount < MIN_WITHDRAWAL) {
        return { error: `Minimum withdrawal amount is $${MIN_WITHDRAWAL}` };
      }
  
      // 4. Generate reference
      const reference = `WDR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const narration = `Withdrawal request for ${amount}`;
  
      // 5. Create withdrawal record
      const { data: withdrawal, error: withdrawalError } = await supabase
        .from('cryptaura_withdrawals')
        .insert([{
          user_id: userId,
          amount,
          crypto_type: cryptoType,
          wallet_address: walletAddress,
          reference,
          narration,
          status: 'pending'
        }])
        .select()
        .single();
  
      if (withdrawalError || !withdrawal) {
        return { error: 'Failed to initiate withdrawal' };
      }

      // 6. Notify admin and Send User confirmation email
      // We wrap this in a separate try/catch so email errors don't roll back the DB record
      try {
        // A. Notify Admin (Using your imported function)
        await sendWithdrawalNotificationToAdmin({
          userId,
          userEmail,
          amount,
          cryptoType,
          walletAddress,
          reference,
          withdrawalId: withdrawal.id
        });

        // B. Notify User
        await transporter.sendMail({
          from: `"Cryptaura Finance" <${process.env.EMAIL_USERNAME}>`,
          to: userEmail,
          subject: `Withdrawal Request Received - $${amount}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px;">
              <h2 style="color: #2a52be;">Request Received</h2>
              <p>Hello ${profile.username || 'Valued Customer'},</p>
              <p>Your request to withdraw <strong>$${amount} (${cryptoType})</strong> has been received and is currently <strong>Pending</strong>.</p>
              <hr />
              <p><strong>Wallet Address:</strong> ${walletAddress}</p>
              <p><strong>Reference:</strong> ${reference}</p>
              <hr />
              <p>Our team will process your request shortly. You will receive an email once the transaction is approved.</p>
              <p>Regards,<br>Cryptaura Finance Limited</p>
            </div>
          `
        });
        console.log('[initiateWithdrawal] Admin and User emails sent.');
      } catch (mailError) {
        // Log the error but don't stop the process since the DB record is already created
        console.error('[initiateWithdrawal] Emailing failed:', mailError);
      }
  
      return { success: true, withdrawalId: withdrawal.id };
    } catch (err) {
      console.error('[initiateWithdrawal] Unexpected error:', err);
      return { error: 'An unexpected error occurred' };
    }
  }

// Approve a withdrawal
export async function approveWithdrawal(withdrawalId: string): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    const { data: withdrawal, error: fetchError } = await supabase
      .from('cryptaura_withdrawals')
      .select('status, user_id, amount, crypto_type')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) return { error: 'Withdrawal not found' };
    if (withdrawal.status !== 'pending') return { error: 'Already processed', currentStatus: withdrawal.status };

    const { data: profile, error: profileError } = await supabase
      .from('cryptaura_profile')
      .select('balance, email, username')
      .eq('id', withdrawal.user_id)
      .single();

    if (profileError || !profile) return { error: 'Profile not found' };

    // Update status to processing
    await supabase.from('cryptaura_withdrawals').update({ status: 'processing', processed_at: new Date().toISOString() }).eq('id', withdrawalId);

    // Deduct Balance
    const { error: balanceError } = await supabase.rpc('cryptaura_decrement_balance', {
      user_id: withdrawal.user_id,
      amount: withdrawal.amount
    });

    if (balanceError) {
      await supabase.from('cryptaura_withdrawals').update({ status: 'pending' }).eq('id', withdrawalId);
      return { error: 'Failed to update user balance' };
    }

    // Finalize status
    await supabase.from('cryptaura_withdrawals').update({ status: 'completed' }).eq('id', withdrawalId);

    // Send Approval Email
    await transporter.sendMail({
      from: `"Cryptaura Finance" <${process.env.EMAIL_USERNAME}>`,
      to: profile.email,
      subject: `Withdrawal of $${withdrawal.amount} Approved`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #2a52be;">Withdrawal Approved</h2>
          <p>Dear ${profile.username || 'Valued Customer'},</p>
          <p>Your withdrawal of <strong>$${withdrawal.amount}</strong> (${withdrawal.crypto_type}) has been approved and sent to your wallet.</p>
          <p>Thank you for choosing Cryptaura Finance.</p>
        </div>
      `
    });

    return { success: true };
  } catch (err) {
    console.error('[approveWithdrawal] Unexpected error:', err);
    return { error: 'Unexpected error' };
  }
}

// Reject a withdrawal
export async function rejectWithdrawal(withdrawalId: string, adminNotes: string = ''): Promise<{ success?: boolean; error?: string; currentStatus?: string }> {
  try {
    const { data: withdrawal, error: fetchError } = await supabase
      .from('cryptaura_withdrawals')
      .select('status, user_id, amount, crypto_type')
      .eq('id', withdrawalId)
      .single();

    if (fetchError || !withdrawal) return { error: 'Withdrawal not found' };
    if (withdrawal.status !== 'pending') return { error: 'Already processed', currentStatus: withdrawal.status };

    const { data: profile, error: profileError } = await supabase
      .from('cryptaura_profile')
      .select('email, username')
      .eq('id', withdrawal.user_id)
      .single();

    // If profile fetch failed or profile is missing, mark withdrawal rejected and return an error
    if (profileError || !profile) {
      console.error('[rejectWithdrawal] Failed to fetch profile:', profileError);
      await supabase.from('cryptaura_withdrawals').update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes
      }).eq('id', withdrawalId);

      return { error: 'Profile not found' };
    }

    await supabase.from('cryptaura_withdrawals').update({
        status: 'rejected',
        processed_at: new Date().toISOString(),
        admin_notes: adminNotes
      }).eq('id', withdrawalId);

    // Send Rejection Email
    await transporter.sendMail({
      from: `"Cryptaura Finance" <${process.env.EMAIL_USERNAME}>`,
      to: profile.email,
      subject: `Withdrawal of $${withdrawal.amount} Rejected`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2 style="color: #c0392b;">Withdrawal Rejected</h2>
          <p>Dear ${profile.username || 'Valued Customer'},</p>
          <p>Your withdrawal request of <strong>$${withdrawal.amount}</strong> was not approved.</p>
          ${adminNotes ? `<p><strong>Reason:</strong> ${adminNotes}</p>` : ''}
          <p>Please contact support for more details.</p>
        </div>
      `
    });

    return { success: true };
  } catch (err) {
    console.error('[rejectWithdrawal] Unexpected error:', err);
    return { error: 'Unexpected error' };
  }
}

// Get user withdrawals
export async function getUserWithdrawals(filters: { status?: WithdrawalStatus; limit?: number; offset?: number } = {}): Promise<{ data?: Withdrawal[]; error?: string; count?: number }> {
  try {
    const session = await getSession();
    if (!session?.user) return { error: 'Not authenticated' };

    let query = supabase.from('cryptaura_withdrawals').select(`*`, { count: 'exact' }).eq('user_id', session.user.id).order('created_at', { ascending: false });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset !== undefined && filters.limit) query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data, error, count } = await query;
    if (error) return { error: 'Failed to fetch' };

    return {
      data: data?.map(w => ({
        id: w.id,
        amount: w.amount,
        cryptoType: w.crypto_type,
        status: w.status,
        reference: w.reference,
        createdAt: w.created_at,
        processedAt: w.processed_at,
        walletAddress: w.wallet_address,
        adminNotes: w.admin_notes
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('[rejectWithdrawal] Unexpected error:', err);
    return { error: 'Unexpected error' };
  }
}

// Get all withdrawals (admin)
export async function getAllWithdrawals(filters: WithdrawalFilters = {}): Promise<{ data?: Withdrawal[]; error?: string; count?: number }> {
  try {
    let query = supabase.from('cryptaura_withdrawals').select(`*, cryptaura_profile!inner(email, username)`, { count: 'exact' });

    if (filters.status) query = query.eq('status', filters.status);
    if (filters.userId) query = query.eq('user_id', filters.userId);
    if (filters.search) {
      query = query.or(`wallet_address.ilike.%${filters.search}%,reference.ilike.%${filters.search}%,cryptaura_profile.username.ilike.%${filters.search}%,cryptaura_profile.email.ilike.%${filters.search}%`);
    }

    query = query.order(filters.sortBy || 'created_at', { ascending: filters.sortOrder === 'asc' });

    if (filters.limit) query = query.limit(filters.limit);
    if (filters.offset !== undefined && filters.limit) query = query.range(filters.offset, filters.offset + filters.limit - 1);

    const { data, error, count } = await query;
    if (error) return { error: 'Failed to fetch' };

    return {
      data: data?.map(w => ({
        id: w.id,
        amount: w.amount,
        cryptoType: w.crypto_type,
        status: w.status,
        reference: w.reference,
        createdAt: w.created_at,
        processedAt: w.processed_at,
        walletAddress: w.wallet_address,
        adminNotes: w.admin_notes,
        userEmail: w.cryptaura_profile[0]?.email,
        username: w.cryptaura_profile[0]?.username,
        userId: w.user_id
      })),
      count: count || 0
    };
  } catch (err) {
    console.error('[rejectWithdrawal] Unexpected error:', err);
    return { error: 'Unexpected error' };
  }
}