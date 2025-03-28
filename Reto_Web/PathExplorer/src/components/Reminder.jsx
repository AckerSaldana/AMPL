import React from "react";
import {
  Typography,
  useTheme,
  Paper,
  Box,
  Button,
  rgbToHex,
} from "@mui/material";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export const Reminder = ({ events = [] }) => {
  const theme = useTheme();

  if (events.length === 0) return null;

  return (
    <Box>
      {events.map((event, index) => (
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            alignItems: "stretch",
            marginBottom: 2,
            minHeight: 80,
            height: "auto",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: 10,
              backgroundColor: theme.palette.primary.main,
              flexShrink: 0,
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              p: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                overflow: "hidden",
              }}
            >
              <Typography
                variant="caption"
                color="primary"
                fontWeight="bold"
                noWrap
              >
                {event.date}
              </Typography>
              <Typography
                variant="body2"
                noWrap
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {event.title}
              </Typography>
            </Box>
            <Button
              component={Link}
              to={event.url}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ flexShrink: 0 }}
            >
              View
            </Button>
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

Reminder.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      date: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
    })
  ),
};

export default Reminder;
