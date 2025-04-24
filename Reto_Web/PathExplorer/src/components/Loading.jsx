import { useState, useEffect } from "react";
import { Box, CircularProgress, Typography, Fade } from "@mui/material";

const Loading = ({ loadingText = "Loading" }) => {
  const [progress, setProgress] = useState(0);
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  // Simulate loading progress
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 15;
        return newProgress >= 100 ? 100 : newProgress;
      });
    }, 100);

    // Show a message if loading takes too long
    const delayTimer = setTimeout(() => {
      setShowDelayedMessage(true);
    }, 5000);

    return () => {
      clearInterval(timer);
      clearTimeout(delayTimer);
    };
  }, []);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100%",
        backgroundColor: "background.paper",
      }}
    >
      <CircularProgress
        size={60}
        thickness={4}
        variant="determinate"
        value={progress}
        color="primary"
      />

      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Typography variant="h6" color="textPrimary" sx={{ mb: 1 }}>
          {loadingText}
        </Typography>

        <Typography variant="body2" color="textSecondary">
          {progress}%
        </Typography>

        <Fade in={showDelayedMessage} timeout={1000}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 2, maxWidth: "80%", textAlign: "center" }}
          >
            Taking longer than expected. Please wait...
          </Typography>
        </Fade>
      </Box>
    </Box>
  );
};

export default Loading;
