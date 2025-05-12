// MessageContent.jsx - Nuevo componente para renderizar mensajes con formato mejorado
import React from 'react';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Link
} from '@mui/material';
import {
  WorkspacePremium,
  Check,
  School,
  Code,
  Psychology,
  Star,
  StarBorder,
  Lightbulb
} from '@mui/icons-material';
import { ACCENTURE_COLORS } from "../styles/styles";

// Expresiones regulares para detectar patrones en el texto
const PATTERNS = {
  CERTIFICATION: /\*\*([^*]+)\*\*/g,
  SECTION_HEADER: /###\s([^#]+)/g,
  LIST_ITEM: /^\s*\d+\.\s+(.+)$/gm,
  BULLET_ITEM: /^\s*\*\s+(.+)$/gm,
  SKILLS_COVERED: /\*\*Skills Covered:\*\*\s*-\s*([^#]+)/g,
  STEPS: /###\s*Additional Steps to Develop/i,
  RECOMMENDATION: /I recommend pursuing the \*\*([^*]+)\*\*/
};

const MessageContent = ({ text, sender }) => {
  // Si es un mensaje del usuario, simplemente mostrarlo como texto
  if (sender === 'user') {
    return <Typography variant="body2">{text}</Typography>;
  }

  // Para mensajes del bot, aplicamos formato especial
  return <FormattedBotMessage text={text} />;
};

const FormattedBotMessage = ({ text }) => {
  // Detectar si el mensaje contiene una recomendación de certificado
  const hasCertificationRecommendation = PATTERNS.RECOMMENDATION.test(text);
  
  // Detectar si el mensaje contiene secciones
  const hasSections = PATTERNS.SECTION_HEADER.test(text);
  
  // Si hay una recomendación de certificado, usar el formato de tarjeta
  if (hasCertificationRecommendation) {
    return <CertificationRecommendation text={text} />;
  }
  
  // Si hay secciones, dividir el mensaje en secciones
  if (hasSections) {
    return <SectionedMessage text={text} />;
  }
  
  // Para otros mensajes, aplicar formato básico
  return <BasicFormattedMessage text={text} />;
};

const BasicFormattedMessage = ({ text }) => {
  // Reemplazar los elementos de formato básico
  const formattedText = text
    // Negrita
    .replace(/\*\*([^*]+)\*\*/g, (match, content) => 
      `<strong>${content}</strong>`)
    // Énfasis
    .replace(/\*([^*]+)\*/g, (match, content) => 
      `<em>${content}</em>`)
    // Listas numeradas
    .replace(/^\s*(\d+)\.\s+(.+)$/gm, (match, number, content) => 
      `<div class="list-item"><span class="list-number">${number}.</span> ${content}</div>`)
    // Listas con viñetas
    .replace(/^\s*\*\s+(.+)$/gm, (match, content) => 
      `<div class="list-item"><span class="bullet">•</span> ${content}</div>`);
  
  return (
    <Box 
      sx={{ 
        '& strong': { 
          color: ACCENTURE_COLORS.corePurple1,
          fontWeight: 600
        },
        '& .list-item': {
          display: 'flex',
          marginBottom: '6px'
        },
        '& .list-number': {
          minWidth: '20px',
          color: ACCENTURE_COLORS.corePurple1,
          fontWeight: 600
        },
        '& .bullet': {
          minWidth: '20px',
          color: ACCENTURE_COLORS.corePurple1
        }
      }}
      dangerouslySetInnerHTML={{ __html: formattedText }}
    />
  );
};

const CertificationRecommendation = ({ text }) => {
  // Extraer nombre de certificado
  const certMatch = PATTERNS.RECOMMENDATION.exec(text);
  const certificationTitle = certMatch ? certMatch[1] : "Certification";
  
  // Extraer emisor del certificado
  const issuerMatch = /\*\*Issuer:\*\*\s*([^*\n]+)/i.exec(text);
  const issuer = issuerMatch ? issuerMatch[1].trim() : "Meta";
  
  // Extraer habilidades cubiertas
  const skillsMatch = PATTERNS.SKILLS_COVERED.exec(text);
  let skills = [];
  if (skillsMatch && skillsMatch[1]) {
    const skillsText = skillsMatch[1].trim();
    skills = skillsText.split('-').map(skill => skill.trim()).filter(Boolean);
  } else {
    // Buscar habilidades en otro formato
    const altSkillsMatch = /Skills Covered:.*?([^#]+)/is.exec(text);
    if (altSkillsMatch) {
      const skillsText = altSkillsMatch[1].trim();
      skills = skillsText.split(/[,\n-]/).map(skill => skill.trim()).filter(Boolean);
    }
  }
  
  // Extraer pasos adicionales
  const stepsSection = text.split(/###\s*Additional Steps to Develop/i)[1];
  let steps = [];
  if (stepsSection) {
    const stepMatches = stepsSection.matchAll(/\d+\.\s*\*\*([^*]+)\*\*\s*([^#\d]+)/g);
    for (const match of stepMatches) {
      if (match[1] && match[2]) {
        steps.push({
          title: match[1].trim(),
          description: match[2].trim()
        });
      }
    }
  }
  
  return (
    <Box sx={{ width: '100%' }}>
      {/* Introducción y recomendación */}
      <Typography variant="body2" paragraph sx={{ mb: 1 }}>
        Currently, you don't have React in your skill set. To develop this skill, I recommend pursuing the:
      </Typography>
      
      {/* Tarjeta de certificación */}
      <Box 
        sx={{ 
          border: `1px solid ${ACCENTURE_COLORS.corePurple1}30`,
          borderRadius: 2,
          p: 1.5,
          mb: 2,
          backgroundColor: `${ACCENTURE_COLORS.corePurple1}08`,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <WorkspacePremium sx={{ color: ACCENTURE_COLORS.corePurple1, mr: 1 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: ACCENTURE_COLORS.corePurple1 }}>
            {certificationTitle}
          </Typography>
        </Box>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          <strong>Issuer:</strong> {issuer}
        </Typography>
        
        {skills.length > 0 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 1 }}>
              Skills Covered:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5, mb: 1 }}>
              {skills.map((skill, index) => (
                <Chip 
                  key={index}
                  size="small"
                  label={skill}
                  icon={<Code sx={{ fontSize: '0.8rem !important' }} />}
                  sx={{ 
                    backgroundColor: `${ACCENTURE_COLORS.corePurple1}15`,
                    borderRadius: '4px',
                    '& .MuiChip-label': { px: 1 },
                    '& .MuiChip-icon': { ml: 0.5 }
                  }}
                />
              ))}
            </Box>
          </>
        )}
        
        <Typography variant="body2" sx={{ mt: 1 }}>
          This certification will provide you with a comprehensive understanding of React, focusing on creating interactive and responsive user interfaces. It also covers essential frontend languages, which will enhance your overall development capabilities.
        </Typography>
      </Box>
      
      {/* Pasos adicionales */}
      {steps.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Additional Steps to Develop React Skills:
          </Typography>
          <List dense disablePadding>
            {steps.map((step, index) => (
              <ListItem key={index} alignItems="flex-start" sx={{ py: 0.5, px: 0 }}>
                <ListItemIcon sx={{ minWidth: 24, mt: 0.5 }}>
                  <Star fontSize="small" sx={{ color: ACCENTURE_COLORS.corePurple1 }} />
                </ListItemIcon>
                <ListItemText 
                  primary={<Typography variant="body2" sx={{ fontWeight: 600 }}>{step.title}</Typography>}
                  secondary={<Typography variant="body2">{step.description}</Typography>}
                  sx={{ m: 0 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}
      
      {/* Cierre */}
      <Typography variant="body2" sx={{ mt: 2 }}>
        By focusing on these areas, you'll be well on your way to mastering React! Let me know if you need further assistance or resources!
      </Typography>
    </Box>
  );
};

const SectionedMessage = ({ text }) => {
  // Dividir el texto en secciones basadas en los encabezados
  const sections = text.split(PATTERNS.SECTION_HEADER);
  
  // El primer elemento es la introducción (antes del primer encabezado)
  const introduction = sections[0];
  
  // Extraer los pares de encabezado y contenido
  const sectionPairs = [];
  for (let i = 1; i < sections.length; i += 2) {
    if (i + 1 < sections.length) {
      sectionPairs.push({
        header: sections[i],
        content: sections[i + 1]
      });
    }
  }
  
  return (
    <Box>
      {/* Introducción */}
      {introduction && <BasicFormattedMessage text={introduction} />}
      
      {/* Secciones */}
      {sectionPairs.map((section, index) => (
        <Box key={index} sx={{ mt: 1.5 }}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              fontWeight: 600, 
              color: ACCENTURE_COLORS.corePurple1,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Lightbulb fontSize="small" sx={{ mr: 0.5 }} />
            {section.header}
          </Typography>
          <BasicFormattedMessage text={section.content} />
        </Box>
      ))}
    </Box>
  );
};

export default MessageContent;