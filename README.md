# Muslim Marriage Referral Platform

A comprehensive web platform for Muslim marriage referrals, digitizing traditional WhatsApp group workflows with secure profile management, admin approval processes, and privacy-focused matching.

## 🌟 Features

### Core Functionality
- **Profile Management**: Detailed biodata submission with parent/guardian consent
- **Admin Approval**: All profiles reviewed before publication
- **Privacy-First Matching**: Contact details shared only with mutual consent
- **Monthly Batches**: Organized profile publication system
- **Interest Expression**: Secure way to show interest in profiles
- **Role-Based Access**: Admin, Parent/Relative, and optional Candidate roles

### Technical Features
- **Separated Backend & Frontend**: Backend deployable on Render, Frontend on GitHub Pages
- **Mobile-Ready API**: Backend designed to support both web and mobile apps
- **Supabase Database**: PostgreSQL database hosted on Supabase
- **Authentication**: JWT-based auth with email verification
- **Real-time Updates**: Modern React frontend with state management
- **Automated Deployment**: GitHub Actions for CI/CD

## 🏗️ Architecture

```
islamic-marriage-web-app/
├── backend/           # Express.js API server
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── types/
│   ├── prisma/        # Database schema and migrations
│   └── package.json
├── frontend/          # React.js web application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── package.json
└── .github/workflows/ # Automated deployment
```

## 🚀 Deployment

### Prerequisites
1. **Supabase Account**: Create a project at [supabase.com](https://supabase.com)
2. **Render Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Fork this repository

### Backend Deployment (Render)

1. **Create Supabase Database**:
   ```bash
   # Get your Supabase connection details from your project settings
   DATABASE_URL="postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:[password]@[project-ref].supabase.co:5432/postgres"
   ```

2. **Deploy to Render**:
   - Connect your GitHub repository to Render
   - Create a new Web Service
   - Set root directory to `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

3. **Environment Variables on Render**:
   ```env
   DATABASE_URL=your_supabase_url
   DIRECT_URL=your_supabase_url
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRES_IN=7d
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your_email
   SMTP_PASS=your_app_password
   APP_NAME=Muslim Marriage Referral Platform
   ADMIN_EMAIL=admin@yourdomain.com
   FRONTEND_URL=https://yourusername.github.io/islamic-marriage-web-app
   NODE_ENV=production
   ```

4. **Setup Database**:
   ```bash
   # After deployment, run these commands in Render console
   npm run db:migrate
   npm run db:seed
   ```

### Frontend Deployment (GitHub Pages)

1. **Update Package.json**:
   ```json
   {
     "homepage": "https://yourusername.github.io/islamic-marriage-web-app"
   }
   ```

2. **Environment Variables**:
   - Go to repository Settings → Secrets and Variables → Actions
   - Add: `REACT_APP_API_URL` = your Render backend URL

3. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy on push to main

### Automated Deployment

The repository includes GitHub Actions workflows that automatically:
- Deploy frontend to GitHub Pages when `frontend/` changes
- Trigger Render deployment when `backend/` changes
- Run tests and builds before deployment

## 🛠️ Local Development

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial admin user
npm run db:seed

# Start development server
npm run dev
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Setup environment variables
echo "REACT_APP_API_URL=http://localhost:3001" > .env.local

# Start development server
npm run dev
```

## 📊 Database Schema

### Key Models

- **User**: Authentication and role management
- **Profile**: Detailed biodata with all matrimonial information
- **Interest**: Expression of interest between users and profiles
- **AdminAction**: Audit trail of admin decisions
- **EmailLog**: Email notification tracking

### Profile Fields (Based on Requirements)

- Personal: Name, Gender, DOB, Height, Complexion
- Education: Degree, Subject, Year, Institute
- Professional: Job Title, Company
- Family: Parents' occupation, education, location
- Location: Current residence, immigration status
- Religious: Practice level, prayer frequency, halaal compliance
- Lifestyle: Smoking, drinking, hobbies, pets
- Preferences: Spouse criteria (age, education, location)
- Consent: Parent approval, terms agreement

## 🔐 Security Features

- JWT-based authentication
- Email verification required
- Rate limiting on API endpoints
- CORS protection
- Input validation with Zod
- SQL injection protection via Prisma
- XSS protection with helmet
- Privacy controls on profile data

## 👥 User Roles

### Admin
- Approve/reject profiles
- Manage published batches
- View interest matches
- Facilitate contact exchange
- Access admin dashboard

### Parent/Relative
- Submit candidate profiles
- Browse approved profiles
- Express interest in candidates
- View own submissions

### Candidate (Optional)
- Edit own profile if permitted
- Limited access to platform

## 📱 Mobile App Support

The backend API is designed to support mobile applications:

- RESTful API endpoints
- JWT authentication
- Standardized response format
- Error handling
- File upload support (for photos)

## 🔧 Configuration

### Email Settings
Configure SMTP for notifications:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Admin Account
Default admin credentials (change after first login):
- Email: As configured in `ADMIN_EMAIL`
- Password: `admin123456`

## 📈 Monitoring

- Health check endpoint: `/health`
- Email log tracking
- Admin action audit trail
- Request logging
- Error tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Issues**: Report bugs via GitHub Issues
- **Email**: Contact admin email configured in environment
- **Documentation**: Check this README and code comments

## 🚀 Future Enhancements

- Photo upload and verification
- Advanced search and filtering
- Email notification system
- Mobile app development
- Analytics dashboard
- Multi-language support
- WhatsApp integration

---

Built with ❤️ for the Muslim community