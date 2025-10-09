
'use client';

import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { PlusCircle, MoreHorizontal, Trash2, UserPlus } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { companies, customerLocations as initialLocations, setCustomerLocations, contactTypes as initialContactTypes } from '@/lib/data';
import type { CustomerLocation, Contact, ContactType } from '@/lib/types';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

// --- Development Fix: Use a single client for easier debugging ---
const TEST_CLIENT_ID = 'client-01';
const testClient = companies.find(c => c.id === TEST_CLIENT_ID);

const emptyLocation: CustomerLocation = {
  id: '',
  name: '',
  clientId: TEST_CLIENT_ID,
  address: {
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
  contacts: [],
};

const emptyContact: Contact = {
  id: '',
  name: '',
  contactTypeId: '',
  email: '',
  phone: '',
  observation: ''
}
// ----------------------------------------------------------------

export default function ClientsPage() {
  const [locations, setLocations] = React.useState<CustomerLocation[]>(initialLocations.filter(l => l.clientId === TEST_CLIENT_ID));
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingLocation, setEditingLocation] = React.useState<CustomerLocation | null>(null);
  const [formData, setFormData] = React.useState<CustomerLocation>(emptyLocation);
  
  React.useEffect(() => {
    // This will keep the local state in sync if the global data changes.
    const currentLocations = initialLocations.filter(l => l.clientId === TEST_CLIENT_ID)
    setLocations(currentLocations);
  }, []);

  const openDialog = (location: CustomerLocation | null = null) => {
    setEditingLocation(location);
    // Deep copy to avoid modifying the original object
    const locationData = location 
      ? JSON.parse(JSON.stringify(location)) 
      : JSON.parse(JSON.stringify(emptyLocation));

    setFormData(locationData);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setEditingLocation(null);
    setIsDialogOpen(false);
    setFormData(emptyLocation);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          // @ts-ignore
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContactChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const newContacts = [...(formData.contacts || [])];
    // @ts-ignore
    newContacts[index][name] = value;
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const handleContactSelectChange = (index: number, value: string) => {
    const newContacts = [...(formData.contacts || [])];
    newContacts[index].contactTypeId = value;
    setFormData(prev => ({ ...prev, contacts: newContacts }));
  };

  const addContact = () => {
    const newContact: Contact = { ...emptyContact, id: `contact-${Date.now()}` };
    setFormData(prev => ({
        ...prev,
        contacts: [...(prev.contacts || []), newContact],
    }));
  };

  const removeContact = (index: number) => {
    setFormData(prev => ({
        ...prev,
        contacts: (prev.contacts || []).filter((_, i) => i !== index),
    }));
  }

  const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '');
    if (cep.length !== 8) return;

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf,
          },
        }));
      }
    } catch (error) {
      console.error("Falha ao buscar CEP:", error);
    }
  };
  
  const handleSaveLocation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    let updatedLocations;
    
    if (editingLocation) {
      updatedLocations = initialLocations.map(l => (l.id === editingLocation.id ? formData : l));
    } else {
      const newLocation: CustomerLocation = {
        ...formData,
        clientId: TEST_CLIENT_ID,
        id: `loc-0${initialLocations.length + 1}`,
      };
      updatedLocations = [newLocation, ...initialLocations];
    }
    
    setCustomerLocations(updatedLocations);
    setLocations(updatedLocations.filter(l => l.clientId === TEST_CLIENT_ID));
    closeDialog();
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Clientes Finais</h1>
        <Button onClick={() => openDialog()}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>
      <div className="rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome do Cliente Final</TableHead>
              <TableHead>Contatos</TableHead>
              <TableHead>Cidade/Estado</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {locations.map(location => (
              <TableRow key={location.id}>
                <TableCell className="font-medium">{location.name}</TableCell>
                <TableCell>{location.contacts?.length || 0}</TableCell>
                <TableCell>{location.address?.city || 'N/A'} / {location.address?.state || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openDialog(location)}>
                        Editar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingLocation ? 'Editar Cliente Final' : 'Novo Cliente Final'}</DialogTitle>
            <DialogDescription>
              {editingLocation ? 'Atualize os detalhes do cliente e seus contatos.' : `Cadastre um novo cliente final para ${testClient?.name || ''}.`}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] -mx-6 px-6">
            <form onSubmit={handleSaveLocation} id="location-form" className="space-y-6 py-4 px-1">
              <h3 className="text-lg font-medium">Dados Cadastrais</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Cliente Final</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required placeholder="Ex: Condomínio Edifício Central"/>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2 md:col-span-1">
                        <Label htmlFor="zipCode">CEP</Label>
                        <Input id="zipCode" name="address.zipCode" value={formData.address?.zipCode || ''} onChange={handleInputChange} onBlur={handleCepBlur} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="street">Rua</Label>
                        <Input id="street" name="address.street" value={formData.address?.street || ''} onChange={handleInputChange} />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                          <Label htmlFor="number">Número</Label>
                          <Input id="number" name="address.number" value={formData.address?.number || ''} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="complement">Complemento</Label>
                          <Input id="complement" name="address.complement" value={formData.address?.complement || ''} onChange={handleInputChange} />
                      </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="neighborhood">Bairro</Label>
                        <Input id="neighborhood" name="address.neighborhood" value={formData.address?.neighborhood || ''} onChange={handleInputChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input id="city" name="address.city" value={formData.address?.city || ''} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input id="state" name="address.state" value={formData.address?.state || ''} onChange={handleInputChange} />
                  </div>
              </div>
              
              <Separator />

              <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Contatos</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addContact}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Adicionar Contato
                    </Button>
                </div>
                <div className="space-y-4">
                  {(formData.contacts || []).map((contact, index) => (
                    <div key={contact.id} className="p-4 border rounded-lg space-y-4 relative">
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => removeContact(index)}>
                            <Trash2 className="h-4 w-4 text-destructive"/>
                            <span className="sr-only">Remover Contato</span>
                        </Button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`contact-name-${index}`}>Nome Completo</Label>
                            <Input id={`contact-name-${index}`} name="name" value={contact.name} onChange={e => handleContactChange(index, e)} required/>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`contact-type-${index}`}>Tipo</Label>
                             <Select name="contactTypeId" value={contact.contactTypeId} onValueChange={(value) => handleContactSelectChange(index, value)} required>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                {initialContactTypes.map(type => (
                                  <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor={`contact-phone-${index}`}>Telefone</Label>
                              <Input id={`contact-phone-${index}`} name="phone" value={contact.phone || ''} onChange={e => handleContactChange(index, e)} />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor={`contact-email-${index}`}>Email</Label>
                              <Input id={`contact-email-${index}`} name="email" type="email" value={contact.email || ''} onChange={e => handleContactChange(index, e)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`contact-observation-${index}`}>Observação (Uso Interno)</Label>
                            <Textarea id={`contact-observation-${index}`} name="observation" value={contact.observation || ''} onChange={e => handleContactChange(index, e)} />
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button type="submit" form="location-form">Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
