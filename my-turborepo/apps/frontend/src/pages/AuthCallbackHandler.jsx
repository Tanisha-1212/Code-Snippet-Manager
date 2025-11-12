// pages/AuthCallbackHandler.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthCallbackHandler() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshAuth, user, isAuthenticated } = useAuth();
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('Initializing...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 AuthCallback: Starting...');
      setDebugInfo('Checking for errors...');
      
      // Check for error from backend
      const authError = searchParams.get('error');
      if (authError === 'auth_failed') {
        console.log('❌ AuthCallback: Auth failed from backend');
        setError('Google authentication failed. Please try again.');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      try {
        setDebugInfo('Waiting for session to establish...');
        console.log('⏳ AuthCallback: Waiting 1 second...');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setDebugInfo('Refreshing authentication...');
        console.log('🔄 AuthCallback: Calling refreshAuth...');
        await refreshAuth();
        
        setDebugInfo('Checking authentication status...');
        console.log('🔍 AuthCallback: Waiting for auth state...');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ AuthCallback: Complete. User:', user);
        console.log('✅ AuthCallback: isAuthenticated:', isAuthenticated);
        
        setDebugInfo('Redirecting to dashboard...');
        navigate('/', { replace: true });
        
      } catch (err) {
        console.error('❌ AuthCallback error:', err);
        setError('Authentication failed. Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <p className="text-lg text-gray-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
        <p className="mt-2 text-sm text-gray-500">{debugInfo}</p>
      </div>
    </div>
  );
}

export default AuthCallbackHandler;