import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface LockedMenuItemProps {
  children: React.ReactNode;
  feature: 'desafios' | 'comunidade' | 'sessoes' | 'assinatura' | 'courses';
  onClick?: () => void;
  className?: string;
}

const featureConfig = {
  desafios: {
    title: "Desafios Premium",
    description: "Acesse desafios personalizados e competições"
  },
  comunidade: {
    title: "Comunidade Premium", 
    description: "Conecte-se com outros usuários"
  },
  sessoes: {
    title: "Sessões Personalizadas",
    description: "Acesse sessões exclusivas com especialistas"
  },
  assinatura: {
    title: "Gestão de Assinatura",
    description: "Gerencie sua assinatura e planos"
  },
  courses: {
    title: "Plataforma dos Sonhos",
    description: "Acesse cursos exclusivos e conteúdo premium"
  }
};

export const LockedMenuItem: React.FC<LockedMenuItemProps> = ({
  children,
  feature,
  onClick,
  className = ""
}) => {
  const { hasActiveSubscription } = useSubscription();
  const { toast } = useToast();
  const config = featureConfig[feature];

  const handleClick = () => {
    if (hasActiveSubscription) {
      onClick?.();
    } else {
      toast({
        title: "Em breve novidades!",
        description: "Esta funcionalidade estará disponível em breve.",
        duration: 3000,
      });
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        className={`w-full justify-start ${className} ${
          !hasActiveSubscription ? 'opacity-60' : ''
        }`}
        onClick={handleClick}
      >
      {children}
      {!hasActiveSubscription && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 500, 
            damping: 30,
            delay: 0.2
          }}
        >
          <Badge 
            variant="secondary" 
            className="ml-auto text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 shadow-lg"
          >
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ 
                duration: 2, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <Lock className="w-3 h-3 mr-1" />
            </motion.div>
            Em breve
          </Badge>
        </motion.div>
      )}
      </Button>
    </motion.div>
  );
};

export default LockedMenuItem; 