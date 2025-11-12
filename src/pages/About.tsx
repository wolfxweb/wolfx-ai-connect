import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Code,
  Brain,
  Rocket,
  Sparkles,
  Target,
  MapPin,
  Calendar,
  Award,
  Linkedin,
} from "lucide-react";

const About = () => {
  const services = [
    {
      title: "Engenharia de Software e MLOps",
      description: "Sistemas robustos, escaláveis e prontos para produção.",
      icon: Code,
      color: "text-blue-600"
    },
    {
      title: "Inteligência Artificial e Machine Learning",
      description: "Modelos preditivos e automatizações inteligentes.",
      icon: Brain,
      color: "text-purple-600"
    },
    {
      title: "Desenvolvimento Full Stack",
      description: "Da concepção à entrega final, com integração e suporte contínuo.",
      icon: Rocket,
      color: "text-green-600"
    },
  ];

  const values = [
    {
      title: "Inovação",
      description: "Explorar o potencial da IA para criar o novo.",
      icon: Sparkles,
      color: "text-yellow-600"
    },
    {
      title: "Excelência Técnica",
      description: "Código limpo, escalável e com boas práticas.",
      icon: Award,
      color: "text-blue-600"
    },
    {
      title: "Resultado",
      description: "Foco total em entregar valor ao cliente.",
      icon: Target,
      color: "text-green-600"
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              <Calendar className="w-4 h-4 mr-2" />
              Fundada em 2020
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
              Sobre a Wolfx
            </h1>
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              Fundada em 2020 por <strong>Carlos Eduardo Lobo</strong>, a Wolfx nasceu com o propósito de transformar desafios complexos em soluções inteligentes por meio da Inteligência Artificial e da Engenharia de Software.
            </p>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Nosso foco é desenvolver soluções de IA end-to-end, integrando análise de dados, machine learning e arquitetura de software em sistemas prontos para operação no mundo real.
            </p>
            <div className="flex justify-center mt-6">
              <a 
                href="https://www.linkedin.com/in/carlos-eduardo-lobo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2"
              >
                <Button variant="outline" size="lg" className="gap-2">
                  <Linkedin className="w-5 h-5" />
                  <span>LinkedIn do Fundador</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* O que fazemos Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                O que fazemos
              </h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Na Wolfx, acreditamos que a tecnologia deve gerar valor real para negócios e pessoas.
                Por isso, entregamos soluções completas que unem:
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <Card key={index} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg bg-primary/10 ${service.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <CardTitle className="text-xl">{service.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{service.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Card className="bg-primary/5 border-2 border-primary/20">
              <CardContent className="pt-6">
                <p className="text-center text-lg text-muted-foreground">
                  Combinamos o poder dos algoritmos com o rigor da engenharia, garantindo que cada solução seja eficiente, confiável e orientada a resultados.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Missão Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Target className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-3xl mb-4">Nossa missão</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl text-center text-muted-foreground leading-relaxed">
                  Criar soluções inteligentes que impulsionam negócios, otimizam processos e tornam a tecnologia uma aliada estratégica em cada decisão.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Valores Section */}
      <section className="py-20 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Nossos valores
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className={`p-3 rounded-full bg-primary/10 ${value.color}`}>
                          <Icon className="w-8 h-8" />
                        </div>
                      </div>
                      <CardTitle className="text-2xl mb-2">{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Localização e Contato Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-center space-x-4">
                    <MapPin className="w-8 h-8 text-primary" />
                    <div className="text-center">
                      <p className="text-2xl font-bold mb-2">Localização</p>
                      <p className="text-lg text-muted-foreground">
                        📍 São José, Santa Catarina, Brasil
                      </p>
                    </div>
                  </div>
                  
                  <div className="border-t border-border pt-6">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-4">Conecte-se Conosco</p>
                      <div className="flex justify-center">
                        <a 
                          href="https://www.linkedin.com/in/carlos-eduardo-lobo" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2"
                        >
                          <Button variant="outline" size="lg" className="gap-2">
                            <Linkedin className="w-5 h-5" />
                            <span>LinkedIn</span>
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;

