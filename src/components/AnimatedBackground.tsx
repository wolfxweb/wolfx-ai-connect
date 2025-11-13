import React, { useEffect, useRef, useState } from 'react'
import { Bot } from 'lucide-react'

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  rotation: number
  rotationSpeed: number
  id: number
}

const AnimatedBackground = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const animationFrameRef = useRef<number>()
  const isDarkRef = useRef<boolean>(false)
  const lastUpdateTimeRef = useRef<number>(0)
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

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
      const width = window.innerWidth
      const height = window.innerHeight
      
      if (width === 0 || height === 0) {
        console.warn('⚠️ Container sem dimensões válidas, aguardando...', width, 'x', height)
        return
      }
      
      // Garantir pelo menos 20 partículas, máximo 50 (menos que canvas para performance)
      const area = width * height
      const particleCount = Math.max(20, Math.min(50, Math.floor(area / 15000)))
      
      console.log('🎨 Criando partículas com ícones de robô:', {
        count: particleCount,
        container: `${width}x${height}`,
        area: area
      })
      
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, index) => ({
        id: index,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 8 + 12, // Tamanhos maiores: 12-20px
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.3 + 0.2, // Opacidade: 0.2-0.5
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 2 // Rotação lenta: -1 a 1 grau por frame
      }))
      
      particlesRef.current = newParticles
      setParticles(newParticles)
      console.log('✅ Partículas criadas:', newParticles.length)
    }

    // Função de animação
    const updateInterval = 1000 / 30 // 30 FPS para melhor performance

    const animate = (currentTime: number) => {
      const width = window.innerWidth
      const height = window.innerHeight

      if (width === 0 || height === 0 || particlesRef.current.length === 0) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }

      // Limitar atualizações a 30 FPS
      if (currentTime - lastUpdateTimeRef.current < updateInterval) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      lastUpdateTimeRef.current = currentTime

      // Atualizar posições e rotações
      particlesRef.current = particlesRef.current.map(particle => {
        let newX = particle.x + particle.speedX
        let newY = particle.y + particle.speedY
        let newSpeedX = particle.speedX
        let newSpeedY = particle.speedY

        // Rebater nas bordas
        if (newX < 0 || newX > width) {
          newSpeedX *= -1
          newX = Math.max(0, Math.min(width, newX))
        }
        if (newY < 0 || newY > height) {
          newSpeedY *= -1
          newY = Math.max(0, Math.min(height, newY))
        }

        // Manter partículas dentro do container
        newX = Math.max(0, Math.min(width, newX))
        newY = Math.max(0, Math.min(height, newY))

        return {
          ...particle,
          x: newX,
          y: newY,
          speedX: newSpeedX,
          speedY: newSpeedY,
          rotation: particle.rotation + particle.rotationSpeed
        }
      })

      // Atualizar estado para re-renderizar (limitado a 30 FPS)
      setParticles([...particlesRef.current])

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Inicializar partículas
    const init = () => {
      createParticles()
      // Aguardar um frame antes de iniciar animação
      requestAnimationFrame((time) => {
        animate(time)
      })
    }

    // Inicializar quando o componente monta
    init()

    // Recriar partículas quando a janela redimensiona
    const handleResize = () => {
      createParticles()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      darkModeQuery.removeEventListener('change', handleDarkModeChange)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Gradiente animado de fundo */}
      <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
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

        {/* Partículas com ícones de robô */}
        {particles.map(particle => (
          <div
            key={particle.id}
            className="absolute transition-none pointer-events-none"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              transform: `translate(-50%, -50%) rotate(${particle.rotation}deg)`,
              opacity: particle.opacity,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
            }}
          >
            <Bot 
              className="w-full h-full text-blue-600/30 dark:text-blue-300/40" 
              style={{ 
                filter: 'drop-shadow(0 0 1px rgba(37, 99, 235, 0.2))',
              }}
            />
          </div>
        ))}
      </div>
    </>
  )
}

export default AnimatedBackground
