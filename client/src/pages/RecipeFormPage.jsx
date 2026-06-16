import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api.js';

export default function RecipeFormPage({ token, user, editMode = false }) {
  const navigate = useNavigate();
  const { id } = useParams();
  const [title, setTitle] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (editMode && id) {
      const loadRecipe = async () => {
        try {
          const response = await api.get(`/api/recipes/${id}`);
          setTitle(response.data.title);
          setIngredients(response.data.ingredients.join(', '));
          setInstructions(response.data.instructions);
        } catch (err) {
          setError('Unable to load recipe for editing.');
        }
      };
      loadRecipe();
    }
  }, [editMode, id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!title || !ingredients || !instructions) {
      setError('Please complete all fields before submitting.');
      setLoading(false);
      return;
    }

    try {
      const requestConfig = {
        headers: { Authorization: `Bearer ${token}` },
      };
      const payload = { title, ingredients, instructions };
      if (editMode) {
        await api.put(`/api/recipes/${id}`, payload, requestConfig);
        setSuccess('Recipe updated successfully.');
        navigate(`/recipes/${id}`);
      } else {
        const response = await api.post('/api/recipes', payload, requestConfig);
        setSuccess('Recipe created successfully.');
        navigate(`/recipes/${response.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to save recipe.');
    } finally {
      setLoading(false);
    }
  };

  // RecipeFormPage supports creation and editing modes. When editing it
  // preloads the recipe into form fields; on submit it sends the token in
  // the Authorization header so the backend can verify the owner.

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start gap-3 mb-4">
                <div>
                  <h2 className="card-title mb-1">{editMode ? 'Edit Recipe' : 'Create New Recipe'}</h2>
                  <p className="text-muted mb-0">{editMode ? 'Update your recipe details below.' : 'Share a recipe with the community.'}</p>
                </div>
                <div className="text-end">
                  <span className="badge bg-info text-dark">{user?.name || 'Guest'}</span>
                </div>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="form-label">Title</label>
                  <input
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Ingredients (comma separated)</label>
                  <textarea
                    rows="3"
                    className="form-control"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Instructions</label>
                  <textarea
                    rows="8"
                    className="form-control"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary px-4 py-2" disabled={loading}>
                  {loading ? 'Saving...' : editMode ? 'Update Recipe' : 'Create Recipe'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
