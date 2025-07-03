import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Cloud } from 'lucide-react'
import { testSupabaseConnection, testSupabaseStorage } from '../lib/supabase'

interface BackendStatusProps {
  onStatusChange?: (status: { database: boolean; storage: boolean }) => void
}

export function BackendStatus({ onStatusChange }: BackendStatusProps) {
  const [dbStatus, setDbStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [storageStatus, setStorageStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [testing, setTesting] = useState(false)

  const runTests = async () => {
    setTesting(true)
    
    try {
      const [dbResult, storageResult] = await Promise.all([
        testSupabaseConnection(),
        testSupabaseStorage()
      ])
      
      setDbStatus(dbResult)
      setStorageStatus(storageResult)
      
      if (onStatusChange) {
        onStatusChange({
          database: dbResult.success,
          storage: storageResult.success
        })
      }
    } catch (error) {
      setDbStatus({ success: false, message: 'Błąd testowania połączenia' })
      setStorageStatus({ success: false, message: 'Błąd testowania storage' })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    runTests()
  }, [])

  const getStatusIcon = (status: { success: boolean } | null) => {
    if (!status) return <AlertCircle className="h-5 w-5 text-gray-400" />
    return status.success 
      ? <CheckCircle className="h-5 w-5 text-green-400" />
      : <XCircle className="h-5 w-5 text-red-400" />
  }

  const getStatusColor = (status: { success: boolean } | null) => {
    if (!status) return 'border-gray-500/20 bg-gray-500/10'
    return status.success 
      ? 'border-green-500/20 bg-green-500/10'
      : 'border-red-500/20 bg-red-500/10'
  }

  return (
    <div className="mb-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <Database className="h-5 w-5 mr-2" />
          Status Backend
        </h3>
        <button
          onClick={runTests}
          disabled={testing}
          className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-1 ${testing ? 'animate-spin' : ''}`} />
          {testing ? 'Testowanie...' : 'Sprawdź'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Database Status */}
        <div className={`p-3 rounded-lg border ${getStatusColor(dbStatus)}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(dbStatus)}
            <div className="flex-1">
              <h4 className="font-medium text-white">Baza danych</h4>
              <p className="text-sm text-gray-300">
                {dbStatus?.message || 'Sprawdzanie...'}
              </p>
            </div>
          </div>
        </div>

        {/* Storage Status */}
        <div className={`p-3 rounded-lg border ${getStatusColor(storageStatus)}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(storageStatus)}
            <div className="flex-1">
              <h4 className="font-medium text-white">Storage</h4>
              <p className="text-sm text-gray-300">
                {storageStatus?.message || 'Sprawdzanie...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <h4 className="font-medium text-blue-300 mb-2 flex items-center">
          <Cloud className="h-4 w-4 mr-2" />
          Konfiguracja
        </h4>
        <div className="text-sm text-blue-200 space-y-1">
          <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'BRAK'}</p>
          <p><strong>API Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Ustawiony' : '❌ BRAK'}</p>
        </div>
      </div>

      {/* Troubleshooting */}
      {(!dbStatus?.success || !storageStatus?.success) && (
        <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <h4 className="font-medium text-yellow-300 mb-2">🔧 Rozwiązywanie problemów</h4>
          <div className="text-sm text-yellow-200 space-y-1">
            <p>• Sprawdź czy zmienne środowiskowe są ustawione w pliku .env</p>
            <p>• Upewnij się że projekt Supabase jest aktywny</p>
            <p>• Sprawdź czy bucket 'videos' istnieje w Storage</p>
            <p>• Zweryfikuj polityki RLS w bazie danych</p>
          </div>
        </div>
      )}
    </div>
  )
}