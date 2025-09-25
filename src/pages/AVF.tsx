import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  Target,
  Zap,
  Clock,
  Users,
  AlertTriangle,
  MessageSquare
} from "lucide-react";

const AVF = () => {
  const problems = [
    {
      icon: AlertTriangle,
      title: "Oportunidades Perdidas",
      description: "Leads qualificados abandonam o processo por falta de follow-up adequado"
    },
    {
      icon: Users,
      title: "Equipe Sobrecarregada",
      description: "Vendedores não conseguem acompanhar todos os leads simultaneamente"
    },
    {
      icon: Clock,
      title: "Ciclo de Vendas Longo",
      description: "Demora excessiva entre o primeiro contato e o fechamento da venda"
    }
  ];

  const features = [
    {
      title: "Qualificação Avançada",
      description: "Identifica o momento ideal de compra e o perfil do cliente"
    },
    {
      title: "Apresentação de Ofertas",
      description: "Apresenta produtos/serviços de forma personalizada e persuasiva"
    },
    {
      title: "Tratamento de Objeções",
      description: "Responde às principais objeções com argumentos validados"
    },
    {
      title: "Fechamento Automatizado",
      description: "Conduz o processo até o pagamento ou agendamento da venda"
    }
  ];

  const benefits = [
    {
      metric: "180%",
      description: "Aumento médio em conversões"
    },
    {
      metric: "24/7",
      description: "Vendas funcionando sempre"
    },
    {
      metric: "50%",
      description: "Redução do ciclo de vendas"
    },
    {
      metric: "85%",
      description: "Taxa de satisfação dos clientes"
    }
  ];

  const useCases = [
    {
      industry: "Imobiliárias",
      scenario: "Venda de imóveis",
      benefit: "Qualifica interesse e agenda visitas automaticamente"
    },
    {
      industry: "Corretores de Seguros",
      scenario: "Venda de seguros",
      benefit: "Apresenta cotações personalizadas e fecha contratos"
    },
    {
      industry: "Consultores",
      scenario: "Venda de serviços",
      benefit: "Educa o lead e agenda apresentações comerciais"
    }
  ];

  const testimonials = [
    {
      name: "Ricardo Santos",
      specialty: "Corretor de Imóveis",
      text: "O AVF multiplicou minhas vendas por 3! Ele trabalha 24h qualificando leads e agendando visitas. Meu tempo agora é só para fechar negócios.",
      result: "3x mais vendas"
    },
    {
      name: "Marina Costa",
      specialty: "Consultora de Seguros",
      text: "Impressionante como o AVF consegue conduzir uma venda completa. Meus clientes ficam impressionados com a agilidade e personalização.",
      result: "250% ROI em 6 meses"
    }
  ];

  const process = [
    {
      step: "1",
      title: "Análise do Processo",
      description: "Mapeamos seu funil de vendas atual e identificamos oportunidades"
    },
    {
      step: "2", 
      title: "Copy Personalizada",
      description: "Criamos scripts de vendas otimizados para seu produto/serviço"
    },
    {
      step: "3",
      title: "Automação de Pagamentos",
      description: "Integramos com gateways de pagamento e sistemas de cobrança"
    },
    {
      step: "4",
      title: "Otimização Contínua",
      description: "Monitoramos conversões e ajustamos estratégias para melhor performance"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero-section py-20 lg:py-32">
        <div className="hero-content container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 accent-button">
              <TrendingUp className="w-4 h-4 mr-2" />
              Vendas Inteligentes
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-primary-foreground mb-6">
              WolfX AVF: Multiplique Suas Vendas no WhatsApp com IA para 
              <span className="text-accent"> Imobiliárias e Corretores</span>
            </h1>
            <p className="text-xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
              Seu vendedor virtual 24/7 que qualifica, engaja, apresenta ofertas e conduz ao fechamento, 
              escalando suas vendas sem aumentar sua equipe.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="glow-button text-primary-foreground hover:text-primary-foreground">
                Agende uma Consultoria Estratégica
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                Veja o AVF em Ação
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
              Problemas que o <span className="gradient-text">AVF Resolve</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Vendedores e empresas perdem receita por não conseguir acompanhar todas as oportunidades
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

      {/* How AVF Helps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Como o <span className="gradient-text">AVF Ajuda</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Funcionalidades de vendas que convertem mais e vendem 24/7
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

      {/* Sales Process */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Processo de <span className="gradient-text">Vendas Automatizado</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Veja como o AVF conduz uma venda do início ao fechamento
            </p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { icon: Target, title: "Qualificação", desc: "Identifica necessidade real e urgência" },
                { icon: MessageSquare, title: "Apresentação", desc: "Mostra soluções específicas para o perfil" },
                { icon: Zap, title: "Objeções", desc: "Trata dúvidas com argumentos validados" },
                { icon: DollarSign, title: "Fechamento", desc: "Conduz ao pagamento ou agendamento" }
              ].map((step, index) => (
                <Card key={index} className="card-hover text-center">
                  <CardContent className="p-6">
                    <step.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Casos de <span className="gradient-text">Sucesso</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Veja como diferentes profissionais utilizam o AVF
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
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Benefícios <span className="gradient-text">Comprovados</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Resultados reais de profissionais que implementaram o AVF
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
              4 etapas para ter seu AVF vendendo automaticamente
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
                  q: "O AVF realmente consegue fechar vendas sozinho?",
                  a: "Sim! Para produtos/serviços com processo de venda estruturado, o AVF conduz desde a qualificação até o pagamento ou agendamento de fechamento."
                },
                {
                  q: "Como personalizo a abordagem de vendas?",
                  a: "Criamos scripts totalmente personalizados baseados na sua metodologia de vendas, linguagem da marca e características do seu produto/serviço."
                },
                {
                  q: "O AVF funciona com produtos de alto valor?",
                  a: "Perfeitamente! Para produtos de alto valor, o AVF qualifica e educa o lead, agendando apresentações comerciais com você no momento ideal."
                },
                {
                  q: "Como funciona a integração com sistemas de pagamento?",
                  a: "Integramos com os principais gateways (Stripe, PagSeguro, Mercado Pago) para processar pagamentos automaticamente e enviar confirmações."
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
            Pronto para Multiplicar suas Vendas?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
            Agende uma consultoria estratégica e descubra como o AVF pode 
            transformar seu processo de vendas e aumentar sua receita exponencialmente.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Agende uma Consultoria Estratégica
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10">
              Veja o AVF em Ação
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AVF;