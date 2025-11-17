'use server'

import { supabase } from '@/lib/supabaseClient'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'
import nodemailer from 'nodemailer'
import { processReferralBonus } from './referral'
import { redirect } from 'next/navigation'

type SignUpInput = {
  name: string
  email: string
  username: string
  phoneNumber: string
  password: string
  confirmPassword: string
  referralCode?: string 
}
const SIGNUP_BONUS_AMOUNT = 5;

type SignInInput = {
  emailOrUsername: string
  password: string
}

type ResetPasswordInput = {
  email: string
}

type ConfirmResetPasswordInput = {
  token: string
  newPassword: string
  confirmNewPassword: string
}

function generateReferralCode(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function signUp({
  name,
  email,
  username,
  phoneNumber,
  password,
  confirmPassword,
  referralCode,
}: SignUpInput) {
  try {
    // 1. Validate input
    if (password !== confirmPassword) {
      return { error: 'Passwords do not match' }
    }
    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Check if username, email or phone already exists
    const { data: existingUser, error: lookupError } = await supabase
      .from('cryptaura_profile')
      .select('username, email, phone_number, referral_code')
      .or(`username.eq.${username},email.eq.${email},phone_number.eq.${phoneNumber}`)

    if (lookupError) {
      console.error('User lookup error:', lookupError)
      return { error: 'Error checking existing users' }
    }

    if (existingUser && existingUser.length > 0) {
      if (existingUser.some(user => user.username === username)) {
        return { error: 'Username already taken' }
      }
      if (existingUser.some(user => user.email === email)) {
        return { error: 'Email already registered' }
      }
      if (existingUser.some(user => user.phone_number === phoneNumber)) {
        return { error: 'Phone number already registered' }
      }
    }

    // 2b. Validate referral code if provided
    let referredByUserId: string | null = null;
    if (referralCode) {
      const { data: referrerData, error: referrerError } = await supabase
        .from('cryptaura_profile')
        .select('id')
        .eq('referral_code', referralCode)
        .single();

      if (referrerError || !referrerData) {
        return { error: 'Invalid referral code' };
      }
      referredByUserId = referrerData.id;
    }

    // 3. Generate a unique referral code for the new user
    let referralCodeForNewUser = generateReferralCode();
    let isCodeUnique = false;
    let attempts = 0;
    const maxAttempts = 5;

    // Ensure the generated code is unique
    while (!isCodeUnique && attempts < maxAttempts) {
      attempts++;
      const { data: existingCode } = await supabase
        .from('cryptaura_profile')
        .select('referral_code')
        .eq('referral_code', referralCodeForNewUser)
        .single();

      if (!existingCode) {
        isCodeUnique = true;
      } else {
        referralCodeForNewUser = generateReferralCode();
      }
    }

    if (!isCodeUnique) {
      return { error: 'Failed to generate unique referral code. Please try again.' };
    }

    // 4. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          username,
          phone_number: phoneNumber,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (authError || !authData?.user) {
      console.error('Auth error:', authError)
      return { error: authError?.message || 'Signup failed' }
    }

    const userId = authData.user.id

    // 5. Create user profile with referral data
    const now = new Date().toISOString()
    const { error: profileError } = await supabase.from('cryptaura_profile').insert([{
      id: userId,
      name,
      username,
      email,
      phone_number: phoneNumber,
      referral_code: referralCodeForNewUser,
      referred_by: referredByUserId,
      created_at: now,
      updated_at: now,
    }])

    if (profileError) {
      await supabase.auth.admin.deleteUser(userId)
      return { error: 'Failed to create profile: ' + profileError.message }
    }

    // 6. Update referrer's stats if applicable
    if (referredByUserId) {
      // First update referrer's stats
      await supabase.rpc('cryptaura_increment_referral_count', {
        user_id: referredByUserId
      }).then(({ error }) => {
        if (error) {
          console.error('Failed to update referrer stats:', error);
        }
      });

      // Process signup bonus
      const SIGNUP_BONUS_AMOUNT = 5;
      const bonusResult = await processReferralBonus(userId, SIGNUP_BONUS_AMOUNT);
      
      if (bonusResult.error) {
        console.error('Referral bonus processing failed:', bonusResult.error);
       }
    }

    // 7. Send welcome email (with referral code)
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Welcome to Cryptaura - Confirm Your Email',
        html: `
          <p>Hello ${name},</p>
          <p>Thank you for registering with Cryptaura!</p>
          <p>Your username: <strong>${username}</strong></p>
          <p>Your unique referral code: <strong>${referralCodeForNewUser}</strong></p>
          <p>Share this code with friends to earn rewards!</p>
          <p>Please click the link below to verify your email address:</p>
          <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/auth/confirm-email?token=${authData.session?.access_token}">Verify Email</a></p>
          <p>If you didn't create this account, please contact support immediately.</p>
        `,
      }

      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError)
      // Not critical, so we continue
    }

    return {
      user: authData.user,
      session: authData.session,
      message: 'Signup successful! Please check your email for confirmation.',
      referralCode: referralCodeForNewUser,
      wasReferred: !!referredByUserId,
      signupBonus: referredByUserId ? SIGNUP_BONUS_AMOUNT : 0
    }
  } catch (err) {
    console.error('Unexpected signup error:', err)
    return { error: 'An unexpected error occurred during signup' }
  }
}

