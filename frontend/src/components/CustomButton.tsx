import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'aprovar' | 'reprovar' | 'neutro';
  size?: 'grande' | 'medio' | 'pequeno';
  children: React.ReactNode;
  to?: string;
}

export function CustomButton({
  variant = 'aprovar',
  size = 'medio',
  children,
  className = '',
  to,
  ...props
}: ButtonProps) {

  const sizeClasses = {
    grande: 'w-full h-[45px]',
    medio: 'w-[152px] h-[45px]',
    pequeno: 'w-[90px] h-[45px]',
  };

  const variantClasses = {
    aprovar: 'bg-acento text-white border border-acento hover:bg-card hover:text-acento',
    reprovar: 'bg-white text-[#d9534f] border border-[#d9534f] hover:bg-[#fff5f5]',
    neutro: 'bg-white text-profundo border border-profundo hover:bg-profundo hover:text-white',
  };

  const buttonClasses = `
    font-semibold rounded-xl flex items-center justify-center
    transition-colors cursor-pointer
    ${sizeClasses[size]}
    ${variantClasses[variant]}
    ${className}
  `;

  if (to) {
    return (
      <Link to={to} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button
      className={buttonClasses}
      {...props}
    >
      {children}
    </button>
  );
}