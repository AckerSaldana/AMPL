import React from "react";
import { Box, Paper, Skeleton } from "@mui/material";
import { ACCENTURE_COLORS } from "../styles/styles";

const VirtualAssistantSkeleton = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Skeleton
            variant="circular"
            width={40}
            height={40}
            sx={{
              bgcolor: `${ACCENTURE_COLORS.corePurple1}15`,
            }}
          />
          <Skeleton
            variant="text"
            width={120}
            height={28}
            sx={{
              bgcolor: `${ACCENTURE_COLORS.corePurple1}10`,
            }}
          />
        </Box>

        <Skeleton
          variant="rectangular"
          width={60}
          height={32}
          sx={{
            bgcolor: `${ACCENTURE_COLORS.corePurple1}08`,
            borderRadius: 1,
          }}
        />
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flexGrow: 1,
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          bgcolor: "rgba(0,0,0,0.01)",
          overflowY: "hidden",
        }}
      >
        {/* Assistant message */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            maxWidth: "80%",
          }}
        >
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{
              bgcolor: `${ACCENTURE_COLORS.corePurple1}15`,
            }}
          />
          <Box>
            <Skeleton
              variant="rounded"
              width={240}
              height={90}
              sx={{
                bgcolor: `${ACCENTURE_COLORS.corePurple1}10`,
                borderRadius: "0px 16px 16px 16px",
              }}
            />
          </Box>
        </Box>

        {/* User message */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            maxWidth: "80%",
            alignSelf: "flex-end",
            flexDirection: "row-reverse",
          }}
        >
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{
              bgcolor: `${ACCENTURE_COLORS.corePurple1}15`,
            }}
          />
          <Box>
            <Skeleton
              variant="rounded"
              width={180}
              height={60}
              sx={{
                bgcolor: `${ACCENTURE_COLORS.corePurple1}20`,
                borderRadius: "16px 0px 16px 16px",
              }}
            />
          </Box>
        </Box>

        {/* Assistant message again */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "flex-start",
            maxWidth: "80%",
          }}
        >
          <Skeleton
            variant="circular"
            width={36}
            height={36}
            sx={{
              bgcolor: `${ACCENTURE_COLORS.corePurple1}15`,
            }}
          />
          <Box>
            <Skeleton
              variant="rounded"
              width={260}
              height={40}
              sx={{
                bgcolor: `${ACCENTURE_COLORS.corePurple1}10`,
                borderRadius: "0px 16px 16px 16px",
                mb: 1,
              }}
            />
            <Skeleton
              variant="rounded"
              width={220}
              height={40}
              sx={{
                bgcolor: `${ACCENTURE_COLORS.corePurple1}10`,
                borderRadius: "0px 16px 16px 16px",
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Input Area */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Skeleton
          variant="rounded"
          width="100%"
          height={48}
          sx={{
            bgcolor: `${ACCENTURE_COLORS.corePurple1}08`,
            borderRadius: 2,
          }}
        />
        <Skeleton
          variant="circular"
          width={48}
          height={48}
          sx={{
            bgcolor: `${ACCENTURE_COLORS.corePurple1}15`,
            flexShrink: 0,
          }}
        />
      </Box>
    </Paper>
  );
};

export default VirtualAssistantSkeleton;