import React, { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Database, Users, FileText } from 'lucide-react'

export default function SupabaseTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    connection: boolean
    auth: boolean
    tables: boolean
    error?: string
  } | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setResults(null)

    try {
      // Test 1: Basic connection
      const { data: connectionTest, error: connectionError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1)

      const connection = !connectionError

      // Test 2: Auth test
      const { data: authTest, error: authError } = await supabase.auth.getSession()
      const auth = !authError

      // Test 3: Tables test
      const { data: tablesTest, error: tablesError } = await supabase
        .from('categories')
        .select('count')
        .limit(1)

      const tables = !tablesError

      setResults({
        connection,
        auth,
        tables,
        error: connectionError?.message || authError?.message || tablesError?.message
      })
    } catch (error: any) {
      setResults({
        connection: false,
        auth: false,
        tables: false,
        error: error.message
      })
    } finally {
      setTesting(false)
    }
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "OK" : "Erro"}
      </Badge>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-6 w-6" />
          <span>Teste de Conexão Supabase</span>
        </CardTitle>
        <CardDescription>
          Verifique se a conexão com o Supabase está funcionando corretamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {testing ? 'Testando...' : 'Testar Conexão'}
        </Button>

        {results && (
          <div className="space-y-4">
            {/* Connection Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(results.connection)}
                <div>
                  <div className="font-medium">Conexão com Banco</div>
                  <div className="text-sm text-muted-foreground">
                    Teste básico de conectividade
                  </div>
                </div>
              </div>
              {getStatusBadge(results.connection)}
            </div>

            {/* Auth Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(results.auth)}
                <div>
                  <div className="font-medium">Sistema de Autenticação</div>
                  <div className="text-sm text-muted-foreground">
                    Supabase Auth funcionando
                  </div>
                </div>
              </div>
              {getStatusBadge(results.auth)}
            </div>

            {/* Tables Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(results.tables)}
                <div>
                  <div className="font-medium">Tabelas do Sistema</div>
                  <div className="text-sm text-muted-foreground">
                    Tabelas profiles, categories, blog_posts
                  </div>
                </div>
              </div>
              {getStatusBadge(results.tables)}
            </div>

            {/* Error Message */}
            {results.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Erro:</strong> {results.error}
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {results.connection && results.auth && results.tables && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sucesso!</strong> Todas as conexões estão funcionando corretamente.
                  Você pode usar o sistema de autenticação e blog normalmente.
                </AlertDescription>
              </Alert>
            )}

            {/* Troubleshooting */}
            {!results.connection && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Problema de Conexão:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Verifique se as variáveis de ambiente estão corretas</li>
                    <li>Confirme se o projeto existe no Supabase</li>
                    <li>Execute o arquivo <code>supabase-setup.sql</code></li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {!results.auth && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Problema de Autenticação:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Execute o arquivo <code>supabase-auth-config.sql</code></li>
                    <li>Verifique se email signups está habilitado</li>
                    <li>Confirme as configurações de Auth no painel</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {!results.tables && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Problema com Tabelas:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    <li>Execute o arquivo <code>supabase-setup.sql</code></li>
                    <li>Verifique se as tabelas foram criadas</li>
                    <li>Confirme as políticas RLS</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <div><strong>URL:</strong> {import.meta.env.VITE_SUPABASE_URL}</div>
          <div><strong>Chave:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20)}...</div>
        </div>
      </CardContent>
    </Card>
  )
}

