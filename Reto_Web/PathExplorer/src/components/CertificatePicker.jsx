import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Chip,
  Stack,
  Paper,
  Fade,
  IconButton,
  CircularProgress,
  Tooltip,
  Avatar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import FilterListIcon from "@mui/icons-material/FilterList";
import { ACCENTURE_COLORS, formFieldStyles } from "../styles/styles";
import { supabase } from "../supabase/supabaseClient";

const CertificatePicker = ({
  onCertificateAdd,
  selectedCertificateIds = [],
}) => {
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [uniqueTypes, setUniqueTypes] = useState(["all"]);

  // Load certificates from database
  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        setLoadingCertificates(true);
        const { data, error } = await supabase
          .from("Certifications")
          .select(
            "certification_id, title, issuer, type, description, url, certification_Image"
          );

        if (error) throw error;

        // Transform data into the format we need
        const formattedCertificates = data.map((cert) => ({
          id: cert.certification_id,
          title: cert.title || "Untitled Certificate",
          issuer: cert.issuer || "Unknown Issuer",
          type: cert.type || "General",
          description: cert.description || "",
          url: cert.url || "",
          image: cert.certification_Image || "",
        }));

        setAvailableCertificates(formattedCertificates);

        // Extract unique certificate types for filtering
        const types = [
          "all",
          ...new Set(data.map((cert) => cert.type).filter(Boolean)),
        ];
        setUniqueTypes(types);
      } catch (error) {
        console.error("Error fetching certificates:", error);
      } finally {
        setLoadingCertificates(false);
      }
    };

    fetchCertificates();
  }, []);

  // Filter certificates based on search term and type filter
  const filteredCertificates = availableCertificates.filter((cert) => {
    const matchesSearch =
      cert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.issuer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || cert.type === typeFilter;

    return matchesSearch && matchesType;
  });

  // Get certificate initial letter or image for avatar
  const getCertificateAvatar = (cert) => {
    if (cert.image) {
      return (
        <Avatar
          src={cert.image}
          alt={cert.title}
          sx={{
            width: 32,
            height: 32,
            borderRadius: "6px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
          }}
        />
      );
    } else {
      return (
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "6px",
            backgroundColor: `${ACCENTURE_COLORS.accentPurple1}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: ACCENTURE_COLORS.accentPurple1,
            fontWeight: "bold",
            fontSize: "0.7rem",
            flexShrink: 0,
          }}
        >
          {cert.title[0].toUpperCase()}
        </Box>
      );
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        bgcolor: "rgba(255,255,255,0.8)",
        border: "1px solid rgba(0,0,0,0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="subtitle2"
        fontWeight={600}
        sx={{
          color: ACCENTURE_COLORS.corePurple2,
          mb: 2,
          pb: 1,
          borderBottom: `1px solid ${ACCENTURE_COLORS.accentPurple5}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SchoolIcon fontSize="small" />
          Available Certificates
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={`${availableCertificates.length} total`}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.625rem",
              bgcolor: ACCENTURE_COLORS.accentPurple5,
              color: ACCENTURE_COLORS.corePurple2,
              fontWeight: 600,
            }}
          />
          <Tooltip title="Toggle filters">
            <IconButton
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              sx={{
                width: 24,
                height: 24,
                color: showFilters
                  ? ACCENTURE_COLORS.corePurple1
                  : ACCENTURE_COLORS.corePurple3,
                bgcolor: showFilters
                  ? `${ACCENTURE_COLORS.accentPurple5}`
                  : "transparent",
              }}
            >
              <FilterListIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Typography>

      {/* Search and filter area */}
      <Box sx={{ mb: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search certificates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            ...formFieldStyles,
            "& .MuiOutlinedInput-root": {
              ...formFieldStyles["& .MuiOutlinedInput-root"],
              backgroundColor: "white",
              borderRadius: 6,
              fontSize: "0.8rem",
            },
          }}
        />

        {showFilters && (
          <Fade in={true}>
            <FormControl size="small" fullWidth sx={{ mt: 1 }}>
              <InputLabel
                id="certificate-type-label"
                sx={{ fontSize: "0.8rem" }}
              >
                Certificate Type
              </InputLabel>
              <Select
                labelId="certificate-type-label"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Certificate Type"
                sx={{
                  ...formFieldStyles["& .MuiOutlinedInput-root"],
                  backgroundColor: "white",
                  borderRadius: 6,
                  fontSize: "0.8rem",
                }}
              >
                {uniqueTypes.map((type) => (
                  <MenuItem key={type} value={type} sx={{ fontSize: "0.8rem" }}>
                    {type === "all" ? "All Types" : type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Fade>
        )}
      </Box>

      <Box
        sx={{
          height: "250px",
          overflow: "hidden",
          position: "relative",
          borderRadius: 2,
          bgcolor: "rgba(255,255,255,0.5)",
          border: "1px solid rgba(0,0,0,0.03)",
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.02)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            height: "100%",
            overflowY: "auto",
            py: 1,
            "&::-webkit-scrollbar": {
              width: "6px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "rgba(0,0,0,0.02)",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: ACCENTURE_COLORS.accentPurple5,
              borderRadius: "3px",
              "&:hover": {
                backgroundColor: ACCENTURE_COLORS.accentPurple4,
              },
            },
          }}
        >
          {loadingCertificates ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress
                size={24}
                sx={{ color: ACCENTURE_COLORS.corePurple1 }}
              />
            </Box>
          ) : filteredCertificates.length > 0 ? (
            <Stack spacing={1} sx={{ px: 1.5 }}>
              {filteredCertificates.map((cert, index) => (
                <Fade
                  key={cert.id}
                  in={true}
                  timeout={300}
                  style={{ transitionDelay: `${index * 30}ms` }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      p: 1.5,
                      borderRadius: 1.5,
                      bgcolor: "white",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                      border: "1px solid rgba(0,0,0,0.04)",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                        borderColor: ACCENTURE_COLORS.accentPurple4,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1.5}>
                      {getCertificateAvatar(cert)}
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color={ACCENTURE_COLORS.corePurple3}
                          fontSize="0.8rem"
                        >
                          {cert.title}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: ACCENTURE_COLORS.accentPurple2,
                              }}
                            />
                            {cert.issuer}
                          </Typography>
                          <Chip
                            label={cert.type}
                            size="small"
                            sx={{
                              height: 16,
                              fontSize: "0.6rem",
                              bgcolor: `${ACCENTURE_COLORS.accentPurple5}60`,
                              color: ACCENTURE_COLORS.corePurple2,
                            }}
                          />
                        </Box>
                        {cert.description && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.7rem",
                              display: "-webkit-box",
                              overflow: "hidden",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: 2,
                              mt: 0.5,
                              maxWidth: "240px",
                            }}
                          >
                            {cert.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Tooltip
                      title={
                        selectedCertificateIds.includes(cert.id)
                          ? "Already added"
                          : "Add certificate"
                      }
                    >
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => onCertificateAdd(cert)}
                          disabled={selectedCertificateIds.includes(cert.id)}
                          sx={{
                            color: ACCENTURE_COLORS.corePurple1,
                            bgcolor: selectedCertificateIds.includes(cert.id)
                              ? `${ACCENTURE_COLORS.accentPurple4}50`
                              : `${ACCENTURE_COLORS.accentPurple5}90`,
                            width: 28,
                            height: 28,
                            "&:hover": {
                              bgcolor: ACCENTURE_COLORS.accentPurple5,
                            },
                            "&.Mui-disabled": {
                              bgcolor: `${ACCENTURE_COLORS.accentPurple4}30`,
                              color: `${ACCENTURE_COLORS.corePurple1}50`,
                            },
                          }}
                        >
                          <AddCircleIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Box>
                    </Tooltip>
                  </Box>
                </Fade>
              ))}
            </Stack>
          ) : (
            <Box sx={{ textAlign: "center", p: 3 }}>
              <Typography variant="body2" color="text.secondary">
                No certificates match your search
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {filteredCertificates.length > 0 && !loadingCertificates && (
        <Typography
          variant="caption"
          align="center"
          sx={{
            color: "text.secondary",
            mt: 1,
            fontSize: "0.7rem",
          }}
        >
          Showing {filteredCertificates.length} of{" "}
          {availableCertificates.length} certificates
        </Typography>
      )}
    </Paper>
  );
};

export default CertificatePicker;
