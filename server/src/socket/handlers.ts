import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to send notification to specific user
export const sendNotification = async (io: Server, userId: string, notification: any) => {
  io.to(`user_${userId}`).emit('notification', notification);
};

// Function to send project update to project members
export const sendProjectUpdate = async (io: Server, projectId: string, update: any) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        manager: true
      }
    });

    if (project) {
      const userIds = [project.clientId];
      if (project.managerId) {
        userIds.push(project.managerId);
      }

      userIds.forEach(userId => {
        io.to(`user_${userId}`).emit('project_update', update);
      });
    }
  } catch (error) {
    console.error('Error sending project update:', error);
  }
};

// Function to send ticket update
export const sendTicketUpdate = async (io: Server, ticketId: string, update: any) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        client: true,
        assignedUser: true
      }
    });

    if (ticket) {
      const userIds = [ticket.clientId];
      if (ticket.assignedUser) {
        userIds.push(ticket.assignedUser.id);
      }

      userIds.forEach(userId => {
        io.to(`user_${userId}`).emit('ticket_update', update);
      });
    }
  } catch (error) {
    console.error('Error sending ticket update:', error);
  }
};

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join user to their personal room
    socket.on('join', (userId: string) => {
      socket.join(`user_${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}; 