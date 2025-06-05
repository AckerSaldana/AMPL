// MessageContent.jsx - Enhanced component for rendering Virtual Assistant messages
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
  Link,
  Paper,
  alpha,
  useTheme,
  Collapse,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Stack,
  Tooltip
} from '@mui/material';
import {
  WorkspacePremium,
  Check,
  School,
  Code,
  Psychology,
  Star,
  StarBorder,
  Lightbulb,
  AutoAwesome,
  ExpandMore,
  ExpandLess,
  Timeline,
  TipsAndUpdates,
  EmojiEvents,
  MenuBook,
  Business,
  CheckCircle,
  Error,
  Warning,
  Info
} from '@mui/icons-material';
import { ACCENTURE_COLORS } from "../styles/styles";

// Enhanced patterns for better message parsing
const PATTERNS = {
  // Certification patterns
  CERTIFICATION_TITLE: /\*\*([^*]+)\*\*\s*by\s*([^*\n]+)/gi,
  CERTIFICATION_SECTION: /###?\s*\d*\.?\s*([^#\n]+)/gi,
  
  // Skills patterns  
  SKILLS_COVERED: /(?:Skills Covered|Covers|Skills):\s*([^#\n]+)/gi,
  SKILL_LIST: /(?:^|\n)\s*[-•]\s*([^:\n]+)/gm,
  
  // Structure patterns
  SECTION_HEADER: /^###?\s+(.+)$/gm,
  NUMBERED_LIST: /^\s*(\d+)\.\s+(.+)$/gm,
  BULLET_LIST: /^\s*[-•*]\s+(.+)$/gm,
  
  // Special sections
  FOCUS_SECTION: /(?:\*\*Focus\*\*|Focus):\s*([^*\n]+)/i,
  VALUE_SECTION: /(?:\*\*Value\*\*|Value|Benefit):\s*([^*\n]+)/i,
  LEVEL_SECTION: /(?:\*\*Level\*\*|Level|Difficulty):\s*([^*\n]+)/i,
  ISSUER_SECTION: /(?:\*\*Issuer\*\*|Issuer|Provider):\s*([^*\n]+)/i,
  
  // Formatting
  BOLD_TEXT: /\*\*([^*]+)\*\*/g,
  ITALIC_TEXT: /\*([^*]+)\*/g,
  
  // Notes and warnings
  NOTE_SECTION: /(?:\*\*Note[^:]*:\*\*|Note:|NOTA:)\s*([^#]+)/gi,
  WARNING_SECTION: /(?:Warning|Important|Critical):\s*([^#\n]+)/gi
};

const MessageContent = ({ text, sender, metadata, sx = {} }) => {
  const theme = useTheme();
  
  // For user messages, render simple text
  if (sender === 'user') {
    return (
      <Typography variant="body2" sx={sx}>
        {text}
      </Typography>
    );
  }

  // For bot messages, apply advanced formatting
  return <EnhancedBotMessage text={text} metadata={metadata} sx={sx} />;
};

const EnhancedBotMessage = ({ text, metadata, sx }) => {
  const theme = useTheme();
  const [expandedSections, setExpandedSections] = React.useState({});
  
  // Toggle section expansion
  const toggleSection = (index) => {
    setExpandedSections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };
  
  // If we have structured metadata, use it directly
  if (metadata && metadata.certifications) {
    // Normalize certification data to ensure skills are properly formatted
    const normalizedCertifications = metadata.certifications.map(cert => ({
      ...cert,
      skills: (cert.skills || []).map(skill => {
        // Ensure each skill is a proper object with name
        if (typeof skill === 'string') {
          return { id: 'unknown', name: skill };
        }
        return skill;
      })
    }));
    
    return <CertificationRecommendationView 
      data={{
        type: 'certification_recommendation',
        introduction: text.split('\n')[0], // First line as intro
        certifications: normalizedCertifications
      }} 
      sx={sx} 
    />;
  }
  
  // Otherwise, parse the message to identify its structure
  const messageStructure = parseMessageStructure(text);
  
  // Render based on message type
  if (messageStructure.type === 'certification_recommendation') {
    return <CertificationRecommendationView data={messageStructure} sx={sx} />;
  } else if (messageStructure.type === 'skill_development') {
    return <SkillDevelopmentView data={messageStructure} sx={sx} />;
  } else if (messageStructure.type === 'structured_list') {
    return <StructuredListView data={messageStructure} sx={sx} />;
  } else if (messageStructure.type === 'note_warning') {
    return <NoteWarningView data={messageStructure} sx={sx} />;
  } else {
    return <FormattedTextView text={text} sx={sx} />;
  }
};

// Parse message structure to determine type and extract data
function parseMessageStructure(text) {
  // Check for certification recommendations
  const certMatches = [...text.matchAll(PATTERNS.CERTIFICATION_TITLE)];
  if (certMatches.length > 0) {
    const certifications = certMatches.map(match => ({
      title: match[1].trim(),
      issuer: match[2].trim(),
      fullMatch: match[0]
    }));
    
    // Split text to get introduction and certification sections
    const firstCertIndex = text.indexOf(certifications[0].fullMatch);
    const introduction = text.substring(0, firstCertIndex).trim();
    
    // Extract details for each certification by finding text between certifications
    return {
      type: 'certification_recommendation',
      introduction: introduction,
      certifications: certifications.map((cert, index) => {
        // Find the start of this certification
        const startIndex = text.indexOf(cert.fullMatch);
        
        // Find the end (either next certification or end of text)
        let endIndex = text.length;
        if (index < certifications.length - 1) {
          endIndex = text.indexOf(certifications[index + 1].fullMatch);
        }
        
        // Extract the section for this specific certification
        const certSection = text.substring(startIndex, endIndex);
        
        return {
          title: cert.title,
          issuer: cert.issuer,
          skills: extractSkills(certSection),
          focus: extractPattern(certSection, PATTERNS.FOCUS_SECTION),
          value: extractPattern(certSection, PATTERNS.VALUE_SECTION),
          level: extractPattern(certSection, PATTERNS.LEVEL_SECTION),
          description: cleanDescription(certSection)
        };
      })
    };
  }
  
  // Check for skill development content
  if (text.includes('develop') && text.includes('skill')) {
    return {
      type: 'skill_development',
      content: text
    };
  }
  
  // Check for notes/warnings
  const noteMatch = PATTERNS.NOTE_SECTION.exec(text);
  const warningMatch = PATTERNS.WARNING_SECTION.exec(text);
  if (noteMatch || warningMatch) {
    return {
      type: 'note_warning',
      content: text,
      hasNote: !!noteMatch,
      hasWarning: !!warningMatch
    };
  }
  
  // Check for structured lists
  const hasNumberedList = PATTERNS.NUMBERED_LIST.test(text);
  const hasBulletList = PATTERNS.BULLET_LIST.test(text);
  if (hasNumberedList || hasBulletList) {
    return {
      type: 'structured_list',
      content: text
    };
  }
  
  return {
    type: 'general',
    content: text
  };
}

// Extract skills from text
function extractSkills(text) {
  const skills = [];
  const processedSkills = new Set(); // To avoid duplicates
  
  // Try to find skills section with different patterns
  const skillsMatches = text.matchAll(/(?:Skills Covered|Covers|Skills|Covering):\s*([^#\n]+)/gi);
  for (const match of skillsMatches) {
    if (match[1]) {
      const skillsText = match[1];
      // Split by common delimiters and clean up
      const skillsList = skillsText
        .split(/[,;]/)
        .map(s => s.trim())
        .filter(s => s && s.length > 0 && !s.includes('*') && !s.includes('Benefit'));
      
      skillsList.forEach(skill => {
        if (!processedSkills.has(skill.toLowerCase())) {
          processedSkills.add(skill.toLowerCase());
          skills.push(skill);
        }
      });
    }
  }
  
  // Also look for bullet points that might contain skills
  const bulletSection = text.match(/(?:Skills|Key Skills|Topics):[^#]*/i);
  if (bulletSection) {
    const bulletMatches = [...bulletSection[0].matchAll(/^\s*[-•*]\s*([^:\n]+)/gm)];
    bulletMatches.forEach(match => {
      const skill = match[1].trim();
      if (skill && !processedSkills.has(skill.toLowerCase()) && skill.length < 50) {
        processedSkills.add(skill.toLowerCase());
        skills.push(skill);
      }
    });
  }
  
  return skills;
}

// Extract specific pattern from text
function extractPattern(text, pattern) {
  const match = pattern.exec(text);
  return match ? match[1].trim() : null;
}

// Clean description text
function cleanDescription(text) {
  let cleaned = text;
  
  // Remove the certification title line
  cleaned = cleaned.replace(/\*\*[^*]+\*\*\s*by\s*[^*\n]+/gi, '');
  
  // Remove all the specific sections we've already extracted
  cleaned = cleaned.replace(/(?:Skills Covered|Covers|Skills):\s*[^#\n]+/gi, '');
  cleaned = cleaned.replace(/(?:\*\*Focus\*\*|Focus):\s*[^*\n]+/gi, '');
  cleaned = cleaned.replace(/(?:\*\*Value\*\*|Value|Benefit):\s*[^*\n]+/gi, '');
  cleaned = cleaned.replace(/(?:\*\*Level\*\*|Level|Difficulty):\s*[^*\n]+/gi, '');
  cleaned = cleaned.replace(/(?:\*\*Issuer\*\*|Issuer|Provider):\s*[^*\n]+/gi, '');
  
  // Remove bullet points that were part of skills
  cleaned = cleaned.replace(/^\s*[-•*]\s+[^:\n]+$/gm, '');
  
  // Remove section numbers like "1." or "### 1."
  cleaned = cleaned.replace(/^###?\s*\d+\.?\s*/gm, '');
  
  // Clean up extra whitespace and newlines
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  // Only return if there's meaningful content left
  return cleaned.length > 20 ? cleaned : '';
}

// Component for certification recommendations
const CertificationRecommendationView = ({ data, sx }) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState({});
  
  const toggleExpanded = (index) => {
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));
  };
  
  // Helper to get difficulty color
  const getDifficultyColor = (level) => {
    const levelLower = (level || '').toLowerCase();
    if (levelLower.includes('beginner') || levelLower.includes('basic')) return '#4CAF50';
    if (levelLower.includes('intermediate') || levelLower.includes('medium')) return '#FF9800';
    if (levelLower.includes('advanced') || levelLower.includes('expert')) return '#F44336';
    return ACCENTURE_COLORS.corePurple1;
  };
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Introduction */}
      {data.introduction && (
        <Typography variant="body2" paragraph sx={{ mb: 3 }}>
          <FormattedTextView text={data.introduction} inline />
        </Typography>
      )}
      
      {/* Certifications Grid */}
      <Stack spacing={2}>
        {data.certifications.map((cert, index) => {
          const difficultyColor = getDifficultyColor(cert.level);
          
          return (
          <Card
            key={index}
            elevation={0}
            sx={{
              border: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.2)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(ACCENTURE_COLORS.corePurple1, 0.02)} 0%, ${alpha(ACCENTURE_COLORS.corePurple1, 0.05)} 100%)`,
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'visible',
              '&:hover': {
                borderColor: alpha(ACCENTURE_COLORS.corePurple1, 0.4),
                boxShadow: `0 4px 12px ${alpha(ACCENTURE_COLORS.corePurple1, 0.1)}`
              }
            }}
          >
            <CardContent sx={{ p: 2.5 }}>
              
              {/* Header */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                <WorkspacePremium 
                  sx={{ 
                    color: ACCENTURE_COLORS.corePurple1,
                    mr: 2,
                    mt: 0.5,
                    fontSize: 28
                  }} 
                />
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 600,
                      color: ACCENTURE_COLORS.corePurple1,
                      fontSize: '1.1rem',
                      mb: 0.5
                    }}
                  >
                    {cert.title}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: alpha(theme.palette.text.primary, 0.7),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Business sx={{ fontSize: 16 }} />
                    {cert.issuer}
                  </Typography>
                </Box>
              </Box>
              
              {/* Skills */}
              {cert.skills.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 600,
                      mb: 1,
                      color: alpha(theme.palette.text.primary, 0.8)
                    }}
                  >
                    Skills Covered
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {cert.skills.map((skill, idx) => {
                      // Handle both string and object formats
                      const skillName = typeof skill === 'string' ? skill : skill.name || skill;
                      return (
                      <Chip
                        key={idx}
                        label={skillName}
                        size="small"
                        icon={<Code sx={{ fontSize: '14px !important' }} />}
                        sx={{
                          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1),
                          color: ACCENTURE_COLORS.corePurple3,
                          borderRadius: 1,
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            color: ACCENTURE_COLORS.corePurple1
                          }
                        }}
                      />
                      );
                    })}
                  </Box>
                </Box>
              )}
              
              {/* Details Grid */}
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 2, mb: 2 }}>
                {cert.focus && (
                  <Box>
                    <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6) }}>
                      Focus
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cert.focus}
                    </Typography>
                  </Box>
                )}
                
                {cert.level && (
                  <Box>
                    <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6) }}>
                      Level
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box 
                        sx={{ 
                          width: 8, 
                          height: 8, 
                          borderRadius: '50%', 
                          bgcolor: difficultyColor 
                        }} 
                      />
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {cert.level}
                      </Typography>
                    </Box>
                  </Box>
                )}
                
                {cert.type && (
                  <Box>
                    <Typography variant="caption" sx={{ color: alpha(theme.palette.text.primary, 0.6) }}>
                      Type
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {cert.type}
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Value Proposition or Match Details */}
              {(cert.value || (cert.matchDetails && (
                cert.matchDetails.exactSkillMatches?.length > 0 ||
                cert.matchDetails.goalAlignments?.length > 0 ||
                cert.matchDetails.skillGaps?.length > 0
              ))) && (
                <Box 
                  sx={{ 
                    p: 1.5,
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
                    borderRadius: 1,
                    borderLeft: `3px solid ${ACCENTURE_COLORS.corePurple1}`
                  }}
                >
                  {cert.value && (
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                      <EmojiEvents sx={{ fontSize: 18, color: ACCENTURE_COLORS.corePurple1, mt: 0.3 }} />
                      {cert.value}
                    </Typography>
                  )}
                  
                  {cert.matchDetails && (
                    <Box sx={{ mt: cert.value ? 1 : 0 }}>
                      {cert.matchDetails.exactSkillMatches?.length > 0 && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#4CAF50' }}>
                          <CheckCircle sx={{ fontSize: 14 }} />
                          Exact match: {cert.matchDetails.exactSkillMatches.join(', ')}
                        </Typography>
                      )}
                      {cert.matchDetails.goalAlignments?.length > 0 && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: ACCENTURE_COLORS.corePurple1, mt: 0.5 }}>
                          <EmojiEvents sx={{ fontSize: 14 }} />
                          Aligns with your goals
                        </Typography>
                      )}
                      {cert.matchDetails.skillGaps?.length > 0 && (
                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#FF9800', mt: 0.5 }}>
                          <TipsAndUpdates sx={{ fontSize: 14 }} />
                          New skills: {cert.matchDetails.skillGaps.slice(0, 2).join(', ')}{cert.matchDetails.skillGaps.length > 2 ? '...' : ''}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
              
              {/* Expandable Description */}
              {cert.description && (
                <Box sx={{ mt: 2 }}>
                  <Collapse in={expanded[index]} collapsedSize={60}>
                    <Typography variant="body2" sx={{ color: alpha(theme.palette.text.primary, 0.8) }}>
                      {cert.description}
                    </Typography>
                  </Collapse>
                  {cert.description.length > 100 && (
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(index)}
                      sx={{ mt: 1 }}
                    >
                      {expanded[index] ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
          );
        })}
      </Stack>
    </Box>
  );
};

// Component for skill development messages
const SkillDevelopmentView = ({ data, sx }) => {
  const theme = useTheme();
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <Box 
        sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 2,
          p: 2,
          bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05),
          borderRadius: 2
        }}
      >
        <Psychology sx={{ color: ACCENTURE_COLORS.corePurple1, fontSize: 28 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 600, color: ACCENTURE_COLORS.corePurple1 }}>
          Skill Development Path
        </Typography>
      </Box>
      <FormattedTextView text={data.content} />
    </Box>
  );
};

// Component for structured lists
const StructuredListView = ({ data, sx }) => {
  return (
    <Box sx={{ width: '100%', ...sx }}>
      <FormattedTextView text={data.content} />
    </Box>
  );
};

// Component for notes and warnings
const NoteWarningView = ({ data, sx }) => {
  const theme = useTheme();
  
  // Split content into main and note/warning parts
  const parts = data.content.split(/(?:\*\*Note[^:]*:\*\*|Note:|NOTA:|Warning:|Important:|Critical:)/i);
  const mainContent = parts[0];
  const noteContent = parts.slice(1).join(' ');
  
  return (
    <Box sx={{ width: '100%', ...sx }}>
      {/* Main content */}
      <FormattedTextView text={mainContent} />
      
      {/* Note/Warning section */}
      {noteContent && (
        <Paper
          elevation={0}
          sx={{
            mt: 2,
            p: 2,
            bgcolor: data.hasWarning 
              ? alpha(theme.palette.warning.main, 0.05)
              : alpha(theme.palette.info.main, 0.05),
            border: `1px solid ${
              data.hasWarning 
                ? alpha(theme.palette.warning.main, 0.2)
                : alpha(theme.palette.info.main, 0.2)
            }`,
            borderRadius: 1
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {data.hasWarning ? (
              <Warning sx={{ color: theme.palette.warning.main, fontSize: 20 }} />
            ) : (
              <Info sx={{ color: theme.palette.info.main, fontSize: 20 }} />
            )}
            <Typography variant="body2">
              {noteContent}
            </Typography>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

// Enhanced formatted text view with better styling
const FormattedTextView = ({ text, inline = false, sx }) => {
  const theme = useTheme();
  
  // Process text with all formatting patterns
  const processedText = text
    // Bold text
    .replace(PATTERNS.BOLD_TEXT, '<strong>$1</strong>')
    // Italic text
    .replace(PATTERNS.ITALIC_TEXT, '<em>$1</em>')
    // Section headers
    .replace(PATTERNS.SECTION_HEADER, '<h4>$1</h4>')
    // Numbered lists
    .replace(PATTERNS.NUMBERED_LIST, '<div class="numbered-item"><span class="number">$1.</span><span class="content">$2</span></div>')
    // Bullet lists
    .replace(PATTERNS.BULLET_LIST, '<div class="bullet-item"><span class="bullet">•</span><span class="content">$1</span></div>');
  
  const Component = inline ? 'span' : 'div';
  
  return (
    <Box
      component={Component}
      sx={{
        '& strong': {
          color: ACCENTURE_COLORS.corePurple1,
          fontWeight: 600
        },
        '& em': {
          fontStyle: 'italic',
          color: alpha(theme.palette.text.primary, 0.8)
        },
        '& h4': {
          fontSize: '1rem',
          fontWeight: 600,
          color: ACCENTURE_COLORS.corePurple1,
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(1),
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(1),
          '&:before': {
            content: '""',
            display: 'inline-block',
            width: 4,
            height: 20,
            backgroundColor: ACCENTURE_COLORS.corePurple1,
            borderRadius: 2,
            marginRight: theme.spacing(1)
          }
        },
        '& .numbered-item, & .bullet-item': {
          display: 'flex',
          alignItems: 'flex-start',
          marginBottom: theme.spacing(1),
          paddingLeft: theme.spacing(2)
        },
        '& .number': {
          minWidth: 24,
          color: ACCENTURE_COLORS.corePurple1,
          fontWeight: 600
        },
        '& .bullet': {
          minWidth: 20,
          color: ACCENTURE_COLORS.corePurple1,
          fontSize: '1.2rem',
          lineHeight: '1.2rem'
        },
        '& .content': {
          flex: 1,
          paddingLeft: theme.spacing(1)
        },
        ...sx
      }}
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
};

export default MessageContent;