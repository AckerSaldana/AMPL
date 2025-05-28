import React from "react";
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  LinearProgress,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { ACCENTURE_COLORS, cardStyles } from "../styles/styles";

const SkeletonProjectCard = () => {
  return (
    <Card
      variant="outlined"
      sx={{
        ...cardStyles,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "none",
        border: "1px solid rgba(0,0,0,0.12)",
        transition: "all 0.2s ease-in-out",
        bgcolor: "#ffffff",
      }}
    >
      <CardContent
        sx={{
          p: 2.5,
          pb: 2,
          flexGrow: 1,
          backgroundColor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          borderRadius: "8px",
        }}
      >
        {/* Status Chip */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Skeleton 
            variant="rounded" 
            width={100} 
            height={24} 
            sx={{ 
              borderRadius: 5,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1) 
            }} 
          />
        </Box>

        {/* Project Logo and Title */}
        <Box sx={{ display: "flex", mb: 2 }}>
          <Skeleton
            variant="rounded"
            width={55}
            height={55}
            sx={{
              mr: 2,
              borderRadius: 0.5,
              flexShrink: 0,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.12)
            }}
          />
          <Box sx={{ width: "100%" }}>
            <Skeleton 
              variant="text" 
              width="80%" 
              height={24}
              sx={{ 
                mb: 0.5,
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
              }} 
            />
            <Skeleton 
              variant="text" 
              width="100%" 
              height={16} 
              sx={{ 
                mb: 0.25,
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.06)
              }} 
            />
            <Skeleton 
              variant="text" 
              width="90%" 
              height={16}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.06)
              }}
            />
          </Box>
        </Box>

        {/* Spacer to push content to consistent positions */}
        <Box sx={{ flexGrow: 1, minHeight: 8 }} />

        {/* Team Section */}
        <Box>
          <Skeleton 
            variant="text" 
            width={50} 
            height={16} 
            sx={{ 
              mb: 0.5,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
            }} 
          />
          <Box sx={{ mb: 1, display: "flex", mt: 1 }}>
            <Box sx={{ display: "flex", gap: 1 }}>
              {[...Array(4)].map((_, index) => (
                <Skeleton
                  key={index}
                  variant="circular"
                  width={36}
                  height={36}
                  sx={{ 
                    bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.1 + (index * 0.04)),
                  }}
                />
              ))}
            </Box>
          </Box>

          {/* Progress Bar */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Skeleton 
              variant="text" 
              width={100} 
              height={16}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
              }}
            />
            <Skeleton 
              variant="text" 
              width={30} 
              height={16}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
              }}
            />
          </Box>
          <Skeleton 
            variant="rounded"
            height={8}
            width="100%"
            sx={{ 
              borderRadius: 4, 
              mb: 3,
              bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.15),
            }}
          />
        </Box>

        {/* Dates */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            pt: 2,
            borderTop: `1px solid ${alpha(ACCENTURE_COLORS.corePurple1, 0.08)}`,
          }}
        >
          <Box>
            <Skeleton 
              variant="text" 
              width={80} 
              height={12}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05)
              }}
            />
            <Skeleton 
              variant="text" 
              width={70} 
              height={16}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
              }}
            />
          </Box>
          <Box sx={{ textAlign: "right" }}>
            <Skeleton 
              variant="text" 
              width={60} 
              height={12}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.05)
              }}
            />
            <Skeleton 
              variant="text" 
              width={70} 
              height={16}
              sx={{ 
                bgcolor: alpha(ACCENTURE_COLORS.corePurple1, 0.08)
              }}
            />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default SkeletonProjectCard;