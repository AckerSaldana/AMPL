import { useEffect } from 'react';

const useBodyStyles = () => {
  useEffect(() => {
    // Guardar los estilos originales
    const originalBodyStyle = document.body.style.cssText;
    const originalHtmlStyle = document.documentElement.style.cssText;
    
    document.documentElement.style.height = '100%';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    document.documentElement.style.overflow = 'hidden';
    
    document.body.style.height = '100%';
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#F9F9F9';
    document.body.style.fontFamily = '"Palanquin", "Arial", sans-serif';
    
    if (document.getElementById('root')) {
      document.getElementById('root').style.height = '100%';
      document.getElementById('root').style.width = '100%';
      document.getElementById('root').style.margin = '0';
      document.getElementById('root').style.padding = '0';
      document.getElementById('root').style.overflow = 'hidden';
      document.getElementById('root').style.display = 'flex';
    }
    
    return () => {
      document.body.style.cssText = originalBodyStyle;
      document.documentElement.style.cssText = originalHtmlStyle;
    };
  }, []);
};

export default useBodyStyles;