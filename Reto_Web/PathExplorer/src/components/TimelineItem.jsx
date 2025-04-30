import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  useTheme,
} from "@mui/material";
import {
  WorkspacePremium,
  Code,
  CalendarMonth,
  Person,
  Business,
} from "@mui/icons-material";

const TimelineItem = ({ item, isLast, index, viewType }) => {
  const theme = useTheme();
  const isEven = index % 2 === 0;
  const isDesktop = viewType === "desktop";

  if (isDesktop) {
    return (
      <Box sx={{ display: "flex", mb: isLast ? 0 : 3 }}>
        {/* Left side content (for even items) */}
        {isEven ? (
          <Box sx={{ flex: 1, pr: 2, textAlign: "right" }}>
            <Card
              variant="outlined"
              sx={{
                borderRight:
                  item.type === "project"
                    ? `4px solid ${theme.palette.primary.main}`
                    : `4px solid ${theme.palette.secondary.main}`,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {item.name}
                </Typography>

                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mt={0.5}
                  justifyContent="flex-end"
                >
                  <Typography variant="caption" color="text.secondary">
                    {item.displayDate}
                  </Typography>
                  <CalendarMonth fontSize="small" color="action" />
                </Box>

                {item.type === "project" && (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mt={0.5}
                    justifyContent="flex-end"
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.role}
                    </Typography>
                    <Person fontSize="small" color="action" />
                  </Box>
                )}

                {item.type === "certification" && (
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mt={0.5}
                    justifyContent="flex-end"
                  >
                    <Typography variant="caption" color="text.secondary">
                      {item.issuer}
                    </Typography>
                    <Business fontSize="small" color="action" />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }}></Box>
        )}

        {/* Center timeline */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            px: 2,
          }}
        >
          {/* Dot */}
          <Avatar
            sx={{
              bgcolor: "white",
              color:
                item.type === "project"
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
              border: `2px solid ${
                item.type === "project"
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main
              }`,
              width: 36,
              height: 36,
            }}
          >
            {item.type === "project" ? <Code /> : <WorkspacePremium />}
          </Avatar>

          {/* Connector line */}
          {!isLast && (
            <Box
              sx={{
                width: 2,
                bgcolor: "grey.300",
                height: 50,
                mt: 1,
              }}
            />
          )}
        </Box>

        {/* Right side content (for odd items) */}
        {!isEven ? (
          <Box sx={{ flex: 1, pl: 2 }}>
            <Card
              variant="outlined"
              sx={{
                borderLeft:
                  item.type === "project"
                    ? `4px solid ${theme.palette.primary.main}`
                    : `4px solid ${theme.palette.secondary.main}`,
                transition: "transform 0.2s",
                "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
              }}
            >
              <CardContent sx={{ py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="medium">
                  {item.name}
                </Typography>

                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <CalendarMonth fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {item.displayDate}
                  </Typography>
                </Box>

                {item.type === "project" && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Person fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {item.role}
                    </Typography>
                  </Box>
                )}

                {item.type === "certification" && (
                  <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                    <Business fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {item.issuer}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        ) : (
          <Box sx={{ flex: 1 }}></Box>
        )}
      </Box>
    );
  } else {
    // Mobile view
    return (
      <Box sx={{ display: "flex", mb: isLast ? 0 : 3 }}>
        {/* Left side timeline */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mr: 2,
            minWidth: 40,
          }}
        >
          {/* Dot */}
          <Avatar
            sx={{
              bgcolor: "white",
              color:
                item.type === "project"
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main,
              border: `2px solid ${
                item.type === "project"
                  ? theme.palette.primary.main
                  : theme.palette.secondary.main
              }`,
              width: 32,
              height: 32,
            }}
          >
            {item.type === "project" ? (
              <Code fontSize="small" />
            ) : (
              <WorkspacePremium fontSize="small" />
            )}
          </Avatar>

          {/* Connector line */}
          {!isLast && (
            <Box
              sx={{
                width: 2,
                bgcolor: "grey.300",
                flexGrow: 1,
                minHeight: 30,
                mt: 1,
              }}
            />
          )}
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1 }}>
          <Card
            variant="outlined"
            sx={{
              borderLeft:
                item.type === "project"
                  ? `4px solid ${theme.palette.primary.main}`
                  : `4px solid ${theme.palette.secondary.main}`,
              transition: "transform 0.2s",
              "&:hover": { transform: "translateY(-2px)", boxShadow: 2 },
            }}
          >
            <CardContent sx={{ py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {item.name}
              </Typography>

              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <CalendarMonth fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {item.displayDate}
                </Typography>
              </Box>

              {item.type === "project" && (
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Person fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {item.role}
                  </Typography>
                </Box>
              )}

              {item.type === "certification" && (
                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                  <Business fontSize="small" color="action" />
                  <Typography variant="caption" color="text.secondary">
                    {item.issuer}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>
    );
  }
};

export default TimelineItem;
