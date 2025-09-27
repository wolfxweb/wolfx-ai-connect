import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Bot, 
  Calendar, 
  Users, 
  HeadphonesIcon, 
  TrendingUp, 
  CheckCircle, 
  ArrowRight,
  Smartphone,
  MessageCircle,
  Zap,
  Target,
  Clock,
  Shield,
  Database
} from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-wolfx.jpg";
import SupabaseTest from "@/components/SupabaseTest";

const Index = () => {
  const services = [
    {
      id: "aai",
      title: "AAI - Agente de Agendamento Inteligente",
      description: "Automatize agendamentos, confirmações e lembretes 24/7",
      icon: Calendar,
      benefits: ["Redução de no-shows", "Agenda otimizada", "Atendimento 24/7"],
      path: "/aai"
    },
    {
      id: "aaq", 
      title: "AAQ - Agente de Atendimento e Qualificação",
      description: "Qualifique leads e otimize o atendimento inicial",
      icon: Users,
      benefits: ["Leads qualificados", "Triagem automática", "Economia de tempo"],
      path: "/aaq"
    },
    {
      id: "asf",
      title: "ASF - Agente de Suporte e FAQ", 
      description: "Suporte 24/7 com respostas imediatas e precisas",
      icon: HeadphonesIcon,
      benefits: ["Suporte 24/7", "Respostas consistentes", "Satisfação do cliente"],
      path: "/asf"
    },
    {
      id: "avf",
      title: "AVF - Agente de Vendas e Fechamento",
      description: "Multiplique suas vendas com IA especializada",
      icon: TrendingUp,
      benefits: ["Aumento de conversões", "Vendas escaláveis", "ROI comprovado"],
      path: "/avf"
    }
  ];

  const problems = [
    "Sobrecarga de atendimento manual",
    "Perda de agendamentos e leads",
    "Tempo gasto em tarefas repetitivas", 
    "Inconsistência no atendimento",
    "Dificuldade para escalar vendas"
  ];

  const clients = [
    { type: "Dentistas", icon: "🦷" },
    { type: "Médicos", icon: "👨‍⚕️" },  
    { type: "Advogados", icon: "⚖️" },
    { type: "Consultores", icon: "💼" },
    { type: "PMEs", icon: "🏢" }
  ];

  const process = [
    { step: "1", title: "Descoberta", description: "Analisamos seu negócio e necessidades" },
    { step: "2", title: "Desenvolvimento", description: "Criamos seu agente personalizado" },
    { step: "3", title: "Lançamento", description: "Implementamos e treinamos sua equipe" },
    { step: "4", title: "Otimização", description: "Monitoramos e aprimoramos continuamente" }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32">
        <div className="hero-content container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-6 accent-button">
                🚀 Líderes em Automação com IA
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
                WolfX: Automação Inteligente para o Crescimento do Seu Negócio no 
                <span className="text-accent"> WhatsApp</span>
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl">
                Implementamos Agentes de IA personalizados que otimizam seu atendimento, 
                agendamento e vendas, liberando seu tempo e impulsionando seus resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button size="lg" className="glow-button text-primary-foreground hover:text-primary-foreground">
                  Agende uma Consultoria Gratuita
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                  Descubra Nossas Soluções
                </Button>
              </div>
            </div>
            <div className="flex justify-center">
              <img 
                src={heroImage} 
                alt="WolfX AI WhatsApp Automation" 
                className="w-full max-w-lg rounded-2xl shadow-elegant"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Problemas que <span className="gradient-text">Resolvemos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Empresas e profissionais liberais enfrentam desafios diários que impactam 
              diretamente na produtividade e resultados.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problems.map((problem, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-destructive rounded-full"></div>
                    <p className="font-medium">{problem}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Nossa <span className="gradient-text">Solução WolfX</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Agentes de IA especializados e personalizados para cada necessidade do seu negócio, 
              com expertise comprovada e resultados mensuráveis.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="card-hover text-center">
              <CardContent className="p-8">
                <Bot className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">IA Personalizada</h3>
                <p className="text-muted-foreground">
                  Cada agente é desenvolvido especificamente para seu negócio e setor
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover text-center">
              <CardContent className="p-8">
                <Clock className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">24/7 Disponível</h3>
                <p className="text-muted-foreground">
                  Atendimento, agendamento e vendas funcionando continuamente
                </p>
              </CardContent>
            </Card>
            <Card className="card-hover text-center">
              <CardContent className="p-8">
                <Target className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Resultados Comprovados</h3>
                <p className="text-muted-foreground">
                  Métricas claras de ROI e melhoria de performance
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Clients Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Para Quem é a <span className="gradient-text">WolfX</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Atendemos empresas e profissionais liberais que buscam otimização e crescimento
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {clients.map((client, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-6">
                  <div className="text-4xl mb-3">{client.icon}</div>
                  <p className="font-semibold">{client.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button className="accent-button">
              Veja Nossas Soluções por Setor
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como <span className="gradient-text">Funciona</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Nosso processo comprovado em 4 etapas para implementar seu Agente de IA
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {process.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center text-primary-foreground text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Nossos <span className="gradient-text">Produtos/Serviços</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Soluções especializadas para cada necessidade do seu negócio
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => (
              <Card key={service.id} className="card-hover">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <service.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{service.title}</CardTitle>
                      <CardDescription className="text-base">
                        {service.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {service.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline" className="bg-primary/5">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {benefit}
                      </Badge>
                    ))}
                  </div>
                  <Link to={service.path}>
                    <Button className="w-full accent-button">
                      Saiba Mais
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="sobre" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Sobre a <span className="gradient-text">WolfX</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Somos especialistas em Inteligência Artificial aplicada a negócios, com foco 
              em automação de processos via WhatsApp. Nossa missão é liberar o potencial 
              de empresas e profissionais através da tecnologia mais avançada do mercado.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Segurança</h3>
                <p className="text-muted-foreground">
                  Dados protegidos com os mais altos padrões de segurança
                </p>
              </div>
              <div className="text-center">
                <Zap className="w-12 h-12 text-accent mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Performance</h3>
                <p className="text-muted-foreground">
                  Otimização contínua para máxima eficiência
                </p>
              </div>
              <div className="text-center">
                <MessageCircle className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Suporte</h3>
                <p className="text-muted-foreground">
                  Acompanhamento dedicado em todas as etapas
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Perguntas <span className="gradient-text">Frequentes</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6">
              {[
                {
                  q: "Como funciona a integração com meu sistema atual?",
                  a: "Nossos agentes se integram facilmente com as principais ferramentas de gestão do mercado através de APIs seguras."
                },
                {
                  q: "Quanto tempo leva para implementar um agente?",
                  a: "O processo completo leva entre 2-4 semanas, dependendo da complexidade e personalização necessária."
                },
                {
                  q: "Os dados dos meus clientes ficam seguros?",
                  a: "Sim, utilizamos criptografia de ponta e seguimos todas as normas da LGPD para proteção de dados."
                },
                {
                  q: "Posso personalizar as respostas do agente?",
                  a: "Absolutamente! Cada agente é totalmente personalizado com a linguagem e tom da sua marca."
                }
              ].map((faq, index) => (
                <Card key={index} className="card-hover">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">{faq.q}</h3>
                    <p className="text-muted-foreground">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Supabase Connection Test */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-4">
              <Database className="h-8 w-8 text-blue-600 mr-3" />
              <h2 className="text-3xl font-bold">Teste de Conexão</h2>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Verifique se o sistema está funcionando corretamente e se a conexão com o Supabase está ativa.
            </p>
          </div>
          
          <div className="flex justify-center">
            <SupabaseTest />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para Automatizar seu Negócio?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Agende uma consultoria gratuita e descubra como a WolfX pode transformar 
            seus resultados com Inteligência Artificial.
          </p>
          <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
            Agende sua Consultoria Gratuita
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;