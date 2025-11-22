import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'fab';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'filled', 
  className = '', 
  icon,
  onClick,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none";
  
  const variants = {
    filled: "bg-md-sys-primary text-md-sys-onPrimary shadow-sm rounded-full px-6 py-2.5",
    outlined: "border border-md-sys-outline text-md-sys-primary hover:bg-md-sys-primaryContainer hover:bg-opacity-10 rounded-full px-6 py-2.5",
    text: "text-md-sys-primary hover:bg-md-sys-primaryContainer hover:bg-opacity-10 rounded-full px-4 py-2",
    fab: "bg-md-sys-primaryContainer text-md-sys-onPrimaryContainer shadow-md rounded-2xl w-14 h-14 fixed bottom-6 right-6 z-50",
  };

  const handleTap = () => {
    if (navigator.vibrate) navigator.vibrate(5);
  };

  return (
    <motion.button 
      className={`${baseStyles} ${variants[variant]} ${className}`} 
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={(e) => {
        handleTap();
        if(onClick) onClick(e);
      }}
      {...props as any}
    >
      {icon && <span className={`${children ? 'mr-2' : ''}`}>{icon}</span>}
      {children}
    </motion.button>
  );
};