import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight,
  Zap,
  Code,
  Rocket,
  TrendingUp,
  Map,
  Brain,
  Layers,
  Shield,
  BarChart3,
  DollarSign,
  UserCircle,
  Bot,
} from "lucide-react";

const Index = () => {
  const whatsappLink = "https://wa.me/5548988114708";
  const whatsappMessage = "Olá! Gostaria de saber mais sobre as soluções de IA e Automação de Processos da Wolfx.";
  
  const nexusPhases = [
    {
      letter: "N",
      title: "Necessidade e Arquitetura",
      description: "Iniciamos com uma imersão completa nos seus processos e objetivos de negócio. Definimos a arquitetura de software mais robusta e escalável, identificando os pontos críticos onde a IA e a Automação trarão o maior retorno sobre o investimento (ROI).",
      icon: Map,
      color: "text-blue-600"
    },
    {
      letter: "E",
      title: "Execução Ágil e Transparente",
      description: "Utilizamos metodologias ágeis para desenvolver o seu sistema em ciclos curtos e transparentes. O foco é na entrega contínua de valor, garantindo que você acompanhe o progresso e forneça feedback em todas as etapas, desde o MVP (Produto Mínimo Viável) até a versão final.",
      icon: Rocket,
      color: "text-green-600"
    },
    {
      letter: "X",
      title: "X-Factor: IA e Automação",
      description: "Esta é a nossa especialidade. Integramos o X-Factor da Wolfx, que é a aplicação de Inteligência Artificial e Automação de Processos para criar um diferencial competitivo. Seja com chatbots inteligentes, sistemas de recomendação, análise preditiva ou workflows automatizados, seu sistema será autônomo e inteligente.",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      letter: "U",
      title: "Upgrade e Otimização Contínua",
      description: "O lançamento é apenas o começo. Realizamos testes rigorosos de performance e segurança e, mais importante, planejamos o Upgrade Contínuo. Nossos sistemas são projetados para aprender e evoluir, garantindo que a sua plataforma se mantenha otimizada e à frente das tendências tecnológicas.",
      icon: TrendingUp,
      color: "text-orange-600"
    },
    {
      letter: "S",
      title: "Suporte Estratégico",
      description: "Oferecemos um Suporte Estratégico completo, que vai além da manutenção técnica. Nossa equipe atua como um parceiro de tecnologia, fornecendo monitoramento proativo, consultoria para novas funcionalidades e garantia de que sua solução continue gerando valor a longo prazo.",
      icon: Shield,
      color: "text-indigo-600"
    }
  ];

  const specialties = [
    {
      title: "Marketplaces",
      description: "Plataformas personalizadas que conectam compradores e vendedores com IA integrada",
      icon: Code
    },
    {
      title: "SaaS",
      description: "Soluções de software como serviço escaláveis e inteligentes",
      icon: Zap
    },
    {
      title: "Plataformas Personalizadas",
      description: "Sistemas sob medida que atendem às suas necessidades atuais e futuras",
      icon: Layers
    }
  ];

  const aiCapabilities = [
    {
      title: "Otimizar a Tomada de Decisão",
      description: "Com Machine Learning e Analytics avançados",
      icon: BarChart3
    },
    {
      title: "Reduzir Custos Operacionais",
      description: "Através da Automação Inteligente de tarefas repetitivas",
      icon: DollarSign
    },
    {
      title: "Personalizar a Experiência do Usuário",
      description: "Criando interações mais relevantes e engajadoras",
      icon: UserCircle
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32 relative overflow-hidden">
        {/* Animated Robot Icons */}
        <div className="hero-robot-1 absolute">
          <Bot className="w-20 h-20 text-primary-foreground/30" />
        </div>
        <div className="hero-robot-2 absolute">
          <Bot className="w-24 h-24 text-primary-foreground/35" />
        </div>
        <div className="hero-robot-3 absolute">
          <Bot className="w-16 h-16 text-primary-foreground/25" />
        </div>
        
        <div className="hero-content container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 accent-button">
              🤖 Inteligência Artificial e Automação de Processos
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
              Transformamos Tecnologia em Resultado
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Se a sua empresa busca eficiência operacional, inovação disruptiva e sistemas que 
              pensam e agem por você, a Wolfx é o seu parceiro estratégico. Somos especialistas 
              em desenvolver soluções digitais de alto desempenho que integram nativamente 
              Inteligência Artificial (IA) e Automação de Processos (RPA), transformando 
              desafios complexos em vantagens competitivas.
            </p>
            <p className="text-lg text-primary-foreground/80 mb-8 max-w-3xl mx-auto">
              Desenvolvemos Marketplaces, SaaS e plataformas personalizadas que não apenas 
              atendem às suas necessidades atuais, mas que estão prontas para o futuro.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`${whatsappLink}?text=${encodeURIComponent(whatsappMessage)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="glow-button text-primary-foreground hover:text-primary-foreground">
                  Iniciar a Transformação Digital
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Nossas <span className="gradient-text">Especialidades</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desenvolvemos soluções digitais que integram nativamente IA e Automação de Processos
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {specialties.map((specialty, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-8">
                  <specialty.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{specialty.title}</h3>
                  <p className="text-muted-foreground">
                    {specialty.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Identity Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Nossa Identidade: <span className="gradient-text">Engenharia de Precisão e Inovação</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              A Wolfx é composta por uma equipe de engenheiros de software, cientistas de dados e 
              arquitetos de soluções dedicados a construir a próxima geração de sistemas. Nossa 
              expertise reside em aplicar o poder da IA para transformar operações e criar vantagens competitivas.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
              {aiCapabilities.map((capability, index) => (
                <div key={index} className="text-center">
                  <capability.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{capability.title}</h3>
                  <p className="text-muted-foreground">
                    {capability.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Nosso Processo de Desenvolvimento: <span className="gradient-text">A Estrutura NEXUS</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
              Na Wolfx, cada projeto é guiado pela metodologia NEXUS, um framework que garante a entrega 
              de sistemas inteligentes, escaláveis e perfeitamente alinhados aos seus objetivos de negócio.
            </p>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              O processo <strong>NEXUS</strong> (Necessidade, Execução, X-Factor, Upgrade, Suporte) assegura 
              que a sua solução digital seja construída com a máxima precisão e o mais alto nível de inteligência embarcada.
            </p>
          </div>
          <div className="space-y-8 max-w-5xl mx-auto">
            {nexusPhases.map((phase, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <div className="flex items-start space-x-6">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold flex-shrink-0">
                      {phase.letter}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <phase.icon className={`w-6 h-6 ${phase.color}`} />
                        <CardTitle className="text-2xl">{phase.title}</CardTitle>
                      </div>
                      <CardDescription className="text-base mt-4">
                        {phase.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para Transformar Sua Operação com Inteligência?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Não se contente com sistemas comuns. Se você está pronto para automatizar o que é 
            repetitivo e potencializar o que é estratégico com o poder da Inteligência Artificial, 
            a Wolfx é a sua escolha.
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Fale com um de nossos arquitetos de soluções e comece a construir seu sistema inteligente hoje mesmo.
          </p>
          <a 
            href={`${whatsappLink}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Iniciar a Transformação Digital
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Index;