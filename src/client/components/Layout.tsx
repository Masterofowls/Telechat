import React from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';

const Layout: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Telechat</h1>
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-accent">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
