import React from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Divider,
  Stack,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export const Role = () => {
  // Datos simulados para skills seleccionadas
  const selectedSkills = [
    { name: "NextJS", years: 3 },
    { name: "React", years: 2 },
  ];

  return (
    <Box>
      <Typography
        variant="subtitle1"
        fontWeight={600}
        mb={2}
        color="text.secondary"
      >
        Role name
      </Typography>
      <TextField fullWidth size="small" placeholder="Frontend Developer" />

      <Typography
        variant="subtitle1"
        fontWeight={600}
        mt={2}
        mb={1}
        color="text.secondary"
      >
        Area
      </Typography>
      <TextField
        select
        fullWidth
        size="small"
        value="FRONTEND"
        color="text.secondary"
      >
        <MenuItem value="FRONTEND">FRONTEND</MenuItem>
        <MenuItem value="BACKEND">BACKEND</MenuItem>
        <MenuItem value="FULLSTACK">FULLSTACK</MenuItem>
      </TextField>

      <Typography
        variant="subtitle1"
        fontWeight={600}
        mt={2}
        mb={1}
        color="text.secondary"
      >
        Years of experience on the area
      </Typography>
      <TextField fullWidth size="small" placeholder="3" />

      <Typography
        variant="subtitle1"
        fontWeight={600}
        mt={2}
        mb={1}
        color="text.secondary"
      >
        Description
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        placeholder="Add a description here..."
      />

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="subtitle1"
        fontWeight={600}
        mb={2}
        color="text.secondary"
      >
        Skills selected
      </Typography>

      <Stack spacing={2}>
        {selectedSkills.map((skill, index) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              border: "1px solid #ccc",
              borderRadius: 2,
              p: 1,
            }}
          >
            <Typography sx={{ flex: 1 }}>{skill.name}</Typography>
            <TextField
              size="small"
              type="number"
              label="Years of Experience"
              defaultValue={skill.years}
              inputProps={{ min: 0 }}
              sx={{ width: 150 }}
            />
            <IconButton color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};
