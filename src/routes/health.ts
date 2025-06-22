import { Router } from 'express';
import {
  getAllSymptoms,
  getSymptomById,
  createSymptom,
  updateSymptom,
  deleteSymptom,
  getAllMedications,
  getMedicationById,
  createMedication,
  updateMedication,
  deleteMedication,
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAllPrenatals,
  getPrenatalById,
  createPrenatal,
  updatePrenatal,
  deletePrenatal,
  getAllVaccines,
  getVaccineById,
  createVaccine,
  updateVaccine,
  deleteVaccine,
  getUpcomingVaccines
} from '../controllers/health.controller';
import { authenticateUser } from '../middlewares/auth';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});

// Rotas de sintomas
router.get('/symptoms', authenticateUser, getAllSymptoms);
router.get('/symptoms/:id', authenticateUser, getSymptomById);
router.post('/symptoms', authenticateUser, createSymptom);
router.put('/symptoms/:id', authenticateUser, updateSymptom);
router.delete('/symptoms/:id', authenticateUser, deleteSymptom);

// Rotas de medicamentos
router.get('/medications', authenticateUser, getAllMedications);
router.get('/medications/:id', authenticateUser, getMedicationById);
router.post('/medications', authenticateUser, createMedication);
router.put('/medications/:id', authenticateUser, updateMedication);
router.delete('/medications/:id', authenticateUser, deleteMedication);

// Rotas de consultas
router.get('/appointments', authenticateUser, getAllAppointments);
router.get('/appointments/:id', authenticateUser, getAppointmentById);
router.post('/appointments', authenticateUser, createAppointment);
router.put('/appointments/:id', authenticateUser, updateAppointment);
router.delete('/appointments/:id', authenticateUser, deleteAppointment);

// Rotas de pré-natal
router.get('/prenatals', authenticateUser, getAllPrenatals);
router.get('/prenatals/:id', authenticateUser, getPrenatalById);
router.post('/prenatals', authenticateUser, createPrenatal);
router.put('/prenatals/:id', authenticateUser, updatePrenatal);
router.delete('/prenatals/:id', authenticateUser, deletePrenatal);

// Rotas de vacinas
router.get('/vaccines', authenticateUser, getAllVaccines);
router.get('/vaccines/upcoming', authenticateUser, getUpcomingVaccines);
router.get('/vaccines/:id', authenticateUser, getVaccineById);
router.post('/vaccines', authenticateUser, createVaccine);
router.put('/vaccines/:id', authenticateUser, updateVaccine);
router.delete('/vaccines/:id', authenticateUser, deleteVaccine);

export default router; 