import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Loader2, Facebook, Globe, Activity } from 'lucide-react'

export default function TagsTest() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<{
    metaPixel: boolean
    gtm: boolean
    dataLayer: boolean
    errors: string[]
  } | null>(null)

  const testTags = async () => {
    setTesting(true)
    setResults(null)

    // Aguardar um pouco para as tags carregarem
    await new Promise(resolve => setTimeout(resolve, 1000))

    const errors: string[] = []
    const results: {
      metaPixel: boolean
      gtm: boolean
      dataLayer: boolean
      errors: string[]
    } = {
      metaPixel: false,
      gtm: false,
      dataLayer: false,
      errors: []
    }

    try {
      // Test 1: Meta Pixel
      if (typeof (window as any).fbq !== 'undefined') {
        results.metaPixel = true
        console.log('✅ Meta Pixel encontrado')
      } else {
        results.metaPixel = false
        errors.push('Meta Pixel não encontrado. Verifique se o script está carregando.')
      }

      // Test 2: Google Tag Manager
      if (typeof (window as any).google_tag_manager !== 'undefined') {
        results.gtm = true
        console.log('✅ Google Tag Manager encontrado')
      } else {
        results.gtm = false
        errors.push('Google Tag Manager não encontrado. Verifique se o script está carregando.')
      }

      // Test 3: DataLayer
      if ((window as any).dataLayer && Array.isArray((window as any).dataLayer)) {
        results.dataLayer = true
        console.log('✅ DataLayer encontrado')
      } else {
        results.dataLayer = false
        errors.push('DataLayer não encontrado. Verifique se o GTM está carregando.')
      }

      results.errors = errors
      setResults(results)
    } catch (error: any) {
      setResults({
        metaPixel: false,
        gtm: false,
        dataLayer: false,
        errors: [error.message || 'Erro ao testar tags']
      })
    } finally {
      setTesting(false)
    }
  }

  useEffect(() => {
    // Testar automaticamente ao carregar
    testTags()
  }, [])

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

  const getTagDetails = () => {
    const details: any = {}
    
    // Meta Pixel details
    if (typeof (window as any).fbq !== 'undefined') {
      details.metaPixel = {
        loaded: true,
        queue: (window as any).fbq.queue || [],
        pixelId: '293459357'
      }
    }

    // GTM details
    if ((window as any).dataLayer) {
      details.gtm = {
        loaded: true,
        dataLayer: (window as any).dataLayer,
        containerId: 'GTM-N5XM6DN',
        events: (window as any).dataLayer.filter((item: any) => item.event) || []
      }
    }

    if ((window as any).google_tag_manager) {
      details.gtm.containers = Object.keys((window as any).google_tag_manager)
    }

    return details
  }

  const tagDetails = getTagDetails()

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-6 w-6" />
          <span>Teste de Tags - Meta Pixel e Google Tag Manager</span>
        </CardTitle>
        <CardDescription>
          Verifique se as tags estão carregando corretamente
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <button
          onClick={testTags}
          disabled={testing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />}
          {testing ? 'Testando...' : 'Testar Tags Novamente'}
        </button>

        {results && (
          <div className="space-y-4">
            {/* Meta Pixel Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Facebook className="h-5 w-5 text-blue-600" />
                {getStatusIcon(results.metaPixel)}
                <div>
                  <div className="font-medium">Meta Pixel (Facebook)</div>
                  <div className="text-sm text-muted-foreground">
                    Pixel ID: 293459357
                  </div>
                </div>
              </div>
              {getStatusBadge(results.metaPixel)}
            </div>

            {/* Google Tag Manager Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="h-5 w-5 text-orange-600" />
                {getStatusIcon(results.gtm)}
                <div>
                  <div className="font-medium">Google Tag Manager</div>
                  <div className="text-sm text-muted-foreground">
                    Container ID: GTM-N5XM6DN
                  </div>
                </div>
              </div>
              {getStatusBadge(results.gtm)}
            </div>

            {/* DataLayer Test */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-green-600" />
                {getStatusIcon(results.dataLayer)}
                <div>
                  <div className="font-medium">DataLayer</div>
                  <div className="text-sm text-muted-foreground">
                    Eventos e dados do GTM
                  </div>
                </div>
              </div>
              {getStatusBadge(results.dataLayer)}
            </div>

            {/* Error Messages */}
            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Erros encontrados:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {results.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Success Message */}
            {results.metaPixel && results.gtm && results.dataLayer && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Sucesso!</strong> Todas as tags estão carregando corretamente.
                  Verifique o console do navegador (F12) para mais detalhes.
                </AlertDescription>
              </Alert>
            )}

            {/* Tag Details */}
            {tagDetails.metaPixel && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">Meta Pixel Details:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(tagDetails.metaPixel, null, 2)}
                </pre>
              </div>
            )}

            {tagDetails.gtm && (
              <div className="p-4 border rounded-lg bg-gray-50">
                <h4 className="font-semibold mb-2">GTM Details:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify({
                    containerId: tagDetails.gtm.containerId,
                    eventsCount: tagDetails.gtm.events?.length || 0,
                    dataLayerLength: tagDetails.gtm.dataLayer?.length || 0
                  }, null, 2)}
                </pre>
              </div>
            )}

            {/* Troubleshooting */}
            {(!results.metaPixel || !results.gtm || !results.dataLayer) && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Problemas Detectados:</strong>
                  <ul className="mt-2 list-disc list-inside space-y-1">
                    {!results.metaPixel && (
                      <li>Meta Pixel não está carregando. Verifique o console do navegador.</li>
                    )}
                    {!results.gtm && (
                      <li>Google Tag Manager não está carregando. Verifique o console do navegador.</li>
                    )}
                    {!results.dataLayer && (
                      <li>DataLayer não está disponível. Verifique se o GTM está configurado corretamente.</li>
                    )}
                    <li>Desative bloqueadores de anúncios (uBlock, AdBlock)</li>
                    <li>Limpe o cache do navegador</li>
                    <li>Verifique se os IDs estão corretos no index.html</li>
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Console Commands */}
            <div className="p-4 border rounded-lg bg-blue-50">
              <h4 className="font-semibold mb-2">Comandos para o Console (F12):</h4>
              <div className="text-xs space-y-1 font-mono">
                <div>// Verificar Meta Pixel</div>
                <div className="text-gray-600">typeof fbq !== 'undefined'</div>
                <div className="mt-2">// Verificar GTM</div>
                <div className="text-gray-600">window.dataLayer</div>
                <div className="mt-2">// Verificar eventos</div>
                <div className="text-gray-600">window.dataLayer.filter(i =&gt; i.event)</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

