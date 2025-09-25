import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  HeadphonesIcon, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  MessageCircle,
  Users,
  Zap,
  Shield,
  AlertCircle,
  UserCheck
} from "lucide-react";

const ASF = () => {
  const problems = [
    {
      icon: Users,
      title: "Equipe Sobrecarregada",
      description: "Time de suporte não consegue atender todos os clientes rapidamente"
    },
    {
      icon: Clock,
      title: "Clientes Esperando",
      description: "Tempo de resposta alto gera insatisfação e perda de clientes"
    },
    {
      icon: AlertCircle,
      title: "Respostas Inconsistentes",
      description: "Diferentes atendentes dão informações conflitantes sobre os mesmos assuntos"
    }
  ];

  const features = [
    {
      title: "FAQ Automatizado",
      description: "Responde instantaneamente às perguntas mais frequentes dos clientes"
    },
    {
      title: "Direcionamento Inteligente",
      description: "Encaminha para atendimento humano apenas quando necessário"
    },
    {
      title: "Base de Conhecimento",
      description: "Acesso a informações atualizadas sobre produtos e serviços"
    },
    {
      title: "Respostas Padronizadas",
      description: "Garante consistência nas informações fornecidas aos clientes"
    }
  ];

  const benefits = [
    {
      metric: "85%",
      description: "Redução de custos com suporte"
    },
    {
      metric: "24/7",
      description: "Disponibilidade total"
    },
    {
      metric: "30s",
      description: "Tempo médio de resposta"
    },
    {
      metric: "95%",
      description: "Satisfação do cliente"
    }
  ];

  const useCases = [
    {
      industry: "E-commerce",
      scenario: "Dúvidas sobre produtos e entregas",
      benefit: "Reduz 80% das consultas básicas ao suporte"
    },
    {
      industry: "SaaS/Software",
      scenario: "Suporte técnico e como usar",
      benefit: "Resolve problemas comuns instantaneamente"
    },
    {
      industry: "Serviços Financeiros",
      scenario: "Informações sobre produtos",
      benefit: "Atendimento seguro e padronizado 24/7"
    }
  ];

  const testimonials = [
    {
      name: "Carlos Eduardo",
      specialty: "CEO - Loja Online",
      text: "O ASF transformou nosso atendimento. Os clientes recebem respostas imediatas e nossa equipe pode focar em casos mais complexos. A satisfação aumentou muito!",
      result: "90% menos tickets básicos"
    },
    {
      name: "Patricia Lima",
      specialty: "Gerente de CS - Fintech",
      text: "Implementamos o ASF e nosso NPS subiu 25 pontos. Os clientes adoram ter respostas rápidas e precisas a qualquer hora do dia.",
      result: "NPS +25 pontos"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Mapeamento do FAQ",
      description: "Identificamos as principais dúvidas e necessidades dos seus clientes"
    },
    {
      step: "2", 
      title: "Construção da Base",
      description: "Criamos uma base de conhecimento completa e estruturada"
    },
    {
      step: "3",
      title: "Configuração de Fluxos",
      description: "Definimos quando direcionar para humanos e quando resolver automaticamente"
    },
    {
      step: "4",
      title: "Monitoramento",
      description: "Acompanhamos performance e atualizamos conteúdos continuamente"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32">
        <div className="hero-content container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 accent-button">
              <HeadphonesIcon className="w-4 h-4 mr-2" />
              Suporte Inteligente
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
              WolfX ASF: Suporte 24/7 e Respostas Imediatas no WhatsApp para 
              <span className="text-accent"> Pequenas e Médias Empresas</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Um Agente de IA que automatiza as respostas às perguntas frequentes, 
              liberando sua equipe de suporte e garantindo satisfação do cliente a qualquer hora.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow-button text-primary-foreground hover:text-primary-foreground">
                Experimente o ASF
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                Fale com um Especialista
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Problemas que o <span className="gradient-text">ASF Resolve</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Pequenas e médias empresas enfrentam desafios específicos com atendimento ao cliente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {problems.map((problem, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-8">
                  <problem.icon className="w-12 h-12 text-destructive mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-3">{problem.title}</h3>
                  <p className="text-muted-foreground">{problem.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How ASF Helps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como o <span className="gradient-text">ASF Ajuda</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades inteligentes que transformam seu suporte ao cliente
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Casos de <span className="gradient-text">Sucesso</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Veja como diferentes empresas utilizam o ASF
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {useCases.map((useCase, index) => (
              <Card key={index} className="card-hover">
                <CardHeader>
                  <CardTitle className="text-xl">{useCase.industry}</CardTitle>
                  <CardDescription className="text-base">
                    {useCase.scenario}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-muted-foreground">{useCase.benefit}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Benefícios <span className="gradient-text">Comprovados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Resultados reais de empresas que implementaram o ASF
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="card-hover text-center">
                <CardContent className="p-6">
                  <div className="text-4xl font-bold text-primary mb-2">{benefit.metric}</div>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Processo de <span className="gradient-text">Implementação</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              4 etapas para ter seu ASF funcionando 24/7
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

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              O que nossos <span className="gradient-text">Clientes Dizem</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover">
                <CardContent className="p-8">
                  <div className="mb-6">
                    <p className="text-lg italic mb-4">"{testimonial.text}"</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-muted-foreground">{testimonial.specialty}</p>
                      </div>
                      <Badge className="accent-button">
                        {testimonial.result}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary/50">
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
                  q: "O ASF consegue lidar com quantas perguntas por dia?",
                  a: "Não há limite! O ASF pode responder milhares de perguntas simultaneamente, escalando conforme sua demanda cresce."
                },
                {
                  q: "Como atualizo as respostas quando mudo produtos/serviços?",
                  a: "Oferecemos um painel simples onde você pode atualizar informações ou podemos fazer isso por você através de nosso suporte especializado."
                },
                {
                  q: "O ASF funciona integrado com help desk?",
                  a: "Sim, integramos com os principais sistemas de help desk do mercado, criando tickets automáticos quando necessário."
                },
                {
                  q: "E se o cliente não ficar satisfeito com a resposta automática?",
                  a: "O ASF identifica insatisfação e direciona imediatamente para atendimento humano, garantindo que nenhum cliente fique sem solução."
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-6">
            Pronto para Ter Suporte 24/7?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Experimente o ASF gratuitamente e veja como pode transformar 
            a experiência dos seus clientes e otimizar sua equipe de suporte.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Solicite uma Demonstração Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Fale com um Especialista
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ASF;