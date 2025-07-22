'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export function ApiTest() {
  const [status, setStatus] = useState('Testing...');
  const [dbStatus, setDbStatus] = useState('Testing...');

  useEffect(() => {
    // Тест здоров'я API
    apiClient.healthCheck().then((result) => {
      if (result.error) {
        setStatus(`❌ API Error: ${result.error}`);
      } else {
        setStatus(`✅ API Connected: ${result.data?.status}`);
      }
    });

    // Тест БД
    apiClient.testDatabase().then((result) => {
      if (result.error) {
        setDbStatus(`❌ DB Error: ${result.error}`);
      } else {
        setDbStatus(`✅ DB Connected: ${result.data?.cards || 0} cards`);
      }
    });
  }, []);

  return (
    <div className="p-4 border rounded-lg bg-white">
      <h3 className="font-bold mb-2">API Connection Status:</h3>
      <p className="mb-2">{status}</p>
      <p>{dbStatus}</p>
    </div>
  );
}
