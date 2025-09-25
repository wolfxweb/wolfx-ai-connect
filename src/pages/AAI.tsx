import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  ArrowRight,
  Phone,
  MessageSquare,
  AlertCircle,
  TrendingUp,
  Users,
  Smartphone
} from "lucide-react";

const AAI = () => {
  const problems = [
    {
      icon: AlertCircle,
      title: "Alto Índice de No-Shows",
      description: "Pacientes que não comparecem aos agendamentos geram prejuízo e agenda ociosa"
    },
    {
      icon: Phone,
      title: "Sobrecarga da Secretária",
      description: "Tempo excessivo gasto com ligações de agendamento, confirmação e reagendamento"
    },
    {
      icon: Clock,
      title: "Horários Perdidos",
      description: "Dificuldade para preencher cancelamentos de última hora"
    }
  ];

  const features = [
    {
      title: "Agendamento Automático",
      description: "Permite que clientes agendem, cancelem e reagendem via WhatsApp 24/7"
    },
    {
      title: "Confirmações Inteligentes",
      description: "Envia lembretes automáticos personalizados em diferentes momentos"
    },
    {
      title: "Gestão de Lista de Espera",
      description: "Oferece automaticamente horários vagos para clientes na lista de espera"
    },
    {
      title: "Integração com Agenda",
      description: "Sincroniza em tempo real com seu software de gestão"
    }
  ];

  const benefits = [
    {
      metric: "65%",
      description: "Redução média de no-shows"
    },
    {
      metric: "80%",
      description: "Menos tempo gasto com agendamentos"
    },
    {
      metric: "24/7",
      description: "Disponibilidade para agendamentos"
    },
    {
      metric: "95%",
      description: "Taxa de ocupação da agenda"
    }
  ];

  const testimonials = [
    {
      name: "Dr. Carlos Silva",
      specialty: "Ortodontista",
      text: "Com o AAI da WolfX, reduzi os no-shows em 70% e minha secretária pode focar no atendimento presencial. Revolucionou minha clínica!",
      result: "70% menos no-shows"
    },
    {
      name: "Dra. Ana Costa",
      specialty: "Dermatologista", 
      text: "O sistema é incrível! Os pacientes adoram a praticidade de agendar pelo WhatsApp e eu tenho total controle da agenda.",
      result: "85% ocupação da agenda"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Análise da Agenda",
      description: "Estudamos seu fluxo atual de agendamentos e identificamos oportunidades"
    },
    {
      step: "2", 
      title: "Personalização",
      description: "Configuramos o agente com suas regras, horários e preferências específicas"
    },
    {
      step: "3",
      title: "Integração",
      description: "Conectamos com seu software de gestão e configuramos automações"
    },
    {
      step: "4",
      title: "Lançamento",
      description: "Ativamos o sistema e treinamos sua equipe para monitoramento"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32">
        <div className="hero-content container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 accent-button">
              <Calendar className="w-4 h-4 mr-2" />
              Agendamento Inteligente
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
              WolfX AAI: Otimize o Agendamento e Reduza No-Shows para 
              <span className="text-accent"> Clínicas e Consultórios</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Seu assistente virtual 24/7 para agendamentos, confirmações e lembretes via WhatsApp, 
              liberando sua equipe e melhorando a experiência do paciente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow-button text-primary-foreground hover:text-primary-foreground">
                Agende uma Demonstração Gratuita
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                Ver AAI em Ação
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
              Problemas que o <span className="gradient-text">AAI Resolve</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Clínicas e consultórios enfrentam desafios específicos com agendamentos que impactam diretamente na receita
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

      {/* How AAI Helps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como o <span className="gradient-text">AAI Ajuda</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades inteligentes que transformam seu processo de agendamento
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

      {/* Benefits Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Benefícios <span className="gradient-text">Comprovados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Resultados reais de clínicas que implementaram o AAI
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Processo de <span className="gradient-text">Implementação</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              4 etapas simples para ter seu AAI funcionando perfeitamente
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
      <section className="py-20 bg-secondary/50">
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
      <section className="py-20">
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
                  q: "O AAI funciona com qualquer software de gestão?",
                  a: "Sim, nosso sistema se integra com os principais softwares do mercado como Clinicorp, iClinic, Ninsaúde e muitos outros através de APIs."
                },
                {
                  q: "Como funciona em caso de emergências ou urgências?",
                  a: "O AAI identifica palavras-chave de urgência e direciona automaticamente para atendimento humano ou números de emergência configurados."
                },
                {
                  q: "Posso personalizar os horários e regras de agendamento?",
                  a: "Completamente! Configuramos horários específicos, intervalos entre consultas, tipos de procedimento e todas as regras do seu consultório."
                },
                {
                  q: "O que acontece se o paciente não confirmar presença?",
                  a: "O sistema envia lembretes escalonados e, em caso de não confirmação, pode disponibilizar o horário para outros pacientes automaticamente."
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
            Pronto para Reduzir seus No-Shows?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Agende uma demonstração gratuita e veja como o AAI pode transformar 
            a gestão da sua agenda e aumentar sua receita.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Agende uma Demonstração Gratuita
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Solicite um Orçamento Personalizado
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AAI;