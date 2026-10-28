import React from 'react';

// Tipagem para as propriedades do botão
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'aprovar' | 'reprovar' | 'neutro';
  size?: 'grande' | 'medio' | 'pequeno';
  children: React.ReactNode;
}

export function CustomButton({
  variant = 'aprovar',
  size = 'medio',
  children,
  className = '',
  ...props
}: ButtonProps) {
  
  // Definição das larguras solicitadas (altura fixa de 45px para todos)
  const sizeClasses = {
    grande: 'w-[414px] h-[45px]',
    medio: 'w-[152px] h-[45px]',
    pequeno: 'w-[90px] h-[45px]',
  };

  // Cores baseadas nos exemplos visuais da imagem
  const variantClasses = {
    aprovar: 'bg-[#5b56ed] text-white hover:bg-[#4b47db] border-transparent',
    reprovar: 'bg-white text-[#d9534f] border border-[#d9534f] hover:bg-[#fff5f5]',
    'neutro': 'bg-white text-[#1f2937] border border-[#e5e7eb] hover:bg-[#f9fafb]',
  };

  return (
    <button
      className={`font-medium rounded-xl flex items-center justify-center transition-colors cursor-pointer ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}