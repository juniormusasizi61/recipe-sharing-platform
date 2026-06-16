import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api.js';

export default function AuthPage({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = isRegister ? '/api/auth/register' : '/api/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const response = await api.post(url, payload);
      onLogin(response.data);
      navigate('/');
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('Unable to complete authentication. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // handleSubmit sends credentials to the backend and calls `onLogin`
  // with the returned `{ token, user }` payload when successful.

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <div className="card shadow-sm">
            <div className="card-body p-5">
              <h2 className="card-title mb-3">{isRegister ? 'Create an account' : 'Welcome back'}</h2>
              <p className="text-muted mb-4">
                {isRegister ? 'Register to start sharing recipes with the community.' : 'Log in to manage your favorite recipes.'}
              </p>
              {error && <div className="alert alert-danger">{error}</div>}
              <form onSubmit={handleSubmit}>
                {isRegister && (
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input
                      className="form-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button className="btn btn-primary w-100 py-2" disabled={loading}>
                  {loading ? 'Submitting...' : isRegister ? 'Register' : 'Login'}
                </button>
              </form>
              <div className="mt-4 text-center">
                <button className="btn btn-link" onClick={() => setIsRegister(!isRegister)}>
                  {isRegister ? 'Already have an account? Login' : 'Need an account? Register'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
