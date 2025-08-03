import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { setUserFromCallback } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      
      // Check for Supabase auth tokens in URL
      const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
      const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
      
      if (accessToken) {
        try {
          // Store the tokens
          localStorage.setItem('token', accessToken);
          if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken);
          }
          
          // Get user profile with the token
          const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
          const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              // Use AuthContext method to set user and token
              setUserFromCallback(result.data, accessToken);
              
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
              
              // Redirect to dashboard
              navigate('/dashboard');
              return;
            }
          }
        } catch (error) {
          console.error('Auth callback error:', error);
        }
      }
      
      // If no tokens or error, redirect to login
      navigate('/login');
    };

    handleAuthCallback();
  }, [navigate, setUserFromCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-sm text-gray-600">Completing your login...</p>
      </div>
    </div>
  );
};

export default AuthCallback;