import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api.js';

const DEFAULT_IMAGE = 'https://via.placeholder.com/700x400?text=Recipe+Image+Not+Found';

export default function RecipeDetailsPage({ token, user }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [imageUrl, setImageUrl] = useState(DEFAULT_IMAGE);
  const [imageStatus, setImageStatus] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        const response = await api.get(`/api/recipes/${id}`);
        setRecipe(response.data);
        await fetchExternalImage(response.data.title);
      } catch (err) {
        setError('Unable to load recipe.');
        setImageStatus('fallback');
      } finally {
        setLoading(false);
      }
    };
    loadRecipe();
  }, [id]);

  const fetchExternalImage = async (title) => {
    try {
      const response = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(title)}`);
      if (!response.ok) {
        throw new Error('MealDB request failed');
      }
      const data = await response.json();
      if (data?.meals?.length > 0) {
        setImageUrl(data.meals[0].strMealThumb || DEFAULT_IMAGE);
        setImageStatus('loaded');
      } else {
        setImageUrl(DEFAULT_IMAGE);
        setImageStatus('fallback');
      }
    } catch (err) {
      setImageUrl(DEFAULT_IMAGE);
      setImageStatus('fallback');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    if (!token) {
      setError('You must be logged in to delete a recipe.');
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/api/recipes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to delete recipe.');
    } finally {
      setLoading(false);
    }
  };

  // This page loads the recipe and performs a best-effort external image lookup.
  // `imageStatus` tracks whether the image was loaded from TheMealDB ('loaded')
  // or whether a placeholder is used ('fallback'). If the external service
  // fails or returns no result we still show the recipe details.

  if (loading) {
    return <div className="container py-4"><div className="alert alert-secondary">Loading recipe...</div></div>;
  }

  if (error) {
    return <div className="container py-4"><div className="alert alert-danger">{error}</div></div>;
  }

  if (!recipe) {
    return <div className="container py-4"><div className="alert alert-warning">Recipe not found.</div></div>;
  }

  const isOwner = user && recipe.user && recipe.user._id === user.id;

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h2 mb-1">{recipe.title}</h1>
          <p className="text-muted mb-0">Created by {recipe.user?.name || 'Unknown'}</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <Link to="/" className="btn btn-outline-secondary">Back to recipes</Link>
          {isOwner && <Link to={`/recipes/${id}/edit`} className="btn btn-primary">Edit Recipe</Link>}
          {isOwner && (
            <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting...' : 'Delete Recipe'}
            </button>
          )}
        </div>
      </div>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="card shadow-sm overflow-hidden">
            <img src={imageUrl} alt={recipe.title} className="card-img-top" />
            <div className="card-body">
              <h4 className="mb-3">Instructions</h4>
              <p className="text-secondary">{recipe.instructions}</p>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="card shadow-sm p-4 h-100">
            <h4 className="mb-3">Ingredients</h4>
            <ul className="list-group list-group-flush">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="list-group-item px-0 border-0 py-2">{ingredient}</li>
              ))}
            </ul>
            {imageStatus === 'fallback' && (
              <div className="alert alert-warning mt-4 mb-0">
                No matching external image was found, so a placeholder image is displayed.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
