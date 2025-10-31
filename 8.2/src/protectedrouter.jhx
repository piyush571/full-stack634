import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthenticated(false);
      setChecking(false);
      return;
    }

    fetch('http://localhost:4000/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setAuthenticated(Boolean(data && data.valid)))
      .catch(() => setAuthenticated(false))
      .finally(() => setChecking(false));
  }, []);

  if (checking) return <div>Checking authentication...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}
