import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { SnippetProvider } from './context/SnippetContext.jsx'
import { ExploreProvider } from './context/ExploreContext.jsx';
import { CommentProvider } from './context/CommentsContext.jsx';
import { CollectionProvider } from './context/CollectionContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import { GoogleOAuthProvider } from '@react-oauth/google';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <GoogleOAuthProvider clientId="875829764579-1tgaqn8inscnpu6nqtgf0527dv094dvq.apps.googleusercontent.com">
      <UserProvider>
        <CollectionProvider>
          <CommentProvider>
            <ExploreProvider>
              <AuthProvider>
                <ThemeProvider>
                  <SnippetProvider>
                    <App />
                  </SnippetProvider>
                </ThemeProvider>
              </AuthProvider>
            </ExploreProvider>
          </CommentProvider>
        </CollectionProvider>
      </UserProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
