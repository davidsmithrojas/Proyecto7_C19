const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
require('../utils/handlebarsHelpers'); // Registrar helpers

class EmailService {
  constructor() {
    this.transporter = null;
    this.templates = {};
    this.initializeTransporter();
    this.loadTemplates();
  }

  /**
   * Inicializar el transporter de nodemailer
   */
  initializeTransporter() {
    try {
      // Configuración para Gmail (puedes cambiar por otro proveedor)
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: process.env.EMAIL_PORT || 587,
        secure: false, // true para 465, false para otros puertos
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      // Verificar la configuración
      this.transporter.verify((error, success) => {
        if (error) {
          logger.warn('Configuración de email no válida:', error.message);
          this.transporter = null;
        } else {
          logger.info('Servidor de email configurado correctamente');
        }
      });
    } catch (error) {
      logger.error('Error al inicializar el servicio de email:', error);
      this.transporter = null;
    }
  }

  /**
   * Cargar plantillas de email
   */
  loadTemplates() {
    try {
      const templatesDir = path.join(__dirname, '../templates/email');
      
      // Plantilla de confirmación para el usuario
      const userTemplatePath = path.join(templatesDir, 'order-confirmation-user.hbs');
      if (fs.existsSync(userTemplatePath)) {
        const userTemplateSource = fs.readFileSync(userTemplatePath, 'utf8');
        this.templates.userConfirmation = handlebars.compile(userTemplateSource);
      }

      // Plantilla de notificación para el administrador
      const adminTemplatePath = path.join(templatesDir, 'order-confirmation-admin.hbs');
      if (fs.existsSync(adminTemplatePath)) {
        const adminTemplateSource = fs.readFileSync(adminTemplatePath, 'utf8');
        this.templates.adminNotification = handlebars.compile(adminTemplateSource);
      }

      logger.info('Plantillas de email cargadas correctamente');
    } catch (error) {
      logger.error('Error al cargar plantillas de email:', error);
    }
  }

  /**
   * Enviar email de confirmación de compra al usuario
   */
  async sendOrderConfirmationToUser(orderData, userData) {
    if (!this.transporter) {
      logger.warn('Servicio de email no disponible, saltando envío al usuario');
      return { success: false, message: 'Servicio de email no configurado' };
    }

    try {
      const template = this.templates.userConfirmation;
      if (!template) {
        throw new Error('Plantilla de confirmación de usuario no encontrada');
      }

      const html = template({
        userName: userData.username || userData.email,
        orderNumber: orderData._id,
        orderDate: new Date(orderData.createdAt).toLocaleDateString('es-CL'),
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        tax: orderData.tax,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentInfo.method,
        paymentStatus: orderData.paymentInfo.status
      });

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Tienda Online'}" <${process.env.EMAIL_USER}>`,
        to: userData.email,
        subject: `Confirmación de Compra #${orderData._id}`,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email de confirmación enviado al usuario', {
        to: userData.email,
        messageId: result.messageId
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Error al enviar email de confirmación al usuario:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar notificación de nueva compra al administrador
   */
  async sendOrderNotificationToAdmin(orderData, userData) {
    if (!this.transporter) {
      logger.warn('Servicio de email no disponible, saltando notificación al admin');
      return { success: false, message: 'Servicio de email no configurado' };
    }

    try {
      const template = this.templates.adminNotification;
      if (!template) {
        throw new Error('Plantilla de notificación de administrador no encontrada');
      }

      const html = template({
        userName: userData.username || userData.email,
        userEmail: userData.email,
        orderNumber: orderData._id,
        orderDate: new Date(orderData.createdAt).toLocaleDateString('es-CL'),
        items: orderData.items,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shippingCost,
        tax: orderData.tax,
        total: orderData.total,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentInfo.method,
        paymentStatus: orderData.paymentInfo.status
      });

      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Tienda Online'}" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        subject: `Nueva Compra #${orderData._id} - ${userData.username || userData.email}`,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Notificación de compra enviada al administrador', {
        to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
        messageId: result.messageId
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Error al enviar notificación al administrador:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar email simple (sin plantilla)
   */
  async sendSimpleEmail(to, subject, text, html = null) {
    if (!this.transporter) {
      logger.warn('Servicio de email no disponible');
      return { success: false, message: 'Servicio de email no configurado' };
    }

    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'Tienda Online'}" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        text: text,
        html: html
      };

      const result = await this.transporter.sendMail(mailOptions);
      logger.info('Email simple enviado', {
        to: to,
        subject: subject,
        messageId: result.messageId
      });

      return { success: true, messageId: result.messageId };
    } catch (error) {
      logger.error('Error al enviar email simple:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar si el servicio de email está disponible
   */
  isAvailable() {
    return this.transporter !== null;
  }
}

module.exports = new EmailService();
