'use client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReactNode } from 'react';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [isValid, setIsValid] = useState<boolean | null>(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:5000/verify-token', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Token verification failed');
        }
        return res.json();
      })
      .then(() => {
        setIsValid(true);
      })
      .catch((error) => {
        console.error('Error verifying token:', error);
        localStorage.removeItem('token');
        navigate('/login');
      });
  }, [navigate, setIsValid]);

  if (isValid === null || isValid === false) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
} 