import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Filter, 
  CheckCircle, 
  ArrowRight,
  MessageSquare,
  Target,
  Clock,
  TrendingUp,
  AlertTriangle,
  FileSearch
} from "lucide-react";

const AAQ = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Leads Desqualificados",
      description: "Tempo perdido com prospects que não têm perfil ou orçamento para seus serviços"
    },
    {
      icon: Clock,
      title: "Perguntas Repetitivas",
      description: "Equipe sobrecarregada respondendo sempre as mesmas dúvidas básicas"
    },
    {
      icon: Target,
      title: "Oportunidades Perdidas",
      description: "Leads qualificados abandonam o processo por falta de resposta rápida"
    }
  ];

  const features = [
    {
      title: "Triagem Inteligente",
      description: "Qualifica automaticamente leads com base em critérios pré-definidos"
    },
    {
      title: "FAQ Automatizado",
      description: "Responde instantaneamente às perguntas mais frequentes"
    },
    {
      title: "Coleta de Informações",
      description: "Obtém dados preliminares importantes antes do contato humano"
    },
    {
      title: "Classificação de Prioridade",
      description: "Identifica e prioriza leads com maior potencial de conversão"
    }
  ];

  const benefits = [
    {
      metric: "75%",
      description: "Aumento na qualificação de leads"
    },
    {
      metric: "60%",
      description: "Redução de tempo da equipe"
    },
    {
      metric: "90%",
      description: "Respostas em menos de 1 minuto"
    },
    {
      metric: "45%",
      description: "Melhoria na taxa de conversão"
    }
  ];

  const useCases = [
    {
      industry: "Escritórios de Advocacia",
      scenario: "Triagem de casos jurídicos",
      benefit: "Foca apenas em casos com potencial real"
    },
    {
      industry: "Consultorias",
      scenario: "Qualificação de prospects",
      benefit: "Identifica empresas com orçamento adequado"
    },
    {
      industry: "Serviços Médicos",
      scenario: "Pré-atendimento",
      benefit: "Coleta sintomas e histórico antes da consulta"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Roberto Mendes",
      specialty: "Advogado Trabalhista",
      text: "O AAQ revolucionou meu escritório. Agora só atendo casos realmente viáveis e minha equipe tem mais tempo para se dedicar aos clientes importantes.",
      result: "80% mais casos qualificados"
    },
    {
      name: "Maria Santos",
      specialty: "Consultora de RH",
      text: "Não consigo mais imaginar meu negócio sem o AAQ. Ele filtra perfeitamente os leads e já entrega informações valiosas para minha abordagem.",
      result: "65% menos tempo em triagem"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Definição de Critérios",
      description: "Estabelecemos os parâmetros de qualificação específicos do seu negócio"
    },
    {
      step: "2", 
      title: "Configuração da Triagem",
      description: "Criamos fluxos inteligentes de perguntas e respostas automatizadas"
    },
    {
      step: "3",
      title: "Treinamento da IA",
      description: "Alimentamos o sistema com seu conhecimento e melhores práticas"
    },
    {
      step: "4",
      title: "Monitoramento",
      description: "Acompanhamos performance e otimizamos continuamente"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32">
        <div className="hero-content container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 accent-button">
              <Users className="w-4 h-4 mr-2" />
              Qualificação Inteligente
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
              WolfX AAQ: Qualifique Leads e Otimize o Atendimento Inicial para 
              <span className="text-accent"> Escritórios e Consultorias</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Um Agente de IA que tria, qualifica e responde a dúvidas frequentes no WhatsApp, 
              garantindo que sua equipe foque em oportunidades de alto valor.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow-button text-primary-foreground hover:text-primary-foreground">
                Solicite um Diagnóstico Gratuito
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                Veja o AAQ em Ação
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
              Problemas que o <span className="gradient-text">AAQ Resolve</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Escritórios e consultorias perdem tempo e dinheiro com leads desqualificados
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

      {/* How AAQ Helps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como o <span className="gradient-text">AAQ Ajuda</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades inteligentes que otimizam seu processo de qualificação
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
              Veja como diferentes segmentos utilizam o AAQ
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
              Resultados reais de empresas que implementaram o AAQ
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
              4 etapas para ter seu AAQ qualificando leads automaticamente
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
                  q: "Como o AAQ define se um lead é qualificado?",
                  a: "Baseado nos critérios que você define: orçamento, urgência, localização, tipo de serviço, etc. O sistema aprende e se aprimora com o tempo."
                },
                {
                  q: "Posso personalizar as perguntas de qualificação?",
                  a: "Sim! Criamos um questionário totalmente personalizado para seu segmento e estratégia de negócio."
                },
                {
                  q: "O que acontece com leads muito qualificados?",
                  a: "Eles são priorizados e podem ser direcionados imediatamente para sua equipe ou agendados com urgência."
                },
                {
                  q: "O AAQ se integra com meu CRM?",
                  a: "Sim, integramos com os principais CRMs do mercado, enviando leads qualificados diretamente com todas as informações coletadas."
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
            Pronto para Qualificar Leads Automaticamente?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Solicite um diagnóstico gratuito e descubra como o AAQ pode aumentar 
            sua taxa de conversão e otimizar o tempo da sua equipe.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Solicite um Diagnóstico Gratuito
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Veja o AAQ em Ação
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AAQ;