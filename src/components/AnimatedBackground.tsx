import React, { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
}

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const isDarkRef = useRef<boolean>(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Verificar tema inicial
    const checkDarkMode = () => {
      isDarkRef.current = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    checkDarkMode()

    // Observar mudanças no tema
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleDarkModeChange = () => {
      isDarkRef.current = darkModeQuery.matches
    }
    darkModeQuery.addEventListener('change', handleDarkModeChange)

    // Função para criar partículas
    const createParticles = () => {
      // Verificar se o canvas tem dimensões válidas
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn('⚠️ Canvas sem dimensões válidas, aguardando...', canvas.width, 'x', canvas.height)
        return
      }
      
      // Garantir pelo menos 30 partículas, máximo 80
      const area = canvas.width * canvas.height
      const particleCount = Math.max(30, Math.min(80, Math.floor(area / 12000)))
      console.log('🎨 Criando partículas:', {
        count: particleCount,
        canvas: `${canvas.width}x${canvas.height}`,
        area: area
      })
      
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 2, // Partículas maiores: 2-5px
        speedX: (Math.random() - 0.5) * 0.8,
        speedY: (Math.random() - 0.5) * 0.8,
        opacity: Math.random() * 0.4 + 0.4 // Opacidade maior: 0.4-0.8
      }))
      console.log('✅ Partículas criadas:', particlesRef.current.length)
    }

    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      
      // Verificar se o canvas tem dimensões válidas
      if (width > 0 && height > 0) {
        canvas.width = width
        canvas.height = height
        // Recriar partículas após redimensionar
        createParticles()
      } else {
        console.warn('⚠️ Canvas sem dimensões válidas:', width, 'x', height)
      }
    }
    
    // Aguardar um frame para garantir que o DOM está pronto
    requestAnimationFrame(() => {
      resizeCanvas()
      
      // Aguardar mais um frame para garantir que as partículas foram criadas
      requestAnimationFrame(() => {
        animate()
      })
    })
    
    window.addEventListener('resize', resizeCanvas)

    // Função de animação
    const animate = () => {
      // Verificar se o canvas tem dimensões válidas
      if (canvas.width === 0 || canvas.height === 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Usar referência do tema (mais eficiente)
      // Cores mais vibrantes e visíveis
      const primaryColor = isDarkRef.current ? '147, 197, 253' : '37, 99, 235' // blue-600 mais visível
      const accentColor = isDarkRef.current ? '59, 130, 246' : '59, 130, 246' // blue-500

      // Verificar se há partículas e se o canvas tem dimensões válidas
      if (particlesRef.current.length === 0 && canvas.width > 0 && canvas.height > 0) {
        console.warn('⚠️ Nenhuma partícula encontrada, recriando...')
        createParticles()
      }
      
      // Se ainda não há partículas, pular este frame
      if (particlesRef.current.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      particlesRef.current.forEach((particle, index) => {
        // Atualizar posição
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Rebater nas bordas
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // Manter partículas dentro do canvas
        particle.x = Math.max(0, Math.min(canvas.width, particle.x))
        particle.y = Math.max(0, Math.min(canvas.height, particle.y))

        // Desenhar partícula com gradiente para mais visibilidade
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size
        )
        gradient.addColorStop(0, `rgba(${primaryColor}, ${particle.opacity})`)
        gradient.addColorStop(1, `rgba(${primaryColor}, ${particle.opacity * 0.3})`)
        
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()

        // Desenhar linhas entre partículas próximas (mais visíveis)
        particlesRef.current.slice(index + 1).forEach(otherParticle => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            // Linhas mais visíveis
            ctx.strokeStyle = `rgba(${accentColor}, ${0.15 * (1 - distance / 150)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        })
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Não iniciar animação aqui - será iniciada após resizeCanvas
    // animate() será chamado dentro do requestAnimationFrame após resizeCanvas

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      darkModeQuery.removeEventListener('change', handleDarkModeChange)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Gradiente animado de fundo */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900" />
        
        {/* Gradientes animados */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDuration: '8s' }} />
          <div className="absolute top-1/2 right-0 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDuration: '12s', animationDelay: '2s' }} />
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl animate-pulse" 
               style={{ animationDuration: '10s', animationDelay: '4s' }} />
        </div>

        {/* Canvas com partículas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 opacity-60 dark:opacity-40"
          style={{ 
            width: '100%', 
            height: '100%',
            pointerEvents: 'none' // Não interferir com cliques
          }}
        />
      </div>
    </>
  )
}

export default AnimatedBackground

