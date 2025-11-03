"use client"
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const initUser = async () => {
      try {
        // Check authenticated user
        const supabase = createClient();
        const { data } = await supabase.auth.getUser();
        setUser(data?.user);
      } catch (err) {
        console.error('Error fetching user:', err);
      }
    };
    initUser();
  }, []);

  return (
    <div>
      <p>Hello {user?.email}</p>
    </div>
  );
}