const Chat = require('../models/ChatModel');
const ChatMessage = require('../models/ChatMessageModel');
const User = require('../models/userModel');
const logger = require('../utils/logger');

class ChatService {
  /**
   * Crear nuevo chat
   */
  static async createChat(chatData, userId) {
    try {
      const chat = new Chat({
        ...chatData,
        participants: [{
          user: userId,
          role: 'customer',
          joinedAt: new Date(),
          lastSeen: new Date()
        }]
      });

      await chat.save();

      // Crear mensaje de bienvenida del sistema
      await this.sendSystemMessage(chat._id, 'Chat iniciado. Un agente de soporte se pondrá en contacto contigo pronto.');

      logger.info('Chat creado exitosamente', {
        chatId: chat._id,
        userId
      });

      return {
        success: true,
        chat
      };
    } catch (error) {
      logger.error('Error al crear chat:', error);
      throw error;
    }
  }

  /**
   * Obtener chats de un usuario
   */
  static async getUserChats(userId) {
    try {
      const chats = await Chat.getUserChats(userId);
      
      return {
        success: true,
        chats
      };
    } catch (error) {
      logger.error('Error al obtener chats del usuario:', error);
      throw error;
    }
  }

  /**
   * Obtener chat por ID
   */
  static async getChatById(chatId, userId) {
    try {
      const chat = await Chat.findById(chatId)
        .populate('participants.user', 'username email')
        .populate('assignedTo', 'username email');

      if (!chat) {
        return {
          success: false,
          error: 'Chat no encontrado'
        };
      }

      // Verificar que el usuario es participante del chat
      const isParticipant = chat.participants.some(p => 
        p.user._id.toString() === userId.toString()
      );

      if (!isParticipant) {
        return {
          success: false,
          error: 'No tienes acceso a este chat'
        };
      }

      // Actualizar último visto
      await chat.updateLastSeen(userId);

      return {
        success: true,
        chat
      };
    } catch (error) {
      logger.error('Error al obtener chat:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje
   */
  static async sendMessage(chatId, messageData, senderId) {
    try {
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return {
          success: false,
          error: 'Chat no encontrado'
        };
      }

      // Verificar que el usuario es participante del chat
      const isParticipant = chat.participants.some(p => 
        p.user.toString() === senderId.toString()
      );

      if (!isParticipant) {
        return {
          success: false,
          error: 'No tienes acceso a este chat'
        };
      }

      const message = new ChatMessage({
        ...messageData,
        chat: chatId,
        sender: senderId
      });

      await message.save();

      // Actualizar último visto del remitente
      await chat.updateLastSeen(senderId);

      // Actualizar estado del chat si es necesario
      if (chat.status === 'waiting' && chat.participants.some(p => p.role === 'customer' && p.user.toString() === senderId.toString())) {
        chat.status = 'open';
        await chat.save();
      }

      logger.info('Mensaje enviado exitosamente', {
        messageId: message._id,
        chatId,
        senderId
      });

      return {
        success: true,
        message
      };
    } catch (error) {
      logger.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes de un chat
   */
  static async getChatMessages(chatId, userId, options = {}) {
    try {
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return {
          success: false,
          error: 'Chat no encontrado'
        };
      }

      // Verificar que el usuario es participante del chat
      const isParticipant = chat.participants.some(p => 
        p.user.toString() === userId.toString()
      );

      if (!isParticipant) {
        return {
          success: false,
          error: 'No tienes acceso a este chat'
        };
      }

      const messages = await ChatMessage.getChatMessages(chatId, options);
      
      // Marcar mensajes como leídos
      await ChatMessage.markMessagesAsRead(chatId, userId);

      return {
        success: true,
        messages
      };
    } catch (error) {
      logger.error('Error al obtener mensajes del chat:', error);
      throw error;
    }
  }

  /**
   * Asignar chat a un agente
   */
  static async assignChatToAgent(chatId, agentId) {
    try {
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return {
          success: false,
          error: 'Chat no encontrado'
        };
      }

      // Verificar que el agente existe y tiene rol de soporte
      const agent = await User.findById(agentId);
      if (!agent || !['admin', 'superuser'].includes(agent.role)) {
        return {
          success: false,
          error: 'Agente no válido'
        };
      }

      // Agregar agente como participante si no está
      await chat.addParticipant(agentId, 'support');
      await chat.assignToAgent(agentId);

      // Enviar mensaje del sistema
      await this.sendSystemMessage(chatId, `Chat asignado a ${agent.username}`);

      logger.info('Chat asignado exitosamente', {
        chatId,
        agentId
      });

      return {
        success: true,
        chat
      };
    } catch (error) {
      logger.error('Error al asignar chat:', error);
      throw error;
    }
  }

  /**
   * Cerrar chat
   */
  static async closeChat(chatId, userId, resolution = null) {
    try {
      const chat = await Chat.findById(chatId);
      
      if (!chat) {
        return {
          success: false,
          error: 'Chat no encontrado'
        };
      }

      await chat.closeChat(userId, resolution);

      // Enviar mensaje del sistema
      await this.sendSystemMessage(chatId, 'Chat cerrado. Gracias por contactarnos.');

      logger.info('Chat cerrado exitosamente', {
        chatId,
        closedBy: userId
      });

      return {
        success: true,
        chat
      };
    } catch (error) {
      logger.error('Error al cerrar chat:', error);
      throw error;
    }
  }

  /**
   * Obtener chats activos (solo admin/soporte)
   */
  static async getActiveChats() {
    try {
      const chats = await Chat.getActiveChats();
      
      return {
        success: true,
        chats
      };
    } catch (error) {
      logger.error('Error al obtener chats activos:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de chat
   */
  static async getChatStats(days = 30) {
    try {
      const chatStats = await Chat.getChatStats(days);
      const messageStats = await ChatMessage.getMessageStats(null, days);
      
      return {
        success: true,
        stats: {
          chats: chatStats,
          messages: messageStats
        }
      };
    } catch (error) {
      logger.error('Error al obtener estadísticas de chat:', error);
      throw error;
    }
  }

  /**
   * Enviar mensaje del sistema
   */
  static async sendSystemMessage(chatId, messageText) {
    try {
      const message = new ChatMessage({
        chat: chatId,
        sender: null, // Mensaje del sistema
        message: messageText,
        messageType: 'system'
      });

      await message.save();
      return message;
    } catch (error) {
      logger.error('Error al enviar mensaje del sistema:', error);
      throw error;
    }
  }

  /**
   * Obtener mensajes no leídos de un usuario
   */
  static async getUnreadMessages(userId) {
    try {
      const messages = await ChatMessage.getUnreadMessages(userId);
      
      return {
        success: true,
        messages
      };
    } catch (error) {
      logger.error('Error al obtener mensajes no leídos:', error);
      throw error;
    }
  }

  /**
   * Marcar mensaje como leído
   */
  static async markMessageAsRead(messageId, userId) {
    try {
      const message = await ChatMessage.findById(messageId);
      
      if (!message) {
        return {
          success: false,
          error: 'Mensaje no encontrado'
        };
      }

      await message.markAsRead(userId);

      return {
        success: true,
        message
      };
    } catch (error) {
      logger.error('Error al marcar mensaje como leído:', error);
      throw error;
    }
  }

  /**
   * Editar mensaje
   */
  static async editMessage(messageId, newMessage, userId) {
    try {
      const message = await ChatMessage.findById(messageId);
      
      if (!message) {
        return {
          success: false,
          error: 'Mensaje no encontrado'
        };
      }

      // Verificar que el usuario es el remitente
      if (message.sender.toString() !== userId.toString()) {
        return {
          success: false,
          error: 'No tienes permisos para editar este mensaje'
        };
      }

      await message.editMessage(newMessage);

      return {
        success: true,
        message
      };
    } catch (error) {
      logger.error('Error al editar mensaje:', error);
      throw error;
    }
  }
}

module.exports = ChatService;
