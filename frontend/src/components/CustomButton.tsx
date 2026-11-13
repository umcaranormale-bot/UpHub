
import React from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'aprovar' | 'reprovar' | 'neutro' | 'laranja';
  size?: 'grande' | 'medio' | 'pequeno' | 'auto' | 'cartao';
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
    auto: 'w-auto h-[45px] px-3',
    cartao: 'w-[122px] h-[47px] px-[18px] py-3 gap-2 rounded-lg border',
  };

  const variantClasses = {
    aprovar: 'bg-acento text-white border border-acento hover:bg-card hover:text-acento',
    reprovar: 'bg-white text-[#d9534f] border border-[#d9534f] hover:bg-[#fff5f5]',
    neutro: 'bg-white text-profundo border border-profundo hover:bg-profundo hover:text-white',
    laranja: 'bg-white text-orange-800 border border-orange-200 hover:bg-orange-100',
  };

  const buttonClasses = `
    font-semibold rounded-lg flex items-center justify-center
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