export async function signIn({ emailOrUsername, password }: SignInInput) {
  try {
    // 1. Validate input
    if (!emailOrUsername || !password) {
      return { error: 'Email/Username and password are required' }
    }

    // 2. Determine if input is email or username
    const isEmail = emailOrUsername.includes('@')
    let email = emailOrUsername
    
    if (!isEmail) {
      // Lookup email by username
      const { data: profile, error: profileError } = await supabase
        .from('cryptaura_profile')
        .select('email, is_admin')
        .eq('username', emailOrUsername)
        .single()

      if (profileError || !profile) {
        return { error: 'Invalid username or password' }
      }
      email = profile.email
    }

    // 3. Attempt authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Authentication failed:', error.message)
      return { error: 'Invalid credentials' }
    }

    // 4. Get user profile with is_admin field
    const { data: userProfile, error: profileError } = await supabase
      .from('cryptaura_profile')
      .select('username, is_admin')
      .eq('id', data.user?.id)
      .single()

    if (profileError) {
      console.error('Failed to fetch user profile:', profileError)
      return { error: 'Failed to fetch user profile' }
    }

    // 5. Handle session
    const sessionToken = data.session?.access_token
    const refreshToken = data.session?.refresh_token
    const userId = data.user?.id

    if (!sessionToken || !refreshToken || !userId) {
      console.error('Incomplete session data')
      return { error: 'Failed to create session' }
    }

    // 6. Set cookies
    const cookieStore = await cookies()
    const oneYear = 31536000 // 1 year in seconds

    cookieStore.set('sb-access-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('sb-refresh-token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    cookieStore.set('user_id', userId, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    // Set username cookie
    if (userProfile?.username) {
      cookieStore.set('username', userProfile.username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: oneYear,
        path: '/',
        sameSite: 'lax',
      })
    }

    // Set is_admin cookie for client-side routing
    cookieStore.set('is_admin', userProfile?.is_admin ? 'true' : 'false', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      maxAge: oneYear,
      path: '/',
      sameSite: 'lax',
    })

    return {
      user: data.user,
      session: data.session,
      is_admin: userProfile?.is_admin || false,
      message: 'Login successful'
    }
  } catch (err) {
    console.error('Unexpected login error:', err)
    return { error: 'An unexpected error occurred' }
  }
}


export async function resetPassword({ email }: ResetPasswordInput) {
  try {
    // 1. Validate input
    if (!email) {
      return { error: 'Email is required' }
    }

    // 2. Find user by email
    const { data: user, error: userError } = await supabase
      .from('cryptaura_profile')
      .select('id, name')
      .eq('email', email)
      .single()

    if (userError || !user) {
      return { error: 'No account found with this email' }
    }

    // 3. Generate reset token
    const token = uuidv4()
    const expiresAt = new Date(Date.now() + 3600000) // 1 hour from now

    // 4. Store token in database
    const { error: tokenError } = await supabase
      .from('cryptaura_password_reset_tokens')
      .insert({
        user_id: user.id,
        token,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      console.error('Failed to store reset token:', tokenError)
      return { error: 'Failed to generate reset link' }
    }

    // 5. Send email with reset link
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${token}`

      const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: email,
        subject: 'Cryptaura - Password Reset Request',
        html: `
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your Cryptaura account password.</p>
          <p>Click the link below to reset your password:</p>
          <p><a href="${resetLink}">Reset Password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `,
      }

      await transporter.sendMail(mailOptions)
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      return { error: 'Failed to send reset link' }
    }

    return { 
      success: true, 
      message: 'Password reset link sent to your email',
    }
  } catch (err) {
    console.error('Unexpected error in resetPassword:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function confirmResetPassword({
  token,
  newPassword,
  confirmNewPassword,
}: ConfirmResetPasswordInput) {
  try {
    // 1. Validate input
    if (!token || !newPassword || !confirmNewPassword) {
      return { error: 'All fields are required' }
    }
    if (newPassword !== confirmNewPassword) {
      return { error: 'Passwords do not match' }
    }
    if (newPassword.length < 8) {
      return { error: 'Password must be at least 8 characters long' }
    }

    // 2. Verify token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from('cryptaura_password_reset_tokens')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .eq('used', false)
      .single()

    if (tokenError || !tokenRecord) {
      return { error: 'Invalid or expired reset link. Please request a new one.' }
    }

    // 3. Use admin client to reset password
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      tokenRecord.user_id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Password update error:', updateError)
      return { error: 'Failed to update password. Please try again.' }
    }

    // 4. Mark token as used
    await supabase
      .from('cryptaura_password_reset_tokens')
      .update({ used: true })
      .eq('id', tokenRecord.id)

    return {
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    }
  } catch (err) {
    console.error('Unexpected error in confirmResetPassword:', err)
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

export async function signOut() {
  try {
    // 1. Sign out from Supabase Auth
    const { error: authError } = await supabase.auth.signOut()
    
    if (authError) {
      console.error('Supabase sign out error:', authError.message)
      return { error: 'Failed to sign out from authentication service' }
    }

    // 2. Clear all auth-related cookies
    const cookieStore =await cookies()
    
    cookieStore.delete('sb-access-token')
    cookieStore.delete('sb-refresh-token')
    cookieStore.delete('user_id')
    cookieStore.delete('username')

    // 3. Return success
    return { success: true, message: 'Signed out successfully' }
  } catch (err) {
    console.error('Unexpected sign out error:', err)
    return { error: 'An unexpected error occurred during sign out' }
  }
}

export async function getSession() {
  try {
    const cookieStore =await cookies()
    const accessToken = cookieStore.get('sb-access-token')?.value
    const refreshToken = cookieStore.get('sb-refresh-token')?.value

    if (!accessToken || !refreshToken) {
      if (typeof window !== 'undefined') {
                window.location.href = '/signin';
              } else {
                redirect('/signin');
              }
      return { session: null, user: null }
    }

    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (error || !data.session) {
      return { session: null, user: null }
    }

    return { session: data.session, user: data.user }
  } catch (err) {
    console.error('Error getting session:', err)
    return { session: null, user: null }
  }
}