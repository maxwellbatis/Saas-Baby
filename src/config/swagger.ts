import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Baby Diary API',
      version: '1.0.0',
      description: 'API completa para o sistema Baby Diary - Micro-SaaS para acompanhamento do desenvolvimento de bebês',
      contact: {
        name: 'Baby Diary Team',
        email: 'support@babydiary.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desenvolvimento'
      },
      {
        url: 'https://api.babydiary.com',
        description: 'Servidor de Produção'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT obtido através do login'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Baby: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            gender: { type: 'string', enum: ['male', 'female'] },
            birthDate: { type: 'string', format: 'date' },
            photoUrl: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Activity: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            type: { type: 'string', enum: ['sleep', 'feeding', 'diaper', 'weight', 'milestone', 'memory'] },
            title: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' },
            duration: { type: 'number' },
            notes: { type: 'string' },
            photoUrl: { type: 'string' }
          }
        },
        Plan: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            price: { type: 'number' },
            yearlyPrice: { type: 'number' },
            features: { type: 'array', items: { type: 'string' } },
            userLimit: { type: 'number' },
            memoryLimit: { type: 'number' },
            photoQuality: { type: 'string' },
            familySharing: { type: 'number' },
            exportFeatures: { type: 'boolean' },
            prioritySupport: { type: 'boolean' },
            aiFeatures: { type: 'boolean' },
            offlineMode: { type: 'boolean' },
            isActive: { type: 'boolean' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.ts'], // Caminho para os arquivos de rotas
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi }; 