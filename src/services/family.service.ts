import { PrismaClient } from '@prisma/client';
import { notificationService } from './notification.service';

const prisma = new PrismaClient();

export class FamilyService {
  
  // Convidar membro da família
  async inviteFamilyMember(
    userId: string,
    inviteData: {
      name: string;
      email?: string;
      phoneNumber?: string;
      relationship: string;
      permissions: string[];
    }
  ) {
    try {
      // Verificar se o usuário principal tem plano que permite compartilhamento
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { plan: true }
      });

      if (!user) {
        throw new Error('Usuário não encontrado');
      }

      const familySharingLimit = user.plan?.familySharing || 0;
      const currentFamilyMembers = await prisma.familyMember.count({
        where: { userId, isActive: true }
      });

      if (currentFamilyMembers >= familySharingLimit) {
        throw new Error(`Limite de ${familySharingLimit} membros familiares atingido para seu plano`);
      }

      // Verificar se já existe convite para este email/telefone
      if (inviteData.email) {
        const existingEmail = await prisma.familyMember.findFirst({
          where: {
            userId,
            email: inviteData.email,
            isActive: true
          }
        });

        if (existingEmail) {
          throw new Error('Já existe um convite ativo para este email');
        }
      }

      if (inviteData.phoneNumber) {
        const existingPhone = await prisma.familyMember.findFirst({
          where: {
            userId,
            phoneNumber: inviteData.phoneNumber,
            isActive: true
          }
        });

        if (existingPhone) {
          throw new Error('Já existe um convite ativo para este telefone');
        }
      }

      // Criar convite
      const familyMember = await prisma.familyMember.create({
        data: {
          userId,
          name: inviteData.name,
          email: inviteData.email,
          phoneNumber: inviteData.phoneNumber,
          relationship: inviteData.relationship,
          permissions: inviteData.permissions,
          isActive: true
        }
      });

      // Enviar notificação de convite
      if (inviteData.email) {
        await notificationService.sendTemplateNotification(
          userId, // Enviar para o usuário principal como confirmação
          'family_invite_sent',
          {
            name: inviteData.name,
            email: inviteData.email,
            relationship: inviteData.relationship
          }
        );
      }

