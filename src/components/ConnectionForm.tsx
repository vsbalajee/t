import React, { useState } from 'react';
import { Database, AlertCircle } from 'lucide-react';
import { SupabaseConfig, ConnectionStatus } from '../types/supabase';

interface ConnectionFormProps {
  onConnect: (config: SupabaseConfig) => void;
  status: ConnectionStatus;
  isConnecting: boolean;
}

export default function ConnectionForm({ onConnect, status, isConnecting }: ConnectionFormProps) {
  const [config, setConfig] = useState<SupabaseConfig>({
    url: '',
    anonKey: '',
    serviceKey: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(config);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center mb-6">
          <Database className="w-8 h-8 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Connect to Supabase</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
              Supabase URL
            </label>
            <input
              type="url"
              id="url"
              required
              value={config.url}
              onChange={(e) => setConfig({ ...config, url: e.target.value })}
              placeholder="https://your-project.supabase.co"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="anonKey" className="block text-sm font-medium text-gray-700 mb-2">
              Anonymous Key
            </label>
            <input
              type="password"
              id="anonKey"
              required
              value={config.anonKey}
              onChange={(e) => setConfig({ ...config, anonKey: e.target.value })}
              placeholder="Your anonymous key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label htmlFor="serviceKey" className="block text-sm font-medium text-gray-700 mb-2">
              Service Role Key
            </label>
            <input
              type="password"
              id="serviceKey"
              required
              value={config.serviceKey}
              onChange={(e) => setConfig({ ...config, serviceKey: e.target.value })}
              placeholder="Your service role key"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-2 text-sm text-gray-600">
              Service role key is required for table management operations
            </p>
          </div>
          
          {status.error && (
            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
              <p className="text-red-700">{status.error}</p>
            </div>
          )}
          
          <button
            type="submit"
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isConnecting ? 'Connecting...' : 'Connect to Supabase'}
          </button>
        </form>
      </div>
    </div>
  );
}