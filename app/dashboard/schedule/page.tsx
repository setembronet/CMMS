
'use client';

import * as React from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useClient } from '@/context/client-provider';
import { useI18n } from '@/hooks/use-i18n';
import type { Schedule, User, ShiftType } from '@/lib/types';
import { EventInput } from '@fullcalendar/core';
import './page.css';
import { useCollection, addDocument, updateDocument, deleteDocument } from '@/firebase/firestore';
import { useFirestore } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

const shiftTypes: { value: ShiftType; label: string, color: string }[] = [
  { value: 'TURNO_NORMAL', label: 'Turno Normal', color: '#3b82f6' },
  { value: 'PLANTAO', label: 'Plantão', color: '#f59e0b' },
  { value: 'FOLGA', label: 'Folga', color: '#ef4444' },
];

export default function SchedulePage() {
  const { selectedClient } = useClient();
  const { t } = useI18n();
  const firestore = useFirestore();
  const { toast } = useToast();

  const { data: schedules, loading: schedulesLoading } = useCollection<Schedule>('schedules');
  const { data: allUsers, loading: usersLoading } = useCollection<User>('users');
  
  const [clientUsers, setClientUsers] = React.useState<User[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState<Partial<Schedule> | null>(null);

  React.useEffect(() => {
    if (selectedClient && !usersLoading) {
      setClientUsers(allUsers.filter(u => u.clientId === selectedClient.id && u.cmmsRole === 'TECNICO'));
    } else {
      setClientUsers([]);
    }
  }, [selectedClient, allUsers, usersLoading]);

  const calendarEvents = React.useMemo((): EventInput[] => {
    return schedules.map(schedule => {
      const user = clientUsers.find(u => u.id === schedule.technicianId);
      const shiftInfo = shiftTypes.find(st => st.value === schedule.type);
      return {
        id: schedule.id,
        title: user?.name || 'Desconhecido',
        start: new Date(schedule.start),
        end: new Date(schedule.end),
        backgroundColor: shiftInfo?.color,
        borderColor: shiftInfo?.color,
        extendedProps: schedule,
      };
    });
  }, [schedules, clientUsers]);

  const handleDateSelect = (selectInfo: any) => {
    setFormData({
      start: selectInfo.start.getTime(),
      end: selectInfo.end.getTime(),
      type: 'TURNO_NORMAL',
    });
    setIsDialogOpen(true);
  };

  const handleEventClick = (clickInfo: any) => {
    setFormData({ ...clickInfo.event.extendedProps });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData || !formData.technicianId || !formData.start || !formData.end || !firestore) return;
    
    const { id, ...scheduleData } = formData as Omit<Schedule, 'id'> & { id?: string };

    try {
      if (id && schedules.some(s => s.id === id)) {
        await updateDocument(firestore, 'schedules', id, scheduleData);
        toast({ title: 'Sucesso', description: 'Escala atualizada.' });
      } else {
        await addDocument(firestore, 'schedules', scheduleData);
        toast({ title: 'Sucesso', description: 'Nova escala criada.' });
      }
      closeDialog();
    } catch(err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível salvar a escala.' });
    }
  };

  const handleDelete = async () => {
    if (!formData || !formData.id || !firestore) return;
    try {
      await deleteDocument(firestore, 'schedules', formData.id);
      toast({ title: 'Sucesso', description: 'Escala removida.' });
      closeDialog();
    } catch(err) {
      toast({ variant: 'destructive', title: 'Erro', description: 'Não foi possível remover a escala.' });
    }
  };


  const closeDialog = () => {
    setIsDialogOpen(false);
    setFormData(null);
  };

  const handleFormChange = (field: keyof Schedule, value: string | number) => {
      if (!formData) return;
      setFormData(prev => prev ? ({...prev, [field]: value}) : null);
  }
  
  const isLoading = schedulesLoading || usersLoading;

  if (!selectedClient) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-muted-foreground">{t('users.selectClientPrompt')}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">{t('sidebar.schedule')}</h1>
         <div className="flex gap-2 items-center">
            {shiftTypes.map(st => (
                <div key={st.value} className="flex items-center gap-2 text-sm">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: st.color }}></span>
                    {st.label}
                </div>
            ))}
        </div>
      </div>
      <div className="rounded-lg border shadow-sm p-4 flex-1 min-h-[600px]">
        {isLoading ? <p>Carregando agenda...</p> : (
            <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
            }}
            initialView="dayGridMonth"
            weekends={true}
            events={calendarEvents}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            select={handleDateSelect}
            eventClick={handleEventClick}
            locale='pt-br'
            buttonText={{
                today: 'Hoje',
                month: 'Mês',
                week: 'Semana',
                day: 'Dia',
            }}
            />
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formData?.id ? 'Editar Escala' : 'Nova Escala'}</DialogTitle>
            <DialogDescription>
              Gerencie a escala do técnico para este período.
            </DialogDescription>
          </DialogHeader>
          {formData && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="technicianId">Técnico</Label>
                <Select
                  value={formData.technicianId}
                  onValueChange={(value) => handleFormChange('technicianId', value)}
                >
                  <SelectTrigger id="technicianId">
                    <SelectValue placeholder="Selecione um técnico" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Escala</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleFormChange('type', value as ShiftType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTypes.map(st => (
                      <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label>Início</Label>
                      <Input type="datetime-local" value={formData.start ? new Date(formData.start - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => handleFormChange('start', new Date(e.target.value).getTime())} />
                  </div>
                  <div className="space-y-2">
                      <Label>Fim</Label>
                      <Input type="datetime-local" value={formData.end ? new Date(formData.end - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ''} onChange={e => handleFormChange('end', new Date(e.target.value).getTime())} />
                  </div>
              </div>
            </div>
          )}
          <DialogFooter className="sm:justify-between">
            {formData?.id && schedules.some(s => s.id === formData.id) ? (
                <Button variant="destructive" onClick={handleDelete}>Excluir</Button>
            ) : <div />}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
              <Button onClick={handleSave}>Salvar</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