      return {
        success: true,
        familyMember,
        message: 'Convite enviado com sucesso'
      };
    } catch (error) {
      console.error('Erro ao convidar membro da família:', error);
      throw error;
    }
  }

  // Aceitar convite de família
  async acceptFamilyInvite(
    inviteId: string,
    acceptedByUserId: string
  ) {
    try {
      const familyMember = await prisma.familyMember.findUnique({
        where: { id: inviteId },
        include: { user: true }
      });

      if (!familyMember) {
        throw new Error('Convite não encontrado');
      }

      if (!familyMember.isActive) {
        throw new Error('Convite não está mais ativo');
      }

      if (familyMember.acceptedAt) {
        throw new Error('Convite já foi aceito');
      }

      // Atualizar convite como aceito
      await prisma.familyMember.update({
        where: { id: inviteId },
        data: {
          acceptedAt: new Date()
        }
      });

      // Notificar o usuário principal
      await notificationService.sendPushNotification({
        userId: familyMember.userId,
        title: '👨‍👩‍👧‍👦 Novo Membro da Família',
        body: `${familyMember.name} aceitou o convite para participar do Baby Diary`
      });

      return {
        success: true,
        message: 'Convite aceito com sucesso'
      };
    } catch (error) {
      console.error('Erro ao aceitar convite da família:', error);
      throw error;
    }
  }

  // Remover membro da família
  async removeFamilyMember(userId: string, familyMemberId: string) {
    try {
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          id: familyMemberId,
          userId
        }
      });

      if (!familyMember) {
        throw new Error('Membro da família não encontrado');
      }

      await prisma.familyMember.update({
        where: { id: familyMemberId },
        data: { isActive: false }
      });

      return {
        success: true,
        message: 'Membro da família removido com sucesso'
      };
    } catch (error) {
      console.error('Erro ao remover membro da família:', error);
      throw error;
    }
  }

  // Listar membros da família
  async getFamilyMembers(userId: string) {
    try {
      const familyMembers = await prisma.familyMember.findMany({
        where: {
          userId,
          isActive: true
        },
        orderBy: { createdAt: 'desc' }
      });

      return familyMembers;
    } catch (error) {
      console.error('Erro ao listar membros da família:', error);
      throw new Error('Falha ao listar membros da família');
    }
  }

  // Compartilhar memória com família
  async shareMemoryWithFamily(
    userId: string,
    memoryId: string,
    familyMemberIds: string[]
  ) {
    try {
      // Verificar se a memória pertence ao usuário
      const memory = await prisma.memory.findFirst({
        where: {
          id: memoryId,
          userId
        }
      });

      if (!memory) {
        throw new Error('Memória não encontrada');
      }

      // Verificar se os membros da família existem
      const familyMembers = await prisma.familyMember.findMany({
        where: {
          id: { in: familyMemberIds },
          userId,
          isActive: true
        }
      });

      if (familyMembers.length !== familyMemberIds.length) {
        throw new Error('Alguns membros da família não foram encontrados');
      }

      // Atualizar memória com lista de compartilhamento
      const currentSharedWith = Array.isArray(memory.sharedWith) ? memory.sharedWith : [];
      const updatedSharedWith = [...new Set([...currentSharedWith, ...familyMemberIds])];

      await prisma.memory.update({
        where: { id: memoryId },
        data: {
          sharedWith: updatedSharedWith,
          isPublic: true
        }
      });

      // Notificar membros da família
      for (const member of familyMembers) {
        if (member.email) {
          await notificationService.sendTemplateNotification(
            userId, // Enviar do usuário principal
            'memory_shared',
            {
              memberName: member.name,
              memoryTitle: memory.title,
              userName: 'Família'
            }
          );
        }
      }

      return {
        success: true,
        message: 'Memória compartilhada com sucesso',
        sharedWith: familyMembers.map(m => m.name)
      };
    } catch (error) {
      console.error('Erro ao compartilhar memória:', error);
      throw error;
    }
  }

  // Obter memórias compartilhadas
  async getSharedMemories(userId: string) {
    try {
      // Buscar memórias compartilhadas com o usuário
      const sharedMemories = await prisma.memory.findMany({
        where: {
          OR: [
            { userId }, // Memórias próprias
            {
              sharedWith: {
                path: ['$'],
                array_contains: userId
              }
            }
          ],
          isPublic: true
        },
        include: {
          baby: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { date: 'desc' }
      });

      // Formatar memórias para resposta
      const formattedMemories = sharedMemories.map(memory => ({
        id: memory.id,
        title: memory.title,
        description: memory.description,
        date: memory.date,
        photoUrl: memory.photoUrl,
        babyName: memory.baby?.name || 'Bebê não encontrado',
        babyId: memory.baby?.id,
        userName: 'Família', // Simplificado - não temos acesso ao user aqui
        isOwn: memory.userId === userId
      }));

      return {
        success: true,
        data: formattedMemories
      };
    } catch (error) {
      console.error('Erro ao buscar memórias compartilhadas:', error);
      return {
        success: false,
        error: 'Erro interno do servidor'
      };
    }
  }

  // Verificar permissões de membro da família
  async checkFamilyPermissions(
    userId: string,
    familyMemberId: string,
    permission: string
  ): Promise<boolean> {
    try {
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          id: familyMemberId,
          userId,
          isActive: true
        }
      });

      if (!familyMember) {
        return false;
      }

      const permissions = Array.isArray(familyMember.permissions) 
        ? familyMember.permissions 
        : [];

      return permissions.includes(permission);
    } catch (error) {
      console.error('Erro ao verificar permissões:', error);
      return false;
    }
  }

  // Atualizar permissões de membro da família
  async updateFamilyMemberPermissions(
    userId: string,
    familyMemberId: string,
    permissions: string[]
  ) {
    try {
      const familyMember = await prisma.familyMember.findFirst({
        where: {
          id: familyMemberId,
          userId
        }
      });

      if (!familyMember) {
        throw new Error('Membro da família não encontrado');
      }

      await prisma.familyMember.update({
        where: { id: familyMemberId },
        data: {
          permissions,
          updatedAt: new Date()
        }
      });

      return {
        success: true,
        message: 'Permissões atualizadas com sucesso'
      };
    } catch (error) {
      console.error('Erro ao atualizar permissões:', error);
      throw error;
    }
  }

  // Adicionar atividade compartilhada
  async addSharedActivity(
    userId: string,
    babyId: string,
    activityData: {
      type: string;
      title: string;
      description?: string;
      photoUrl?: string;
      date?: Date;
      duration?: number;
      notes?: string;
    }
  ) {
    try {
      // Verificar se o bebê pertence ao usuário
      const baby = await prisma.baby.findFirst({
        where: {
          id: babyId,
          userId
        }
      });

      if (!baby) {
        throw new Error('Bebê não encontrado');
      }

      // Criar atividade
      const activity = await prisma.activity.create({
        data: {
          ...activityData,
          babyId,
          userId,
          date: activityData.date || new Date()
        }
      });

      // Notificar membros da família sobre nova atividade
      const familyMembers = await prisma.familyMember.findMany({
        where: {
          userId,
          isActive: true,
          acceptedAt: { not: null }
        }
      });

      for (const member of familyMembers) {
        if (await this.checkFamilyPermissions(userId, member.id, 'view_activities')) {
          await notificationService.sendPushNotification({
            userId: member.userId, // Enviar para o membro da família
            title: '📝 Nova Atividade',
            body: `${baby.name}: ${activityData.title}`,
            data: {
              type: 'shared_activity',
              babyId,
              activityId: activity.id
            }
          });
        }
      }

      return {
        success: true,
        activity
      };
    } catch (error) {
      console.error('Erro ao adicionar atividade compartilhada:', error);
      throw error;
    }
  }

  // Obter estatísticas da família
  async getFamilyStats(userId: string) {
    try {
      const familyMembers = await prisma.familyMember.count({
        where: {
          userId,
          isActive: true
        }
      });

      const acceptedMembers = await prisma.familyMember.count({
        where: {
          userId,
          isActive: true,
          acceptedAt: { not: null }
        }
      });

      const sharedMemories = await prisma.memory.count({
        where: {
          userId,
          isPublic: true,
          sharedWith: { not: { equals: [] } }
        }
      });

      const babies = await prisma.baby.count({
        where: { userId, isActive: true }
      });

      return {
        totalMembers: familyMembers,
        acceptedMembers,
        pendingInvites: familyMembers - acceptedMembers,
        sharedMemories,
        babies
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas da família:', error);
      throw new Error('Falha ao obter estatísticas da família');
    }
  }

  // Sincronizar dados da família
  async syncFamilyData(userId: string) {
    try {
      const familyMembers = await prisma.familyMember.findMany({
        where: {
          userId,
          isActive: true,
          acceptedAt: { not: null }
        }
      });

      const syncResults = {
        members: familyMembers.length,
        synced: 0,
        errors: 0
      };

      for (const member of familyMembers) {
        try {
          // Aqui você implementaria a lógica de sincronização
          // Por exemplo, enviar dados atualizados para o membro da família
          console.log(`Sincronizando dados com ${member.name}`);
          syncResults.synced++;
        } catch (error) {
          console.error(`Erro ao sincronizar com ${member.name}:`, error);
          syncResults.errors++;
        }
      }

      return syncResults;
    } catch (error) {
      console.error('Erro ao sincronizar dados da família:', error);
      throw new Error('Falha ao sincronizar dados da família');
    }
  }
}

export default new FamilyService(); 