import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ShadowArena() {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/shadow-arena/dashboard');
  }, [navigate]);

  return null;
}
