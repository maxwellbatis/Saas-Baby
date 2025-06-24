import { Request, Response } from 'express';
import prisma from '../config/database';
import { GamificationService } from '../services/gamification';
import { NotificationService } from '../services/notification.service';

export const getAllSymptoms = async (req: Request, res: Response) => {
  try {
    const { babyId } = req.query;
    const where = babyId ? { babyId: String(babyId) } : {};
    const symptoms = await prisma.symptomRecord.findMany({ where });
    res.json({ success: true, data: symptoms });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar sintomas', error });
  }
};

export const getSymptomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const symptom = await prisma.symptomRecord.findUnique({ where: { id } });
    if (!symptom) {
      return res.status(404).json({ success: false, message: 'Sintoma não encontrado' });
    }
    return res.json({ success: true, data: symptom });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar sintoma', error });
  }
};

export const createSymptom = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { description, intensity, startDate, endDate, babyId, notes, photoUrl } = req.body;

    if (!description || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Descrição e ID do bebê são obrigatórios',
      });
    }

    const symptom = await prisma.symptomRecord.create({
      data: {
        description,
        intensity,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        babyId,
        notes,
        photoUrl,
        userId: req.user.userId,
      },
    });

    // Gatilho de Gamificação
    try {
      const notificationService = new NotificationService();
      let gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });

      if (gamification) {
        gamification = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: { totalSymptomRecords: { increment: 1 } },
        });

        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const result = GamificationService.applyRule(gamification as any, { condition: 'symptom_recorded' } as any);

        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges : [];
        const newBadges = result.badges.filter((b: any) => !oldBadges.includes(b));

        if (newBadges.length > 0) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Nova Conquista!',
            body: `Você desbloqueou a badge: ${newBadges.join(', ')}`,
          });
        }

        await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: {
            points: result.points,
            level: result.level,
            badges: result.badges,
            streaks: result.streaks,
            achievements: result.achievements,
            dailyProgress: result.dailyProgress,
          },
        });
      }
    } catch (err) {
      console.error('Erro na gamificação (sintoma):', err);
    }

    return res.status(201).json({
      success: true,
      data: symptom,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar registro de sintoma',
    });
  }
};

export const updateSymptom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { description, intensity, startDate, endDate, notes, photoUrl } = req.body;
    const symptom = await prisma.symptomRecord.update({
      where: { id },
      data: { description, intensity, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, notes, photoUrl }
    });
    res.json({ success: true, data: symptom });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar sintoma', error });
  }
};

export const deleteSymptom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.symptomRecord.delete({ where: { id } });
    res.json({ success: true, message: 'Sintoma deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar sintoma', error });
  }
};

// --- MedicationRecord ---
export const getAllMedications = async (req: Request, res: Response) => {
  try {
    const { babyId } = req.query;
    const where = babyId ? { babyId: String(babyId) } : {};
    const medications = await prisma.medicationRecord.findMany({ where });
    res.json({ success: true, data: medications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar medicamentos', error });
  }
};

export const getMedicationById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const medication = await prisma.medicationRecord.findUnique({ where: { id } });
    if (!medication) {
      return res.status(404).json({ success: false, message: 'Medicamento não encontrado' });
    }
    return res.json({ success: true, data: medication });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar medicamento', error });
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { name, dosage, frequency, startDate, endDate, babyId, notes } = req.body;

    if (!name || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Nome do medicamento e ID do bebê são obrigatórios',
      });
    }

    const medication = await prisma.medicationRecord.create({
      data: {
        name,
        dosage,
        frequency,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        babyId,
        notes,
        userId: req.user.userId,
      },
    });

    // Gatilho de Gamificação
    try {
      const notificationService = new NotificationService();
      let gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });

      if (gamification) {
        gamification = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: { totalMedicationRecords: { increment: 1 } },
        });

        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const result = GamificationService.applyRule(gamification as any, { condition: 'medication_recorded' } as any);

        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges : [];
        const newBadges = result.badges.filter((b: any) => !oldBadges.includes(b));

        if (newBadges.length > 0) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Nova Conquista!',
            body: `Você desbloqueou a badge: ${newBadges.join(', ')}`,
          });
        }

        await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: {
            points: result.points,
            level: result.level,
            badges: result.badges,
            streaks: result.streaks,
            achievements: result.achievements,
            dailyProgress: result.dailyProgress,
          },
        });
      }
    } catch (err) {
      console.error('Erro na gamificação (medicamento):', err);
    }

    return res.status(201).json({
      success: true,
      data: medication,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar registro de medicamento',
    });
  }
};

