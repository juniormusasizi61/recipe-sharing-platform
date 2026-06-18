import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import RecipeFormPage from './pages/RecipeFormPage.jsx';
import RecipeDetailsPage from './pages/RecipeDetailsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Shell from './components/Shell.jsx';

const STORAGE_KEY = 'recipe-app-auth';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Restore authentication state from localStorage when the app mounts.
  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setUser(parsed.user);
        setToken(parsed.token);
      } catch (err) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist login state in localStorage so user stays signed in across reloads.
  const handleLogin = ({ user: loggedUser, token: authToken }) => {
    setUser(loggedUser);
    setToken(authToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: loggedUser, token: authToken }));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <BrowserRouter>
      <Shell user={user} onLogout={handleLogout}>
        {/* Application routes and protected route handling. */}
        <Routes>
          <Route path="/" element={<HomePage user={user} token={token} onLogout={handleLogout} />} />
          <Route path="/auth" element={<AuthPage onLogin={handleLogin} />} />
          <Route
            path="/create"
            element={user ? <RecipeFormPage token={token} user={user} /> : <Navigate to="/auth" />}
          />
          <Route path="/profile" element={user ? <ProfilePage token={token} user={user} /> : <Navigate to="/auth" />} />
          <Route path="/recipes/:id" element={<RecipeDetailsPage token={token} user={user} />} />
          <Route
            path="/recipes/:id/edit"
            element={user ? <RecipeFormPage token={token} user={user} editMode /> : <Navigate to="/auth" />}
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Shell>
    </BrowserRouter>
  );
}

export default App;
