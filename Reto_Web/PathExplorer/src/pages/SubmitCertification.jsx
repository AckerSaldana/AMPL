import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { supabase } from '../supabase/supabaseClient';
import uploadEvidenceToSupabase from '../utils/uploadEvidenceToSupabase';

const SubmitCertification = ({ onClose }) => {
  const [file, setFile] = useState(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [completedDate, setCompletedDate] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [score, setScore] = useState('');
  const [certifications, setCertifications] = useState([]);
  const [selectedCertificationId, setSelectedCertificationId] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchCertifications = async () => {
      const { data, error } = await supabase
        .from('Certifications')
        .select('certification_id, title');

      if (error) {
        console.error('Error fetching certifications:', error);
      } else {
        setCertifications(data);
      }
    };

    fetchCertifications();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0];
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setPdfPreviewUrl(URL.createObjectURL(selected));
    } else {
      alert("Please upload a valid PDF file.");
      setFile(null);
      setPdfPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPdfPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
    }
  };

  const handleSubmit = async () => {
    if (!file || !completedDate || !validUntil || !score || !selectedCertificationId) {
      alert("Please complete all fields before submitting.");
      return;
    }

    try {
      const publicUrl = await uploadEvidenceToSupabase(file);
      const user = await supabase.auth.getUser();

      const { error } = await supabase.from('UserCertifications').insert({
        user_ID: user.data.user.id,
        certification_ID: selectedCertificationId,
        completed_Date: completedDate,
        valid_Until: validUntil,
        score: parseInt(score),
        evidence: publicUrl,
      });

      if (error) throw new Error(`Insert error: ${error.message}`);

      alert('Certification submitted successfully!');
      setFile(null);
      setPdfPreviewUrl(null);
      setCompletedDate('');
      setValidUntil('');
      setScore('');
      setSelectedCertificationId('');
      fileInputRef.current.value = null;
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Submit Certification Evidence
      </Typography>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <Button onClick={onClose}  size="small" variant="outlined">
          Close
        </Button>
      </Box>


      <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 2 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="certification-label">Select Certification</InputLabel>
          <Select
            labelId="certification-label"
            value={selectedCertificationId}
            onChange={(e) => setSelectedCertificationId(e.target.value)}
            label="Select Certification"
          >
            <MenuItem value="">Select one</MenuItem>
            {certifications.map((cert) => (
              <MenuItem key={cert.certification_id} value={cert.certification_id}>
                {cert.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          component="label"
          variant="outlined"
          fullWidth
          startIcon={<UploadFileIcon />}
          sx={{ mb: 2 }}
        >
          Upload PDF
          <input
            type="file"
            hidden
            accept=".pdf"
            onChange={handleFileChange}
            ref={fileInputRef}
          />
        </Button>

        {file && (
          <Box>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              Selected File: <strong>{file.name}</strong>
            </Typography>

            <Button
              size="small"
              startIcon={<DeleteIcon />}
              color="error"
              onClick={handleRemoveFile}
              sx={{ mb: 2 }}
            >
              Remove File
            </Button>
          </Box>
        )}

        {pdfPreviewUrl && (
          <Box sx={{ mt: 2, mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
              PDF Preview:
            </Typography>
            <iframe
              src={pdfPreviewUrl}
              width="100%"
              height="400px"
              style={{ border: "1px solid #ccc", borderRadius: "8px" }}
              title="PDF Preview"
            />
          </Box>
        )}

        <TextField
          fullWidth
          type="date"
          label="Completed Date"
          InputLabelProps={{ shrink: true }}
          value={completedDate}
          onChange={(e) => setCompletedDate(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          type="date"
          label="Valid Until"
          InputLabelProps={{ shrink: true }}
          value={validUntil}
          onChange={(e) => setValidUntil(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="Score (1 - 100)"
          value={score}
          onChange={(e) => {
            const input = e.target.value;

            // Permitir solo dígitos (no letras, símbolos, ni más de 3 dígitos)
            if (/^\d{0,3}$/.test(input)) {
              setScore(input);
            }
          }}
          onBlur={() => {
            const num = parseInt(score);
            if (isNaN(num) || num < 1 || num > 100) {
              setScore('');
            }
          }}
          error={score !== '' && (parseInt(score) < 1 || parseInt(score) > 100)}
          helperText={
            score !== '' && (parseInt(score) < 1 || parseInt(score) > 100)
              ? "Score must be between 1 and 100"
              : ""
          }
          inputProps={{
            inputMode: "numeric",
            pattern: "[0-9]*",
            maxLength: 3,
          }}
          sx={{ mb: 3 }}
        />


        <Button
          variant="contained"
          fullWidth
          onClick={handleSubmit}
          sx={{ fontWeight: 600 }}
        >
          Submit
        </Button>
      </Paper>
    </Box>
  );
};

export default SubmitCertification;