export const updateMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, dosage, frequency, startDate, endDate, reason, notes } = req.body;
    const medication = await prisma.medicationRecord.update({
      where: { id },
      data: { name, dosage, frequency, startDate: startDate ? new Date(startDate) : undefined, endDate: endDate ? new Date(endDate) : undefined, reason, notes }
    });
    res.json({ success: true, data: medication });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar medicamento', error });
  }
};

export const deleteMedication = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.medicationRecord.delete({ where: { id } });
    res.json({ success: true, message: 'Medicamento deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar medicamento', error });
  }
};

// --- AppointmentRecord ---
export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const { babyId } = req.query;
    const where = babyId ? { babyId: String(babyId) } : {};
    const appointments = await prisma.appointmentRecord.findMany({ where });
    res.json({ success: true, data: appointments });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar consultas', error });
  }
};

export const getAppointmentById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await prisma.appointmentRecord.findUnique({ where: { id } });
    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Consulta não encontrada' });
    }
    return res.json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar consulta', error });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado',
      });
    }

    const { specialty, doctor, date, babyId, notes } = req.body;

    if (!specialty || !date || !babyId) {
      return res.status(400).json({
        success: false,
        error: 'Especialidade, data e ID do bebê são obrigatórios',
      });
    }

    const appointment = await prisma.appointmentRecord.create({
      data: {
        specialty,
        doctor,
        date: new Date(date),
        babyId,
        notes,
        userId: req.user.userId,
      },
    });

    // Gatilho de Gamificação
    try {
      const notificationService = new NotificationService();
      let gamification = await prisma.gamification.findUnique({ where: { userId: req.user.userId } });

      if (gamification) {
        gamification = await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: { totalAppointmentRecords: { increment: 1 } },
        });

        const rules = await prisma.gamificationRule.findMany({ where: { isActive: true } });
        const result = GamificationService.applyRule(gamification as any, { condition: 'appointment_recorded' } as any);

        const oldBadges = Array.isArray(gamification.badges) ? gamification.badges : [];
        const newBadges = result.badges.filter((b: any) => !oldBadges.includes(b));

        if (newBadges.length > 0) {
          await notificationService.sendPushNotification({
            userId: req.user.userId,
            title: 'Nova Conquista!',
            body: `Você desbloqueou a badge: ${newBadges.join(', ')}`,
          });
        }

        await prisma.gamification.update({
          where: { userId: req.user.userId },
          data: {
            points: result.points,
            level: result.level,
            badges: result.badges,
            streaks: result.streaks,
            achievements: result.achievements,
            dailyProgress: result.dailyProgress,
          },
        });
      }
    } catch (err) {
      console.error('Erro na gamificação (consulta):', err);
    }

    return res.status(201).json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar registro de consulta',
    });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, specialty, doctor, location, reason, notes } = req.body;
    const appointment = await prisma.appointmentRecord.update({
      where: { id },
      data: { date: date ? new Date(date) : undefined, specialty, doctor, location, reason, notes }
    });
    res.json({ success: true, data: appointment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar consulta', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.appointmentRecord.delete({ where: { id } });
    res.json({ success: true, message: 'Consulta deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar consulta', error });
  }
};

