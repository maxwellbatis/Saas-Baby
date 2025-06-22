import React, { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Table } from '../components/ui/table';
import {
  getSymptoms, createSymptom, updateSymptom, deleteSymptom,
  getMedications, createMedication, updateMedication, deleteMedication,
  getAppointments, createAppointment, updateAppointment, deleteAppointment,
  getPrenatals, createPrenatal, updatePrenatal, deletePrenatal,
  getVaccines, createVaccine, updateVaccine, deleteVaccine, getUpcomingVaccines
} from '../lib/api';
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from "@/components/ui/select";
import BackButton from '../components/BackButton';
import { Card, CardContent } from '../components/ui/card';
import { useTheme } from "@/contexts/ThemeContext";
import { Pencil, Trash2, PlusCircle, Utensils, Bot } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';
import HealthAlertsCard from '../components/HealthAlertsCard';
import FeedingTipsModal from '../components/FeedingTipsModal';
import PersonalizedAdviceModal from '../components/PersonalizedAdviceModal';
import Header from '../components/Header';

const initialSymptom = { description: '', intensity: '', startDate: '', endDate: '' };
const initialMedication = { name: '', dosage: '', frequency: '', startDate: '', endDate: '', reason: '' };
const initialAppointment = { date: '', specialty: '', doctor: '', location: '', reason: '', notes: '' };
const initialPrenatal = { date: '', description: '', type: '', result: '', doctor: '', location: '', notes: '' };
const initialVaccine = { name: '', date: '', nextDueDate: '', notes: '', batchNumber: '', clinic: '' };

