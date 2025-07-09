'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import { IconButton } from "@mui/material";
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import {InformationCircleIcon} from '@heroicons/react/24/outline';

export default function VisMotInfoDialog() {
  const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <React.Fragment>
      <IconButton onClick={handleClickOpen} sx={{padding: 0}}>
        <InformationCircleIcon className="w-7 text-brand-main" />  
      </IconButton>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Visual Motion +"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Utilizza VisualMotion+ durante l’anamnesi o la valutazione dei pazienti per monitorare con precisione il loro range di movimento (ROM). Salva i dati e tienine traccia direttamente nella loro scheda clinica.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Ho capito
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
