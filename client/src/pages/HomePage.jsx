import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api.js';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=900&q=80';
const PAGE_LIMIT = 6;

export default function HomePage({ user, token, onLogout }) {
  const [recipes, setRecipes] = useState([]);
  const [recipeImages, setRecipeImages] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecipes, setTotalRecipes] = useState(0);

  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      setError('');
      setRecipeImages({});

      try {
        // Fetch paginated recipes from the backend using the current
        // search term and page selection.
        const response = await api.get('/api/recipes', {
          params: {
            search: activeSearch,
            page: currentPage,
            limit: PAGE_LIMIT,
          },
        });

        const { recipes: items, total, totalPages: pages } = response.data;
        setRecipes(items);
        setTotalRecipes(total);
        setTotalPages(pages);

        const images = await Promise.all(
          items.map(async (recipe) => {
            try {
              const imageResponse = await fetch(
                `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(recipe.title)}`
              );
              if (!imageResponse.ok) return DEFAULT_IMAGE;
              const imageData = await imageResponse.json();
              return imageData?.meals?.[0]?.strMealThumb || DEFAULT_IMAGE;
            } catch {
              return DEFAULT_IMAGE;
            }
          })
        );

        const imageMap = items.reduce((acc, recipe, index) => ({
          ...acc,
          [recipe._id]: images[index],
        }), {});
        setRecipeImages(imageMap);
      } catch (err) {
        setError('Unable to load recipes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [activeSearch, currentPage]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setCurrentPage(1);
    setActiveSearch(searchQuery.trim());
  };

  const handlePageChange = (nextPage) => {
    if (nextPage >= 1 && nextPage <= totalPages) {
      setCurrentPage(nextPage);
    }
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <nav aria-label="Recipe pages" className="mt-4">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" type="button" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              Previous
            </button>
          </li>
          {Array.from({ length: totalPages }, (_, index) => (
            <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
              <button className="page-link" type="button" onClick={() => handlePageChange(index + 1)}>
                {index + 1}
              </button>
            </li>
          ))}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" type="button" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
              Next
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container py-4">
      <section className="hero-banner p-4 mb-4">
        <div className="row align-items-center gy-3">
          <div className="col-lg-8">
            <h1 className="display-6">Share your best recipes with the community.</h1>
            <p className="lead text-secondary mt-3">
              Discover fresh recipes, add your own dishes, and keep everything organized with secure login and easy editing.
            </p>
          </div>
          <div className="col-lg-4 text-lg-end">
            {user ? (
              <Link to="/create" className="btn btn-success btn-lg">Create New Recipe</Link>
            ) : (
              <Link to="/auth" className="btn btn-primary btn-lg">Login or Register</Link>
            )}
          </div>
        </div>
      </section>

      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
        <div>
          <h2 className="h4 mb-1">Latest Recipes</h2>
          <p className="text-muted mb-0">Find something delicious or add your own signature dish.</p>
        </div>
        <div className="d-flex flex-wrap gap-2 align-items-center">
          {user ? (
            <button className="btn btn-outline-secondary" onClick={onLogout}>Logout</button>
          ) : (
            <Link to="/auth" className="btn btn-outline-primary">Sign in to contribute</Link>
          )}
          {user && <Link to="/create" className="btn btn-success">New recipe</Link>}
        </div>
      </div>

      <div className="card mb-4 p-4">
        <form className="row g-3 align-items-center" onSubmit={handleSearchSubmit}>
          <div className="col-md-8">
            <label htmlFor="recipeSearch" className="form-label visually-hidden">
              Search recipes
            </label>
            <input
              id="recipeSearch"
              type="search"
              className="form-control"
              placeholder="Search recipes by title or instructions"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="col-md-4 d-flex gap-2">
            <button className="btn btn-primary w-100" type="submit">Search</button>
            <button
              className="btn btn-outline-secondary w-100"
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveSearch('');
                setCurrentPage(1);
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-3 gap-3">
        <div>
          <h4 className="mb-1">Showing {recipes.length} of {totalRecipes} recipes</h4>
          {activeSearch && <p className="text-muted mb-0">Search term: <strong>{activeSearch}</strong></p>}
        </div>
        <div>
          {totalRecipes > 0 && <p className="text-muted mb-0">Page {currentPage} of {totalPages}</p>}
        </div>
      </div>

      {loading ? (
        <div className="alert alert-secondary">Loading recipes...</div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : recipes.length === 0 ? (
        <div className="alert alert-warning">
          {activeSearch ? 'No recipes matched your search. Try another keyword.' : 'No recipes found. Add one to get started.'}
        </div>
      ) : (
        <>
          <div className="row g-4">
            {recipes.map((recipe) => (
              <div key={recipe._id} className="col-md-6">
                <div className="card recipe-card h-100 overflow-hidden">
                  <div
                    className="recipe-card-image"
                    style={{ backgroundImage: `url(${recipeImages[recipe._id] || DEFAULT_IMAGE})` }}
                  />
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{recipe.title}</h5>
                    <p className="card-text text-secondary mb-4">{recipe.instructions.slice(0, 140)}{recipe.instructions.length > 140 ? '...' : ''}</p>
                    <div className="mt-auto">
                      <p className="mb-2"><small className="text-muted">By {recipe.user?.name || 'Unknown'}</small></p>
                      <Link to={`/recipes/${recipe._id}`} className="btn btn-sm btn-primary">View recipe</Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {renderPagination()}
        </>
      )}
    </div>
  );
}
