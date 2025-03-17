
import { useEffect } from 'react';

const useBodyStyles = () => {
    useEffect(() => {
      const originalBodyStyle = document.body.style.cssText;
      const originalHtmlStyle = document.documentElement.style.cssText;
      
      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.width = '100vw';
      document.body.style.height = '100vh';
      document.body.style.overflow = 'hidden';
      document.body.style.backgroundColor = '#FFFFFF';
      document.body.style.fontFamily = '"Palanquin", "Arial", sans-serif'; // Cambio aquí
      
      document.documentElement.style.margin = '0';
      document.documentElement.style.padding = '0';
      document.documentElement.style.width = '100vw';
      document.documentElement.style.height = '100vh';
      document.documentElement.style.overflow = 'hidden';
      
      if (document.getElementById('root')) {
        document.getElementById('root').style.width = '100vw';
        document.getElementById('root').style.height = '100vh';
        document.getElementById('root').style.margin = '0';
        document.getElementById('root').style.padding = '0';
      }
      
      return () => {
        document.body.style.cssText = originalBodyStyle;
        document.documentElement.style.cssText = originalHtmlStyle;
      };
    }, []);
  };
  
  export default useBodyStyles;