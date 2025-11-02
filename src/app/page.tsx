"use client"
import { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import axios from 'axios';
const PlaidLinkComponent = () => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  useEffect(() => {
    const createLinkToken = async () => {
      try {
        const response = await axios.post('/api/plaid/create-link-token', {
          client_user_id: 'your-unique-user-id', // Replace with actual user ID
        });
        setLinkToken(response.data.link_token);
      } catch (error) {
        console.error('Error generating link token:', error);
      }
    };
    createLinkToken();
  }, []);

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
      {linkToken && (
        <button onClick={() => open()} disabled={!ready}>
          Connect Bank
        </button>
      )}
    </div>
  );
};
export default PlaidLinkComponent;