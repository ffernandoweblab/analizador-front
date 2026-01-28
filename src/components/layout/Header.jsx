import React from 'react';
import './Header.css';
import { useTheme } from '../../context/ThemeContext';

function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    
    
    <header className="header">
      
      <div className="header-content">
        
        <div className="header-left">
          
          
        </div>
        
        <div className="header-actions">
          
          
          <button 
            className="theme-toggle-btn" 
            onClick={toggleTheme} 
            title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;