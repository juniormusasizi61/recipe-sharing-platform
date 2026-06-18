import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const THEME_KEY = 'recipe-share-theme';

export default function Shell({ user, onLogout, children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // The shell provides a simple global layout: header with navigation,
  // theme toggle persisted to localStorage, and footer. Children are rendered
  // inside the main content area.

  return (
    <>
      <nav className="navbar navbar-light bg-white border-bottom fixed-top shadow-sm">
        <div className="container d-flex flex-wrap justify-content-between align-items-center py-3">
          <Link className="navbar-brand fw-bold mb-2 mb-lg-0" to="/">RecipeShare</Link>
          <div className="d-flex flex-wrap align-items-center gap-2">
            <Link className="nav-link text-secondary" to="/">Home</Link>
            {user && <Link className="nav-link text-secondary" to="/profile">Profile</Link>}
            {user && <Link className="nav-link text-secondary" to="/create">New Recipe</Link>}
            <button
              className="btn btn-sm btn-outline-secondary"
              type="button"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            >
              {theme === 'dark' ? 'Light mode' : 'Dark mode'}
            </button>
            {user ? (
              <>
                <span className="text-secondary small">Signed in as <strong>{user.name}</strong></span>
                <button className="btn btn-sm btn-outline-secondary" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <Link className="btn btn-sm btn-primary" to="/auth">Login / Register</Link>
            )}
          </div>
        </div>
      </nav>
      <main className="app-content">{children}</main>
      <footer className="app-footer py-3 mt-auto bg-white border-top">
        <div className="container text-center text-muted small">
          RecipeShare — built with React, Node, Express, MongoDB, and TheMealDB image lookup.
        </div>
      </footer>
    </>
  );
}
