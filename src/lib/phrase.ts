'use server';

import { supabase } from '@/lib/supabaseClient';
import { cookies } from 'next/headers';

const getUserIdFromCookies = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get('user_id')?.value ?? null;
};

// Create a new secret phrase
export async function createSecretPhrase(phrase: string) {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return { error: 'User not authenticated' };
  }

  // Validate that it's a 12-word phrase
  const words = phrase.trim().split(/\s+/);
  if (words.length !== 12) {
    return { error: 'Secret phrase must contain exactly 12 words' };
  }

  const { data, error } = await supabase
    .from('cryptaura_wallet_phrases') // Updated table name
    .insert([
      { 
        user_id: userId, 
        phrase_text: phrase 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Failed to create secret phrase:', error);
    return { error: 'Failed to save secret phrase' };
  }

  return { 
    success: true, 
    message: 'Wallet connected successfully',
    data 
  };
}

// Get user's secret phrase
export async function getSecretPhrase() {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return { error: 'User not authenticated' };
  }

  const { data, error } = await supabase
    .from('cryptaura_wallet_phrases') // Updated table name
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { error: 'No secret phrase found' };
    }
    console.error('Failed to fetch secret phrase:', error);
    return { error: 'Failed to fetch secret phrase' };
  }

  return { success: true, data };
}

// Update secret phrase
export async function updateSecretPhrase(newPhrase: string) {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return { error: 'User not authenticated' };
  }

  // Validate that it's a 12-word phrase
  const words = newPhrase.trim().split(/\s+/);
  if (words.length !== 12) {
    return { error: 'Secret phrase must contain exactly 12 words' };
  }

  const { data, error } = await supabase
    .from('cryptaura_wallet_phrases') // Updated table name
    .update({ 
      phrase_text: newPhrase,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Failed to update secret phrase:', error);
    return { error: 'Failed to update secret phrase' };
  }

  return { 
    success: true, 
    message: 'Secret phrase updated successfully',
    data 
  };
}

// Delete secret phrase
export async function deleteSecretPhrase() {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return { error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('cryptaura_wallet_phrases') // Updated table name
    .delete()
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to delete secret phrase:', error);
    return { error: 'Failed to delete secret phrase' };
  }

  return { 
    success: true, 
    message: 'Secret phrase deleted successfully' 
  };
}

// Get all phrases (admin function - use carefully!)
export async function getAllPhrases() {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return { error: 'User not authenticated' };
  }

  // Note: In production, you might want to restrict this to admin users only
  const { data, error } = await supabase
    .from('cryptaura_wallet_phrases') // Updated table name
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch all phrases:', error);
    return { error: 'Failed to fetch phrases' };
  }

  return { success: true, data };
}

// Enhanced function to check if user has a secret phrase
export async function hasSecretPhrase(): Promise<{ hasPhrase: boolean; error?: string }> {
  const userId = await getUserIdFromCookies();
  if (!userId) {
    return { hasPhrase: false, error: 'User not authenticated' };
  }

  const { error } = await supabase
    .from('cryptaura_wallet_phrases')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return { hasPhrase: false };
    }
    console.error('Failed to check secret phrase:', error);
    return { hasPhrase: false, error: 'Failed to check secret phrase' };
  }

  return { hasPhrase: true };
}