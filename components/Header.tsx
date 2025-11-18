import React from 'react';
// Fix: Added .tsx extension to the import path.
import { MagnifyingGlassIcon } from './Icons.tsx';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-8 md:mb-12">
      <div className="inline-flex items-center justify-center bg-indigo-500/10 text-indigo-400 rounded-full p-3 mb-4">
        <MagnifyingGlassIcon className="h-8 w-8" />
      </div>
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
        Analisador de Palavras-Chave com IA
      </h1>
      <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-400">
        Insira o URL de um site para descobrir palavras-chave primárias, secundárias e de cauda longa com dados de volume e dificuldade, tudo com o poder da IA.
      </p>
    </header>
  );
};

export default Header;