const Health: React.FC = () => {
  const [tab, setTab] = useState('symptoms');
  // Sintomas
  const [symptoms, setSymptoms] = useState([]);
  const [loadingSymptoms, setLoadingSymptoms] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [symptomForm, setSymptomForm] = useState(initialSymptom);
  const [editingSymptom, setEditingSymptom] = useState(null);
  const [savingSymptom, setSavingSymptom] = useState(false);
  // Medicamentos
  const [medications, setMedications] = useState([]);
  const [loadingMedications, setLoadingMedications] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [medicationForm, setMedicationForm] = useState(initialMedication);
  const [editingMedication, setEditingMedication] = useState(null);
  const [savingMedication, setSavingMedication] = useState(false);
  // Consultas
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [appointmentForm, setAppointmentForm] = useState(initialAppointment);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [savingAppointment, setSavingAppointment] = useState(false);
  // Pré-natal
  const [prenatals, setPrenatals] = useState([]);
  const [loadingPrenatals, setLoadingPrenatals] = useState(false);
  const [showPrenatalModal, setShowPrenatalModal] = useState(false);
  const [prenatalForm, setPrenatalForm] = useState(initialPrenatal);
  const [editingPrenatal, setEditingPrenatal] = useState(null);
  const [savingPrenatal, setSavingPrenatal] = useState(false);
  // Vacinas
  const [vaccines, setVaccines] = useState([]);
  const [loadingVaccines, setLoadingVaccines] = useState(false);
  const [showVaccineModal, setShowVaccineModal] = useState(false);
  const [vaccineForm, setVaccineForm] = useState(initialVaccine);
  const [editingVaccine, setEditingVaccine] = useState(null);
  const [savingVaccine, setSavingVaccine] = useState(false);
  const [upcomingVaccines, setUpcomingVaccines] = useState([]);
  const [feedingTipsOpen, setFeedingTipsOpen] = useState(false);
  const [adviceOpen, setAdviceOpen] = useState(false);

  const { babies, currentBaby, isLoading: isAuthLoading, hasBaby, error: authError } = useAuth();
  const [selectedBabyId, setSelectedBabyId] = useState(currentBaby?.id || "");
  const { getGradientClass, getBgClass } = useTheme();

  useEffect(() => {
    if (currentBaby) setSelectedBabyId(currentBaby.id);
  }, [currentBaby]);

  useEffect(() => {
    if (tab === 'symptoms') fetchSymptoms();
    if (tab === 'medications') fetchMedications();
    if (tab === 'appointments') fetchAppointments();
    if (tab === 'prenatal') fetchPrenatals();
    if (tab === 'vaccines') { fetchVaccines(); fetchUpcomingVaccines(); }
  }, [tab]);

  // Fetchers
  const fetchSymptoms = () => {
    if (!selectedBabyId) return;
    setLoadingSymptoms(true);
    getSymptoms(selectedBabyId).then(res => {
      setSymptoms(res.data || []);
      setLoadingSymptoms(false);
    });
  };
  const fetchMedications = () => {
    if (!selectedBabyId) return;
    setLoadingMedications(true);
    getMedications(selectedBabyId).then(res => {
      setMedications(res.data || []);
      setLoadingMedications(false);
    });
  };
  const fetchAppointments = () => {
    if (!selectedBabyId) return;
    setLoadingAppointments(true);
    getAppointments(selectedBabyId).then(res => {
      setAppointments(res.data || []);
      setLoadingAppointments(false);
    });
  };
  const fetchPrenatals = () => {
    setLoadingPrenatals(true);
    getPrenatals().then(res => {
      setPrenatals(res.data || []);
      setLoadingPrenatals(false);
    });
  };
  const fetchVaccines = () => {
    if (!selectedBabyId) return;
    setLoadingVaccines(true);
    getVaccines(selectedBabyId).then(res => {
      setVaccines(res.data || []);
      setLoadingVaccines(false);
    });
  };
  const fetchUpcomingVaccines = () => {
    if (!selectedBabyId) return;
    getUpcomingVaccines(selectedBabyId, 30).then(res => {
      setUpcomingVaccines(res.data || []);
    });
  };

  // Handlers genéricos para formulários
  const handleInput = (formSetter) => (e) => {
    formSetter((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // CRUD Sintomas
  const handleSaveSymptom = async (e) => {
    e.preventDefault();
    setSavingSymptom(true);
    if (editingSymptom) {
      await updateSymptom(editingSymptom.id, { ...symptomForm, babyId: selectedBabyId });
    } else {
      await createSymptom({ ...symptomForm, babyId: selectedBabyId });
    }
    setSavingSymptom(false);
    setShowSymptomModal(false);
    setSymptomForm(initialSymptom);
    setEditingSymptom(null);
    fetchSymptoms();
    toast({ title: "Sucesso", description: "Sintoma salvo com sucesso!" });
  };
  const handleEditSymptom = (s) => {
    setEditingSymptom(s);
    setSymptomForm({
      description: s.description,
      intensity: s.intensity,
      startDate: s.startDate ? s.startDate.slice(0, 10) : '',
      endDate: s.endDate ? s.endDate.slice(0, 10) : ''
    });
    setShowSymptomModal(true);
  };
  const handleDeleteSymptom = async (id) => {
    const res = await deleteSymptom(id);
    fetchSymptoms();
    if (res && res.success) {
      toast({ title: "Sucesso", description: "Sintoma excluído com sucesso!" });
    } else {
      toast({ title: "Erro", description: "Não foi possível excluir o sintoma.", variant: "destructive" });
    }
  };

  // CRUD Medicamentos
  const handleSaveMedication = async (e) => {
    e.preventDefault();
    setSavingMedication(true);
    if (editingMedication) {
      await updateMedication(editingMedication.id, { ...medicationForm, babyId: selectedBabyId });
    } else {
      await createMedication({ ...medicationForm, babyId: selectedBabyId });
    }
    setSavingMedication(false);
    setShowMedicationModal(false);
    setMedicationForm(initialMedication);
    setEditingMedication(null);
    fetchMedications();
    toast({ title: "Sucesso", description: "Medicamento salvo com sucesso!" });
  };
  const handleEditMedication = (m) => {
    setEditingMedication(m);
    setMedicationForm({
      name: m.name,
      dosage: m.dosage,
      frequency: m.frequency,
      startDate: m.startDate ? m.startDate.slice(0, 10) : '',
      endDate: m.endDate ? m.endDate.slice(0, 10) : '',
      reason: m.reason || ''
    });
    setShowMedicationModal(true);
  };
  const handleDeleteMedication = async (id) => {
    const res = await deleteMedication(id);
    fetchMedications();
    if (res && res.success) {
      toast({ title: "Sucesso", description: "Medicamento excluído com sucesso!" });
    } else {
      toast({ title: "Erro", description: "Não foi possível excluir o medicamento.", variant: "destructive" });
    }
  };

  // CRUD Consultas
  const handleSaveAppointment = async (e) => {
    e.preventDefault();
    setSavingAppointment(true);
    if (editingAppointment) {
      await updateAppointment(editingAppointment.id, { ...appointmentForm, babyId: selectedBabyId });
    } else {
      await createAppointment({ ...appointmentForm, babyId: selectedBabyId });
    }
    setSavingAppointment(false);
    setShowAppointmentModal(false);
    setAppointmentForm(initialAppointment);
    setEditingAppointment(null);
    fetchAppointments();
    toast({ title: "Sucesso", description: "Consulta salva com sucesso!" });
  };
  const handleEditAppointment = (a) => {
    setEditingAppointment(a);
    setAppointmentForm({
      date: a.date ? a.date.slice(0, 10) : '',
      specialty: a.specialty,
      doctor: a.doctor || '',
      location: a.location || '',
      reason: a.reason || '',
      notes: a.notes || ''
    });
    setShowAppointmentModal(true);
  };
  const handleDeleteAppointment = async (id) => {
    const res = await deleteAppointment(id);
    fetchAppointments();
    if (res && res.success) {
      toast({ title: "Sucesso", description: "Consulta excluída com sucesso!" });
    } else {
      toast({ title: "Erro", description: "Não foi possível excluir a consulta.", variant: "destructive" });
    }
  };

  // CRUD Pré-natal
  const handleSavePrenatal = async (e) => {
    e.preventDefault();
    setSavingPrenatal(true);
    if (editingPrenatal) {
      await updatePrenatal(editingPrenatal.id, prenatalForm);
    } else {
      await createPrenatal(prenatalForm);
    }
    setSavingPrenatal(false);
    setShowPrenatalModal(false);
    setPrenatalForm(initialPrenatal);
    setEditingPrenatal(null);
    fetchPrenatals();
    toast({ title: "Sucesso", description: "Registro pré-natal salvo com sucesso!" });
  };
  const handleEditPrenatal = (p) => {
    setEditingPrenatal(p);
    setPrenatalForm({
      date: p.date ? p.date.slice(0, 10) : '',
      description: p.description,
      type: p.type,
      result: p.result || '',
      doctor: p.doctor || '',
      location: p.location || '',
      notes: p.notes || ''
    });
    setShowPrenatalModal(true);
  };
  const handleDeletePrenatal = async (id) => {
    const res = await deletePrenatal(id);
    fetchPrenatals();
    if (res && res.success) {
      toast({ title: "Sucesso", description: "Registro pré-natal excluído com sucesso!" });
    } else {
      toast({ title: "Erro", description: "Não foi possível excluir o registro pré-natal.", variant: "destructive" });
    }
  };

  // CRUD Vacinas
  const handleSaveVaccine = async (e) => {
    e.preventDefault();
    setSavingVaccine(true);
    if (editingVaccine) {
      await updateVaccine(editingVaccine.id, { ...vaccineForm, babyId: selectedBabyId });
    } else {
      await createVaccine({ ...vaccineForm, babyId: selectedBabyId });
    }
    setSavingVaccine(false);
    setShowVaccineModal(false);
    setVaccineForm(initialVaccine);
    setEditingVaccine(null);
    fetchVaccines();
    fetchUpcomingVaccines();
    toast({ title: "Sucesso", description: "Vacina salva com sucesso!" });
  };
  const handleEditVaccine = (v) => {
    setEditingVaccine(v);
    setVaccineForm({
      name: v.name,
      date: v.date ? v.date.slice(0, 10) : '',
      nextDueDate: v.nextDueDate ? v.nextDueDate.slice(0, 10) : '',
      notes: v.notes || '',
      batchNumber: v.batchNumber || '',
      clinic: v.clinic || ''
    });
    setShowVaccineModal(true);
  };
  const handleDeleteVaccine = async (id) => {
    const res = await deleteVaccine(id);
    fetchVaccines();
    fetchUpcomingVaccines();
    if (res && res.success) {
      toast({ title: "Sucesso", description: "Vacina excluída com sucesso!" });
    } else {
      toast({ title: "Erro", description: "Não foi possível excluir a vacina.", variant: "destructive" });
    }
  };

  if (isAuthLoading) {
    return <div className="flex items-center justify-center h-96 text-lg">Carregando dados do bebê...</div>;
  }
  if (!hasBaby) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-baby-mint via-baby-lavender to-baby-peach">
        <Header />
        <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto flex-1 flex flex-col items-center justify-center">
          <Utensils className="w-16 h-16 mb-4 text-emerald-400" />
          <h2 className="text-2xl font-bold mb-2">Registre a saúde do seu bebê!</h2>
          <p className="text-muted-foreground mb-4 max-w-md text-center">
            Aqui você poderá acompanhar sintomas, vacinas, consultas e muito mais. Tudo para cuidar melhor do seu pequeno!
          </p>
          <Card className="mb-6 max-w-xs">
            <CardContent className="p-4 text-center">
              <div className="font-semibold">Vacina BCG registrada</div>
              <div className="text-xs text-muted-foreground">Exemplo de registro de saúde</div>
            </CardContent>
          </Card>
          <Button onClick={() => window.history.back()} className="mb-2">Voltar</Button>
          <Button variant="outline" onClick={() => window.location.href = '/settings'}>Adicionar bebê</Button>
        </div>
      </div>
    );
  }
  if (authError) {
    return <div className="flex items-center justify-center h-96 text-lg text-red-500">{authError}</div>;
  }

  return (
    <div className={`min-h-screen ${getBgClass()} pb-8`}>
      <div className="w-full max-w-full px-2 sm:px-4 py-4 mx-auto pt-6">
        <div className="flex items-center gap-4 mb-4">
          <BackButton />
          <h1 className="text-2xl font-bold">Diário de Saúde</h1>
        </div>
        {/* Health Alerts Card */}
        {selectedBabyId && (
          <div className="mb-6 animate-fade-in flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <HealthAlertsCard babyId={selectedBabyId} />
            <div className="flex flex-col gap-2 md:flex-row md:gap-2">
              <Button
                onClick={() => setFeedingTipsOpen(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg flex items-center gap-2"
              >
                <Utensils className="w-4 h-4" />
                Dicas de Alimentação
              </Button>
              <Button
                onClick={() => setAdviceOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg flex items-center gap-2"
              >
                <Bot className="w-4 h-4" />
                Conselho Personalizado
              </Button>
            </div>
          </div>
        )}
        <FeedingTipsModal open={feedingTipsOpen} onClose={() => setFeedingTipsOpen(false)} />
        <PersonalizedAdviceModal open={adviceOpen} onClose={() => setAdviceOpen(false)} />
        <Card className="mb-6 shadow-lg">
          <CardContent className="py-6">
            <div className="mb-4 flex items-center gap-4">
              <label className="font-medium">Bebê:</label>
              <Select value={selectedBabyId} onValueChange={setSelectedBabyId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o bebê" />
                </SelectTrigger>
                <SelectContent>
                  {babies.map((baby) => (
                    <SelectItem key={baby.id} value={baby.id}>
                      {baby.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="symptoms">Sintomas</TabsTrigger>
                <TabsTrigger value="medications">Medicamentos</TabsTrigger>
                <TabsTrigger value="appointments">Consultas</TabsTrigger>
                <TabsTrigger value="prenatal">Pré-natal</TabsTrigger>
                <TabsTrigger value="vaccines">Vacinas</TabsTrigger>
              </TabsList>

              <TabsContent value="symptoms">
                <Card className="shadow-md mt-4">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">Sintomas</h2>
                      <Button onClick={() => { setEditingSymptom(null); setSymptomForm(initialSymptom); setShowSymptomModal(true); }} className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Adicionar Sintoma
                      </Button>
                    </div>
                    {loadingSymptoms ? (
                      <div>Carregando...</div>
                    ) : symptoms.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">Nenhum sintoma registrado.</div>
                    ) : (
                      <Table>
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-center">Descrição</th>
                            <th className="text-center">Intensidade</th>
                            <th className="text-center">Data Início</th>
                            <th className="text-center">Data Fim</th>
                            <th className="text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {symptoms.map((s, i) => (
                            <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                              <td className="text-center">{s.description}</td>
                              <td className="text-center capitalize">{s.intensity}</td>
                              <td className="text-center">{s.startDate ? new Date(s.startDate).toLocaleDateString('pt-BR') : ''}</td>
                              <td className="text-center">{s.endDate ? new Date(s.endDate).toLocaleDateString('pt-BR') : '-'}</td>
                              <td className="flex justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="outline" onClick={() => handleEditSymptom(s)}><Pencil className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="destructive" onClick={() => handleDeleteSymptom(s.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="medications">
                <Card className="shadow-md mt-4">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">Medicamentos</h2>
                      <Button onClick={() => { setEditingMedication(null); setMedicationForm(initialMedication); setShowMedicationModal(true); }} className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Adicionar Medicamento
                      </Button>
                    </div>
                    {loadingMedications ? (
                      <div>Carregando...</div>
                    ) : medications.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">Nenhum medicamento registrado.</div>
                    ) : (
                      <Table>
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-center">Nome</th>
                            <th className="text-center">Dosagem</th>
                            <th className="text-center">Frequência</th>
                            <th className="text-center">Data Início</th>
                            <th className="text-center">Data Fim</th>
                            <th className="text-center">Motivo</th>
                            <th className="text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {medications.map((m, i) => (
                            <tr key={m.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                              <td className="text-center">{m.name}</td>
                              <td className="text-center">{m.dosage}</td>
                              <td className="text-center">{m.frequency}</td>
                              <td className="text-center">{m.startDate ? new Date(m.startDate).toLocaleDateString('pt-BR') : ''}</td>
                              <td className="text-center">{m.endDate ? new Date(m.endDate).toLocaleDateString('pt-BR') : '-'}</td>
                              <td className="text-center">{m.reason}</td>
                              <td className="flex justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="outline" onClick={() => handleEditMedication(m)}><Pencil className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="destructive" onClick={() => handleDeleteMedication(m.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="appointments">
                <Card className="shadow-md mt-4">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">Consultas</h2>
                      <Button onClick={() => { setEditingAppointment(null); setAppointmentForm(initialAppointment); setShowAppointmentModal(true); }} className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Adicionar Consulta
                      </Button>
                    </div>
                    {loadingAppointments ? (
                      <div>Carregando...</div>
                    ) : appointments.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">Nenhuma consulta registrada.</div>
                    ) : (
                      <Table>
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-center">Especialidade</th>
                            <th className="text-center">Médico</th>
                            <th className="text-center">Local</th>
                            <th className="text-center">Data</th>
                            <th className="text-center">Motivo</th>
                            <th className="text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {appointments.map((a, i) => (
                            <tr key={a.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                              <td className="text-center">{a.specialty}</td>
                              <td className="text-center">{a.doctor}</td>
                              <td className="text-center">{a.location}</td>
                              <td className="text-center">{a.date ? new Date(a.date).toLocaleDateString('pt-BR') : ''}</td>
                              <td className="text-center">{a.reason}</td>
                              <td className="flex justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="outline" onClick={() => handleEditAppointment(a)}><Pencil className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="destructive" onClick={() => handleDeleteAppointment(a.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prenatal">
                <Card className="shadow-md mt-4">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">Pré-natal</h2>
                      <Button onClick={() => { setEditingPrenatal(null); setPrenatalForm(initialPrenatal); setShowPrenatalModal(true); }} className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Adicionar Registro
                      </Button>
                    </div>
                    {loadingPrenatals ? (
                      <div>Carregando...</div>
                    ) : prenatals.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">Nenhum registro pré-natal.</div>
                    ) : (
                      <Table>
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-center">Data</th>
                            <th className="text-center">Descrição</th>
                            <th className="text-center">Tipo</th>
                            <th className="text-center">Resultado</th>
                            <th className="text-center">Médico</th>
                            <th className="text-center">Local</th>
                            <th className="text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prenatals.map((p, i) => (
                            <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                              <td className="text-center">{p.date ? new Date(p.date).toLocaleDateString('pt-BR') : ''}</td>
                              <td className="text-center">{p.description}</td>
                              <td className="text-center">{p.type}</td>
                              <td className="text-center">{p.result}</td>
                              <td className="text-center">{p.doctor}</td>
                              <td className="text-center">{p.location}</td>
                              <td className="flex justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="outline" onClick={() => handleEditPrenatal(p)}><Pencil className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="destructive" onClick={() => handleDeletePrenatal(p.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vaccines">
                <Card className="shadow-md mt-4">
                  <CardContent className="py-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold">Vacinas</h2>
                      <Button onClick={() => { setEditingVaccine(null); setVaccineForm(initialVaccine); setShowVaccineModal(true); }} className="flex items-center gap-2">
                        <PlusCircle className="w-4 h-4" /> Adicionar Vacina
                      </Button>
                    </div>
                    {upcomingVaccines.length > 0 && (
                      <div className="mb-4 p-3 rounded bg-yellow-100 text-yellow-800 border border-yellow-300">
                        <strong>Vacinas agendadas/próximas:</strong>
                        <ul className="list-disc ml-6 mt-1">
                          {upcomingVaccines.map((v) => (
                            <li key={v.id}>{v.name} - {v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('pt-BR') : ''}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {loadingVaccines ? (
                      <div>Carregando...</div>
                    ) : vaccines.length === 0 ? (
                      <div className="text-center text-muted-foreground py-8">Nenhuma vacina registrada.</div>
                    ) : (
                      <Table>
                        <thead className="bg-muted/60">
                          <tr>
                            <th className="text-center">Nome</th>
                            <th className="text-center">Data</th>
                            <th className="text-center">Próxima Dose</th>
                            <th className="text-center">Lote</th>
                            <th className="text-center">Clínica</th>
                            <th className="text-center">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vaccines.map((v, i) => (
                            <tr key={v.id} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
                              <td className="text-center">{v.name}</td>
                              <td className="text-center">{v.date ? new Date(v.date).toLocaleDateString('pt-BR') : ''}</td>
                              <td className="text-center">{v.nextDueDate ? new Date(v.nextDueDate).toLocaleDateString('pt-BR') : '-'}</td>
                              <td className="text-center">{v.batchNumber}</td>
                              <td className="text-center">{v.clinic}</td>
                              <td className="flex justify-center gap-2">
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="outline" onClick={() => handleEditVaccine(v)}><Pencil className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Editar</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="destructive" onClick={() => handleDeleteVaccine(v.id)}><Trash2 className="w-4 h-4" /></Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Excluir</TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      {/* Modais de formulário */}
      {showSymptomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">{editingSymptom ? 'Editar Sintoma' : 'Adicionar Sintoma'}</h3>
            <form onSubmit={handleSaveSymptom} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Descrição</label>
                <input name="description" value={symptomForm.description} onChange={handleInput(setSymptomForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Intensidade</label>
                <select name="intensity" value={symptomForm.intensity} onChange={handleInput(setSymptomForm)} required className="w-full border rounded px-2 py-1">
                  <option value="">Selecione</option>
                  <option value="leve">Leve</option>
                  <option value="moderado">Moderado</option>
                  <option value="forte">Forte</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Data de Início</label>
                <input type="date" name="startDate" value={symptomForm.startDate} onChange={handleInput(setSymptomForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Data de Fim</label>
                <input type="date" name="endDate" value={symptomForm.endDate} onChange={handleInput(setSymptomForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowSymptomModal(false); setEditingSymptom(null); }}>Cancelar</Button>
                <Button type="submit" disabled={savingSymptom}>{savingSymptom ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showMedicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">{editingMedication ? 'Editar Medicamento' : 'Adicionar Medicamento'}</h3>
            <form onSubmit={handleSaveMedication} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <input name="name" value={medicationForm.name} onChange={handleInput(setMedicationForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Dosagem</label>
                <input name="dosage" value={medicationForm.dosage} onChange={handleInput(setMedicationForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Frequência</label>
                <input name="frequency" value={medicationForm.frequency} onChange={handleInput(setMedicationForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Data de Início</label>
                <input type="date" name="startDate" value={medicationForm.startDate} onChange={handleInput(setMedicationForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Data de Fim</label>
                <input type="date" name="endDate" value={medicationForm.endDate} onChange={handleInput(setMedicationForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Motivo</label>
                <input name="reason" value={medicationForm.reason} onChange={handleInput(setMedicationForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowMedicationModal(false); setEditingMedication(null); }}>Cancelar</Button>
                <Button type="submit" disabled={savingMedication}>{savingMedication ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">{editingAppointment ? 'Editar Consulta' : 'Adicionar Consulta'}</h3>
            <form onSubmit={handleSaveAppointment} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Data</label>
                <input type="date" name="date" value={appointmentForm.date} onChange={handleInput(setAppointmentForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Especialidade</label>
                <input name="specialty" value={appointmentForm.specialty} onChange={handleInput(setAppointmentForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Médico</label>
                <input name="doctor" value={appointmentForm.doctor} onChange={handleInput(setAppointmentForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Local</label>
                <input name="location" value={appointmentForm.location} onChange={handleInput(setAppointmentForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Motivo</label>
                <input name="reason" value={appointmentForm.reason} onChange={handleInput(setAppointmentForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Notas</label>
                <input name="notes" value={appointmentForm.notes} onChange={handleInput(setAppointmentForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowAppointmentModal(false); setEditingAppointment(null); }}>Cancelar</Button>
                <Button type="submit" disabled={savingAppointment}>{savingAppointment ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showPrenatalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">{editingPrenatal ? 'Editar Registro' : 'Adicionar Registro'}</h3>
            <form onSubmit={handleSavePrenatal} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Data</label>
                <input type="date" name="date" value={prenatalForm.date} onChange={handleInput(setPrenatalForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Descrição</label>
                <input name="description" value={prenatalForm.description} onChange={handleInput(setPrenatalForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Tipo</label>
                <input name="type" value={prenatalForm.type} onChange={handleInput(setPrenatalForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Resultado</label>
                <input name="result" value={prenatalForm.result} onChange={handleInput(setPrenatalForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Médico</label>
                <input name="doctor" value={prenatalForm.doctor} onChange={handleInput(setPrenatalForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Local</label>
                <input name="location" value={prenatalForm.location} onChange={handleInput(setPrenatalForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Notas</label>
                <input name="notes" value={prenatalForm.notes} onChange={handleInput(setPrenatalForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowPrenatalModal(false); setEditingPrenatal(null); }}>Cancelar</Button>
                <Button type="submit" disabled={savingPrenatal}>{savingPrenatal ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showVaccineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold mb-4">{editingVaccine ? 'Editar Vacina' : 'Adicionar Vacina'}</h3>
            <form onSubmit={handleSaveVaccine} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Nome</label>
                <input name="name" value={vaccineForm.name} onChange={handleInput(setVaccineForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Data</label>
                <input type="date" name="date" value={vaccineForm.date} onChange={handleInput(setVaccineForm)} required className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Próxima Dose</label>
                <input type="date" name="nextDueDate" value={vaccineForm.nextDueDate} onChange={handleInput(setVaccineForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Lote</label>
                <input name="batchNumber" value={vaccineForm.batchNumber} onChange={handleInput(setVaccineForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Clínica</label>
                <input name="clinic" value={vaccineForm.clinic} onChange={handleInput(setVaccineForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Observações</label>
                <textarea name="notes" value={vaccineForm.notes} onChange={handleInput(setVaccineForm)} className="w-full border rounded px-2 py-1" />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => { setShowVaccineModal(false); setEditingVaccine(null); }}>Cancelar</Button>
                <Button type="submit" disabled={savingVaccine}>{savingVaccine ? 'Salvando...' : 'Salvar'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Health; 