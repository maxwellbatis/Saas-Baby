import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';

interface Campaign {
  id: string;
  name: string;
  type: string;
  segment: string;
  status: string;
  scheduledAt?: string;
}

interface CampaignsTabProps {
  campaigns: Campaign[];
  onEdit: (campaign: Campaign) => void;
  onDelete: (id: string) => void;
  formatDate: (date: string) => string;
}

export const CampaignsTab: React.FC<CampaignsTabProps> = ({ campaigns, onEdit, onDelete, formatDate }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campanhas de Marketing</CardTitle>
        <Button onClick={() => onEdit(undefined)}>Nova Campanha</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Segmentação</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Agendamento</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {campaigns.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{c.type}</Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">{c.segment}</div>
                </TableCell>
                <TableCell>
                  <Badge variant={c.status === 'sent' ? 'default' : 'secondary'}>{c.status}</Badge>
                </TableCell>
                <TableCell>{c.scheduledAt ? formatDate(c.scheduledAt) : '-'}</TableCell>
                <TableCell>
                  <Button size="sm" onClick={() => onEdit(c)}>Editar</Button>{' '}
                  <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>Excluir</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 