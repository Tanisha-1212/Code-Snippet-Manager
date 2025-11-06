import React from 'react'
import Home from "./pages/Home.jsx"
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/MainLayout.jsx';
import LandingPage from './pages/LandingPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import SnippetDetailPage from './pages/SnippetDetailPage.jsx';
import {useAuth} from "./context/AuthContext.jsx";
import Dashboard from "./pages/Home.jsx"
import CreateSnippetPage from './pages/CreateSnippetPage.jsx';
import EditSnippetPage from './pages/EditSnippetPage.jsx';
import MySnippetsPage from './pages/MySnippetPage.jsx';
import CollectionsPage from './pages/CollectionPage.jsx';
import CollectionDetailPage from './pages/CollectionDetailPage.jsx';
import MyFavourites from './pages/MyFavourites.jsx';
import Settings from './pages/Settings.jsx';
import ProfilePage from './pages/ProfilePage.jsx'


const App = () => {
  const {isAuthenticated } = useAuth();
  return (
    <>
    <MainLayout>
      <Routes>
        <Route 
          path="/" 
          element={isAuthenticated ? <Dashboard /> : <LandingPage />} 
        />
        <Route path="/snippet/create" element={<CreateSnippetPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/register" element={<AuthPage />} />
        <Route path="/snippet/:id" element={<SnippetDetailPage />} />
        <Route path="/snippet/:id/edit" element={<EditSnippetPage />} />
        <Route path="/snippets" element={<MySnippetsPage />} />
        <Route path="/collections" element={<CollectionsPage />} />
        <Route path="/collections/:id" element={<CollectionDetailPage/>}/>
        <Route path="/favorites" element={<MyFavourites/>}/>
        <Route path="/profile" element={<ProfilePage/>}/>
        <Route path="/profile/settings" element={<Settings />} />
      </Routes>
    </MainLayout>
    </>
  )
}

export default App