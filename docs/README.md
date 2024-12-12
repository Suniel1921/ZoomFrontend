## Zoom Management System Documentation

### Project Overview
The Zoom Management System is a comprehensive CRM platform designed for managing visa applications, translations, ePassport services, and other client services. The system is built using React for the frontend and Node.js for the backend, with a MySQL database.

### Tech Stack
- **Frontend**: React 18.3.1 with TypeScript
- **Backend**: Node.js with Express
- **Database**: MySQL
- **State Management**: Zustand
- **UI Framework**: Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Icons**: Lucide React

### Project Structure

```
project/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── features/          # Feature-specific code
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API and external services
│   ├── store/             # Zustand state management
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Express middleware
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── scripts/          # Utility scripts
│   ├── templates/        # Email templates
│   └── utils/            # Helper functions
└── public/               # Static assets
```

### Key Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Role-based access control (Super Admin, Admin, Client)
   - Session management with refresh tokens

2. **Client Management**
   - Client profiles with detailed information
   - Document management
   - Communication history
   - Family member tracking

3. **Application Processing**
   - Visa applications
   - Japan visit applications
   - ePassport applications
   - Translation services
   - Graphic design services

4. **Task Management**
   - Process flow templates
   - Step-by-step tracking
   - Document requirements
   - Payment milestones

5. **Appointment System**
   - Online/physical meeting scheduling
   - Automatic reminders
   - Calendar integration

6. **Financial Management**
   - Payment tracking
   - Invoice generation
   - Financial reports

### State Management

The application uses Zustand for state management, with separate stores for different features:

1. **Main Store** (`store/index.ts`)
   - Client data
   - Applications
   - Appointments
   - Documents

2. **Admin Store** (`store/adminStore.ts`)
   - Admin users
   - Permissions
   - Role management

3. **Task Management Store** (`store/taskManagementStore.ts`)
   - Process templates
   - Task tracking
   - Document requirements

4. **Message Store** (`store/messageStore.ts`)
   - Internal messaging
   - Notifications

### Adding New Features

1. **Create New Component**
   ```typescript
   // src/components/NewFeature.tsx
   import { useState } from 'react';
   import Button from '../components/Button';
   
   interface NewFeatureProps {
     // Define props
   }
   
   export default function NewFeature({ ...props }: NewFeatureProps) {
     // Component logic
   }
   ```

2. **Add New Store**
   ```typescript
   // src/store/newFeatureStore.ts
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';
   
   interface NewFeatureStore {
     // Define state and actions
   }
   
   export const useNewFeatureStore = create<NewFeatureStore>()(
     persist(
       (set) => ({
         // Store implementation
       }),
       {
         name: 'new-feature-store',
       }
     )
   );
   ```

3. **Add New API Route**
   ```javascript
   // server/routes/newFeature.js
   const express = require('express');
   const router = express.Router();
   const { protect, authorize } = require('../middleware/auth');
   
   router.get('/', protect, async (req, res) => {
     // Route implementation
   });
   
   module.exports = router;
   ```

### Database Schema Updates

When modifying the database schema:

1. Create a new migration file in `server/models/migrations/`
2. Update the corresponding model in `server/models/`
3. Run database migrations using `npm run setup-db`

### Adding New Process Templates

1. Create template file in `src/features/process-flow/templates/`
2. Define steps, documents, and payments
3. Register template in `DEFAULT_TEMPLATES` array

### Styling Guidelines

1. Use Tailwind CSS utility classes
2. Follow the established color scheme:
   - Primary: brand-yellow (#FEDC00)
   - Secondary: brand-black (#010101)
   - Accent colors for status indicators

### Best Practices

1. **Code Organization**
   - Keep components small and focused
   - Use TypeScript for type safety
   - Follow the established folder structure

2. **State Management**
   - Use Zustand for global state
   - Keep state normalized
   - Use optimistic updates for better UX

3. **Performance**
   - Implement pagination for large lists
   - Use React.memo() for expensive components
   - Optimize database queries

4. **Security**
   - Validate all user inputs
   - Sanitize data before display
   - Use proper CORS settings
   - Implement rate limiting

### Common Tasks

1. **Adding a New Service Type**
   - Add service type to constants
   - Create necessary components
   - Update database schema
   - Add API endpoints
   - Update process templates

2. **Modifying Process Flow**
   - Update template in process-flow/templates
   - Update task management store
   - Update UI components
   - Add new document requirements

3. **Adding New Document Types**
   - Update document types enum
   - Add validation rules
   - Update document checklist
   - Update file upload handlers

### Deployment

1. **Frontend Deployment**
   ```bash
   npm run build
   ```
   - Upload dist/ contents to public_html/
   - Update .htaccess if needed

2. **Backend Deployment**
   ```bash
   cd server
   npm install --production
   npm run setup-db
   pm2 start pm2.config.js
   ```

### Troubleshooting

1. **Database Issues**
   - Check connection settings
   - Verify table structures
   - Check for foreign key constraints

2. **File Upload Issues**
   - Verify upload directory permissions
   - Check file size limits
   - Verify MIME type restrictions

3. **Authentication Issues**
   - Check JWT token expiration
   - Verify refresh token flow
   - Check role permissions

### Monitoring

1. **Application Logs**
   - Check PM2 logs: `pm2 logs`
   - Check error logs in /logs directory
   - Monitor server resources

2. **Database Monitoring**
   - Check slow queries
   - Monitor connection pool
   - Check backup status

### Support

For technical support or questions:
- Email: support@zoomcreatives.jp
- Phone: 03-6764-5723
- Mobile: 090-6494-5723

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the style guide
4. Submit a pull request

### License

This project is proprietary software owned by Zoom Creatives Inc.