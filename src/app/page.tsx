"use client"
import React, { useState, useEffect, useRef } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const hasCreatedToken = useRef(false);

  useEffect(() => {
    const initUser = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user) {
          redirect('/login');
        }
        setUser(data.user);
      } catch (err) {
        console.error('Error fetching user:', err);
        redirect('/login');
      }
    };
    initUser();
  }, []);

  useEffect(() => {
    if (!user || hasCreatedToken.current) return;

    const createLinkToken = async () => {
      try {
        hasCreatedToken.current = true; // Set before the call
        const response = await axios.post('/api/plaid/create-link-token', {
          client_user_id: user?.id || 'unique_user',
        });
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error('Error generating link token:', error);
        hasCreatedToken.current = false; // Reset on error so it can retry
      }
    };
    createLinkToken();
  }, [user]);

  const onSuccess = async (public_token: string) => {
    try {
      const response = await axios.post('/api/plaid/exchange-token', {
        public_token,
      });
      console.log('Access Token:', response.data.access_token);
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
  };

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess,
  });

  return (
    <div>
      <p>Hello {user?.email}</p>
      {linkToken && (
        <button onClick={() => open()} disabled={!ready}>
          Connect Bank
        </button>
      )}
    </div>
  );
}