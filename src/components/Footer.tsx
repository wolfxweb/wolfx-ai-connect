import { Link } from "react-router-dom";
import { Bot, Mail, Phone, Settings, Shield, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, userProfile, canAccessAdmin } = useAuth();

  const getRoleBadge = () => {
    if (!userProfile) return null;
    
    switch (userProfile.role) {
      case 'admin':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 text-xs"><Shield className="h-3 w-3 mr-1" />Admin</Badge>
      case 'moderator':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs"><User className="h-3 w-3 mr-1" />Moderador</Badge>
      default:
        return <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs"><User className="h-3 w-3 mr-1" />Usuário</Badge>
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-accent-foreground" />
              </div>
              <span className="text-2xl font-bold">WolfX</span>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md">
              Especialistas em Inteligência Artificial e Automação de Processos. Desenvolvemos 
              soluções digitais de alto desempenho que integram nativamente IA e RPA, transformando 
              desafios complexos em vantagens competitivas para sua operação.
            </p>
            
            {/* Status do usuário e botão admin */}
            {user && (
              <div className="mb-4 p-3 bg-primary-foreground/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {userProfile?.name || user.email}
                    </span>
                    {getRoleBadge()}
                  </div>
                </div>
                {canAccessAdmin && (
                  <Link to="/admin">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-primary-foreground/30"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Painel Administrativo
                    </Button>
                  </Link>
                )}
              </div>
            )}
            
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4" />
                <span>wolfxpj@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4" />
                <span>48 988114708</span>
              </div>
            </div>
          </div>

          {/* Serviços */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Nossos Serviços</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-primary-foreground/80">Marketplaces</span>
              </li>
              <li>
                <span className="text-primary-foreground/80">SaaS</span>
              </li>
              <li>
                <span className="text-primary-foreground/80">Plataformas Personalizadas</span>
              </li>
              <li>
                <span className="text-primary-foreground/80">IA e Automação</span>
              </li>
            </ul>
          </div>

          {/* Links Úteis */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Úteis</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Início
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-primary-foreground/60 text-sm">
            © {currentYear} WolfX. Todos os direitos reservados.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Política de Privacidade
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground text-sm transition-colors">
              Termos de Serviço
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;