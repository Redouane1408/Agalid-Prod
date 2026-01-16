import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function IntegrationCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Traitement de la connexion...');
  
  useEffect(() => {
    const code = searchParams.get('code');
    const provider = localStorage.getItem('pending_integration_provider');

    if (!code || !provider) {
      setStatus('Erreur: Code ou provider manquant.');
      setTimeout(() => navigate('/dashboard'), 3000);
      return;
    }

    const connect = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/integrations/oauth-callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ provider, code })
        });

        if (res.ok) {
          setStatus('Connexion réussie ! Redirection...');
          localStorage.removeItem('pending_integration_provider');
          setTimeout(() => navigate('/dashboard'), 1500);
        } else {
          throw new Error('Échec de la connexion');
        }
      } catch (error) {
        setStatus('Erreur lors de la connexion.');
        console.error(error);
        setTimeout(() => navigate('/dashboard'), 3000);
      }
    };

    connect();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
      <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
      <h2 className="text-xl font-semibold">{status}</h2>
    </div>
  );
}
