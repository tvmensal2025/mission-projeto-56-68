import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface LockedMenuItemProps {
  children: React.ReactNode;
  feature: 'desafios' | 'comunidade' | 'sessoes' | 'assinatura' | 'courses';
  onClick?: () => void;
  className?: string;
}

// Componente simplificado: sem bloqueio nem rótulo "Em breve"

export const LockedMenuItem: React.FC<LockedMenuItemProps> = ({
  children,
  feature,
  onClick,
  className = ""
}) => {
  const handleClick = () => {
    onClick?.();
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        className={`w-full justify-start ${className}`}
        onClick={handleClick}
      >
      {children}
      </Button>
    </motion.div>
  );
};

export default LockedMenuItem; 