import React, { useState } from 'react';
import { Plus, X, Save } from 'lucide-react';
import { SupabaseConfig, TableColumn } from '../types/supabase';

interface CreateTableFormProps {
  config: SupabaseConfig;
  onTableCreated: () => void;
}

const DATA_TYPES = [
  'text', 'varchar', 'integer', 'bigint', 'decimal', 'real', 'boolean',
  'date', 'time', 'timestamp', 'timestamptz', 'uuid', 'json', 'jsonb'
];

export default function CreateTableForm({ config, onTableCreated }: CreateTableFormProps) {
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState<TableColumn[]>([
    { name: 'id', type: 'uuid', nullable: false, primary: true, default: 'gen_random_uuid()' }
  ]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addColumn = () => {
    setColumns([...columns, { name: '', type: 'text', nullable: true }]);
  };

  const removeColumn = (index: number) => {
    setColumns(columns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, field: keyof TableColumn, value: any) => {
    const newColumns = [...columns];
    newColumns[index] = { ...newColumns[index], [field]: value };
    setColumns(newColumns);
  };

  const createTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tableName.trim()) return;

    setCreating(true);
    setError(null);

    try {
      const columnDefs = columns.map(col => {
        let def = `"${col.name}" ${col.type}`;
        if (col.primary) def += ' PRIMARY KEY';
        if (!col.nullable) def += ' NOT NULL';
        if (col.default) def += ` DEFAULT ${col.default}`;
        return def;
      }).join(', ');

      const sql = `CREATE TABLE "${tableName}" (${columnDefs});`;

      const response = await fetch(`${config.url}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': config.serviceKey,
          'Authorization': `Bearer ${config.serviceKey}`,
        },
        body: JSON.stringify({ sql })
      });

      if (response.ok) {
        onTableCreated();
        setTableName('');
        setColumns([{ name: 'id', type: 'uuid', nullable: false, primary: true, default: 'gen_random_uuid()' }]);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create table');
      }
    } catch (err) {
      setError('Error creating table');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Table</h2>
        
        <form onSubmit={createTable} className="space-y-6">
          <div>
            <label htmlFor="tableName" className="block text-sm font-medium text-gray-700 mb-2">
              Table Name
            </label>
            <input
              type="text"
              id="tableName"
              required
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter table name"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Columns</h3>
              <button
                type="button"
                onClick={addColumn}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </button>
            </div>

            <div className="space-y-4">
              {columns.map((column, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={column.name}
                      onChange={(e) => updateColumn(index, 'name', e.target.value)}
                      placeholder="Column name"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="w-32">
                    <select
                      value={column.type}
                      onChange={(e) => updateColumn(index, 'type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    >
                      {DATA_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={!column.nullable}
                        onChange={(e) => updateColumn(index, 'nullable', !e.target.checked)}
                        className="mr-2"
                      />
                      Required
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={column.primary || false}
                        onChange={(e) => updateColumn(index, 'primary', e.target.checked)}
                        className="mr-2"
                      />
                      Primary
                    </label>
                  </div>
                  
                  <div className="w-32">
                    <input
                      type="text"
                      value={column.default || ''}
                      onChange={(e) => updateColumn(index, 'default', e.target.value)}
                      placeholder="Default value"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  {columns.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColumn(index)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={creating || !tableName.trim()}
            className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {creating ? 'Creating...' : 'Create Table'}
          </button>
        </form>
      </div>
    </div>
  );
}