// --- PrenatalRecord ---
export const getAllPrenatals = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const prenatals = await prisma.prenatalRecord.findMany({ where: { userId } });
    res.json({ success: true, data: prenatals });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar registros de pré-natal', error });
  }
};

export const getPrenatalById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prenatal = await prisma.prenatalRecord.findUnique({ where: { id } });
    if (!prenatal) {
      return res.status(404).json({ success: false, message: 'Registro de pré-natal não encontrado' });
    }
    return res.json({ success: true, data: prenatal });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar registro de pré-natal', error });
  }
};

export const createPrenatal = async (req: Request, res: Response) => {
  try {
    const { date, description, type, result, doctor, location, notes } = req.body;
    const userId = req.user?.userId || req.body.userId;
    const prenatal = await prisma.prenatalRecord.create({
      data: { date: new Date(date), description, type, result, doctor, location, notes, userId }
    });
    res.status(201).json({ success: true, data: prenatal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao criar registro de pré-natal', error });
  }
};

export const updatePrenatal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { date, description, type, result, doctor, location, notes } = req.body;
    const prenatal = await prisma.prenatalRecord.update({
      where: { id },
      data: { date: date ? new Date(date) : undefined, description, type, result, doctor, location, notes }
    });
    res.json({ success: true, data: prenatal });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar registro de pré-natal', error });
  }
};

export const deletePrenatal = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.prenatalRecord.delete({ where: { id } });
    return res.json({ success: true, message: 'Registro de pré-natal deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao deletar registro de pré-natal', error });
  }
};

// --- VaccinationRecord ---
export const getAllVaccines = async (req: Request, res: Response) => {
  try {
    const { babyId } = req.query;
    const where = babyId ? { babyId: String(babyId) } : {};
    const vaccines = await prisma.vaccinationRecord.findMany({ where });
    res.json({ success: true, data: vaccines });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar vacinas', error });
  }
};

export const getVaccineById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vaccine = await prisma.vaccinationRecord.findUnique({ where: { id } });
    if (!vaccine) {
      return res.status(404).json({ success: false, message: 'Vacina não encontrada' });
    }
    return res.json({ success: true, data: vaccine });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao buscar vacina', error });
  }
};

export const createVaccine = async (req: Request, res: Response) => {
  try {
    const { name, date, nextDueDate, babyId, notes, batchNumber, clinic } = req.body;
    const userId = req.user?.userId || req.body.userId;
    if (!babyId) {
      return res.status(400).json({ success: false, message: 'babyId é obrigatório' });
    }
    const data: any = {
      name,
      date: new Date(date),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
      babyId,
      userId,
      notes,
      batchNumber,
      clinic,
    };
    const vaccine = await prisma.vaccinationRecord.create({ data });
    return res.status(201).json({ success: true, data: vaccine });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao criar vacina', error });
  }
};

export const updateVaccine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, date, nextDueDate, notes, batchNumber, clinic } = req.body;
    const vaccine = await prisma.vaccinationRecord.update({
      where: { id },
      data: {
        name,
        date: date ? new Date(date) : undefined,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
        notes,
        batchNumber,
        clinic,
      },
    });
    res.json({ success: true, data: vaccine });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao atualizar vacina', error });
  }
};

export const deleteVaccine = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.vaccinationRecord.delete({ where: { id } });
    res.json({ success: true, message: 'Vacina deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao deletar vacina', error });
  }
};

export const getUpcomingVaccines = async (req: Request, res: Response) => {
  try {
    const { babyId, days } = req.query;
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + Number(days || 30));
    const where: any = {
      nextDueDate: { gte: now, lte: future },
    };
    if (babyId) where.babyId = String(babyId);
    const vaccines = await prisma.vaccinationRecord.findMany({ where });
    res.json({ success: true, data: vaccines });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erro ao buscar vacinas próximas', error });
  }
}; 