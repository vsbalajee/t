import React, { useState, useEffect } from 'react';
import { Plus, Table, Eye, Edit, Trash2, RefreshCw } from 'lucide-react';
import { SupabaseConfig, TableInfo } from '../types/supabase';
import CreateTableForm from './CreateTableForm';
import TableViewer from './TableViewer';
import SQLEditor from './SQLEditor';

interface TableManagerProps {
  config: SupabaseConfig;
}

export default function TableManager({ config }: TableManagerProps) {
  const [tables, setTables] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'tables' | 'create' | 'sql'>('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.url}/rest/v1/`, {
        headers: {
          'apikey': config.serviceKey,
          'Authorization': `Bearer ${config.serviceKey}`,
        }
      });

      if (response.ok) {
        const data = await response.json();
        const tableNames = data.definitions ? Object.keys(data.definitions) : [];
        setTables(tableNames.filter(name => !name.startsWith('auth.') && !name.startsWith('storage.')));
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTableCreated = () => {
    fetchTables();
    setActiveTab('tables');
  };

  const deleteTable = async (tableName: string) => {
    if (!confirm(`Are you sure you want to delete table "${tableName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`${config.url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceKey,
          'Authorization': `Bearer ${config.serviceKey}`,
        },
        body: JSON.stringify({
          sql: `DROP TABLE IF EXISTS "${tableName}";`
        })
      });

      if (response.ok) {
        fetchTables();
        if (selectedTable === tableName) {
          setSelectedTable(null);
        }
      }
    } catch (error) {
      console.error('Error deleting table:', error);
    }
  };

  const tabs = [
    { id: 'tables' as const, label: 'Tables', icon: Table },
    { id: 'create' as const, label: 'Create Table', icon: Plus },
    { id: 'sql' as const, label: 'SQL Editor', icon: Edit }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Supabase Admin</h1>
          <p className="text-gray-600 mt-2">Table Management</p>
        </div>
        
        <nav className="px-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg mb-2 transition-colors duration-200 ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.label}
            </button>
          ))}
        </nav>

        {activeTab === 'tables' && (
          <div className="px-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-900">Your Tables</h3>
              <button
                onClick={fetchTables}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="space-y-2">
                {tables.map((table) => (
                  <div key={table} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium text-gray-900">{table}</span>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setSelectedTable(table)}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteTable(table)}
                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {tables.length === 0 && !loading && (
                  <p className="text-gray-500 text-sm">No tables found</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'tables' && !selectedTable && (
            <div className="text-center py-12">
              <Table className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Table Management</h2>
              <p className="text-gray-600 mb-6">Select a table from the sidebar to view its details</p>
            </div>
          )}
          
          {activeTab === 'tables' && selectedTable && (
            <TableViewer
              config={config}
              tableName={selectedTable}
              onClose={() => setSelectedTable(null)}
            />
          )}
          
          {activeTab === 'create' && (
            <CreateTableForm config={config} onTableCreated={handleTableCreated} />
          )}
          
          {activeTab === 'sql' && (
            <SQLEditor config={config} />
          )}
        </div>
      </div>
    </div>
  );
}