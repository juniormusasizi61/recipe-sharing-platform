import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

export default function ProfilePage({ token, user }) {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUserRecipes = async () => {
      if (!token) {
        setError('Authentication token is missing.');
        setLoading(false);
        return;
      }

      try {
        // Load recipes owned by the authenticated user.
        const response = await api.get('/api/recipes/mine', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRecipes(response.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Unable to load your recipes.');
      } finally {
        setLoading(false);
      }
    };

    loadUserRecipes();
  }, [token]);

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">Your Profile</h1>
          <p className="text-muted mb-0">Welcome back, {user?.name}! Here are the recipes you have shared.</p>
        </div>
        <div className="text-end">
          <span className="badge bg-info text-dark">Signed in as {user?.email}</span>
        </div>
      </div>

      {loading ? (
        <div className="alert alert-secondary">Loading your recipes...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="alert alert-warning">
          You have not created any recipes yet. <Link to="/create">Create your first recipe</Link>.
        </div>
      ) : (
        <div className="row g-4">
          {recipes.map((recipe) => (
            <div key={recipe._id} className="col-md-6">
              <div className="card shadow-sm h-100">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{recipe.title}</h5>
                  <p className="card-text text-secondary mb-4">{recipe.instructions.slice(0, 120)}{recipe.instructions.length > 120 ? '...' : ''}</p>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    <Link to={`/recipes/${recipe._id}`} className="btn btn-sm btn-primary">View</Link>
                    <Link to={`/recipes/${recipe._id}/edit`} className="btn btn-sm btn-outline-secondary">Edit</Link>
                  </div>
                </div>
                <div className="card-footer text-muted small">
                  Created {new Date(recipe.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
