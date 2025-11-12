import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from "./context/AuthContext.jsx";
import MainLayout from './components/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import SnippetDetailPage from './pages/SnippetDetailPage.jsx';
import Dashboard from "./pages/Home.jsx";
import CreateSnippetPage from './pages/CreateSnippetPage.jsx';
import EditSnippetPage from './pages/EditSnippetPage.jsx';
import MySnippetsPage from './pages/MySnippetPage.jsx';
import CollectionsPage from './pages/CollectionPage.jsx';
import CollectionDetailPage from './pages/CollectionDetailPage.jsx';
import MyFavourites from './pages/MyFavourites.jsx';
import Settings from './pages/Settings.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import AuthCallbackHandler from './pages/AuthCallbackHandler.jsx';

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <LandingPage />} 
        />
        
        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/" replace /> : <AuthPage />} 
        />
        <Route path="/auth/callback" element={<AuthCallbackHandler />} />
        
        {/* Public Routes */}
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/snippet/:id" element={<SnippetDetailPage />} />
        <Route path="/users/:userId" element={<ProfilePage />} />
        
        {/* Protected Routes */}
        <Route 
          path="/snippet/create" 
          element={isAuthenticated ? <CreateSnippetPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/snippet/:id/edit" 
          element={isAuthenticated ? <EditSnippetPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/snippets" 
          element={isAuthenticated ? <MySnippetsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/collections" 
          element={isAuthenticated ? <CollectionsPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/collections/:id" 
          element={isAuthenticated ? <CollectionDetailPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/favorites" 
          element={isAuthenticated ? <MyFavourites /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/profile/settings" 
          element={isAuthenticated ? <Settings /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </MainLayout>
  );
};

export default App;