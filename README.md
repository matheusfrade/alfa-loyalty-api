# Loyalty Platform API

Generic, white-label loyalty system API with admin panel.

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Access the platform:**
   - API: http://localhost:3005
   - Admin Panel: http://localhost:3005/admin
   - Login Page: http://localhost:3005/login

## 🔑 Demo Accounts

### Admin Access
- **Email:** admin@loyalty.com
- **Password:** admin123

### Test Users
- **User 1:** user1@test.com / user1123
- **User 2:** user2@test.com / user2123
- **User 3:** user3@test.com / user3123

## 📚 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Missions
- `GET /api/missions` - List missions
- `POST /api/missions` - Create mission (admin)
- `POST /api/missions/{id}/claim` - Claim mission reward

### Rewards
- `GET /api/rewards` - List rewards/products
- `POST /api/rewards` - Create product (admin)
- `POST /api/rewards/{id}/redeem` - Redeem product

### Users
- `GET /api/users/{id}` - Get user details

## 🏗️ Architecture

### Backend Features
- **Multi-tenant**: Support multiple loyalty programs
- **Generic Rules Engine**: Configurable missions and rewards
- **Real-time Updates**: WebSocket support for notifications
- **Admin Panel**: Complete management interface
- **Analytics**: Built-in metrics and reporting

### Tech Stack
- **Framework:** Next.js 14 with App Router
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Auth:** JWT with HTTP-only cookies
- **UI:** Tailwind CSS + Radix UI
- **Validation:** Zod

## 📊 Database Schema

### Core Models
- **Program** - Multi-tenant loyalty programs
- **User** - User accounts and authentication
- **UserProgram** - User participation in programs
- **Mission** - Gamification challenges
- **Product** - Rewards catalog
- **Redemption** - Purchase history
- **Transaction** - Coin movement tracking
- **Tier** - User progression levels

### Key Features
- **Flexible Missions:** Support for single, recurring, streak, and milestone missions
- **Rich Rewards:** Multiple delivery types (automatic, code, physical, manual)
- **Tier System:** Progressive levels with multipliers and benefits
- **Transaction History:** Complete audit trail
- **Real-time Notifications:** In-app messaging system

## 🎯 Business Logic

### Mission System
```typescript
// Example mission requirement
{
  type: "daily_login",
  streak: 7,        // 7 consecutive days
  reward: 50,       // base coins
  xpReward: 10      // XP for tier progression
}
```

### Tier Multipliers
- **Iniciante:** 1.0x (0 XP)
- **Bronze:** 1.2x (100 XP)
- **Prata:** 1.5x (500 XP)
- **Ouro:** 2.0x (1,500 XP)
- **Diamante:** 2.5x (5,000 XP)
- **VIP:** 3.0x (15,000 XP)

### Reward Categories
- **BONUS** - Free bets, multipliers
- **CASHBACK** - Percentage returns
- **FREESPINS** - Slot game spins
- **PHYSICAL** - Merchandise
- **EXPERIENCE** - Events, tickets
- **CREDITS** - Platform currency
- **PREMIUM** - Exclusive features

## 🆕 Recent Updates

### Mission Builder System v2.0
- **🎯 Modular Mission Creation**: Advanced mission builder with step-by-step wizard
- **📅 Smart Date Validation**: Improved validation requiring at least one date (start OR end)
- **🎁 Product Rewards Integration**: Associate physical/digital rewards with missions
- **❌ Simplified Validation**: Description field is now optional (only name + date required)
- **🔧 Robust Error Handling**: Clear validation messages with specific guidance
- **✅ Fixed Backend Issues**: Resolved Prisma schema conflicts and date parsing

### Enhanced Admin Interface
- **📝 Edit Mission Modal**: Complete CRUD operations for existing missions
- **🗑️ Delete Functionality**: Safe mission deletion with confirmation
- **🔘 Fixed Button Handlers**: Programs page buttons (Analytics, API Keys, White-label) now functional
- **📊 Better UX**: Real-time validation feedback and progress indicators

### Automated Testing Suite  
- **🎭 Playwright Integration**: Browser automation for E2E testing
- **🧪 Validation Testing**: Comprehensive test coverage for mission creation flow
- **📸 Screenshot Debugging**: Visual debugging with automatic screenshot capture
- **🔍 Console Logging**: Detailed debugging for validation and state management

### Technical Improvements
- **🏗️ Prisma Schema Cleanup**: Removed conflicting metadata fields
- **🔄 Date Format Flexibility**: Backend accepts multiple date formats with auto-conversion
- **⚡ Performance Optimized**: Parallel tool execution and batch operations
- **🛡️ Enhanced Security**: Input validation with Zod schema improvements

## 🔧 Configuration

### Environment Variables
```bash
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-secret-key"
NEXT_PUBLIC_API_URL="http://localhost:3005"
ADMIN_EMAIL="admin@loyalty.com"
ADMIN_PASSWORD="admin123"
```

### Feature Flags
- `ENABLE_MULTI_TENANT` - Multiple programs support
- `ENABLE_WEBHOOKS` - External system integration
- `ENABLE_ANALYTICS` - Metrics collection
- `ENABLE_MISSION_BUILDER_V2` - Advanced mission creation system

## 🚀 Deployment

### Production Setup
1. **Database:** Migrate to PostgreSQL
2. **Environment:** Update production env vars
3. **Security:** Change JWT secret and admin credentials
4. **Scaling:** Configure Redis for caching/sessions

### Docker Support
```bash
# Build image
docker build -t loyalty-api .

# Run container
docker run -p 3005:3005 loyalty-api
```

## 📈 Scaling Considerations

### Performance
- **Database Indexing:** Key queries optimized
- **Caching Strategy:** Redis for frequent reads
- **CDN Integration:** Static assets and images
- **Rate Limiting:** API endpoint protection

### Multi-tenancy
- **Program Isolation:** Data separation by programId
- **Resource Limits:** Per-program quotas
- **Custom Branding:** White-label configuration
- **Analytics Separation:** Tenant-specific metrics

## 🔐 Security

### Authentication
- **JWT Tokens:** HTTP-only cookies
- **Password Hashing:** bcrypt with salt
- **Session Management:** Secure token rotation
- **CORS Configuration:** Origin validation

### Authorization
- **Role-based Access:** Admin vs User permissions
- **Resource Ownership:** Users can only access their data
- **API Rate Limiting:** Prevent abuse
- **Input Validation:** Zod schema validation

## 📝 Development

### Scripts
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - ESLint checks
- `npm run typecheck` - TypeScript validation
- `npx prisma studio` - Database GUI
- `npx prisma migrate dev` - Run migrations
- `node test-fixes.js` - Run automated tests
- `node test-validation-quick.js` - Test mission validation

### Project Structure
```
src/
├── app/              # Next.js app router
│   ├── api/         # API endpoints
│   │   ├── missions/    # Mission CRUD operations
│   │   ├── rewards/     # Product & redemption management
│   │   └── auth/        # Authentication endpoints
│   ├── admin/       # Admin panel
│   │   ├── missions/    # Mission management interface
│   │   └── programs/    # Program configuration
│   └── login/       # Authentication pages
├── components/       # React components
│   ├── admin/           # Admin-specific components
│   │   ├── EditMissionModal.tsx
│   │   ├── RewardSelector.tsx
│   │   └── CreateMissionModal.tsx
│   └── mission-builder/ # Mission builder system
│       ├── index.tsx        # Main mission builder
│       ├── ModuleSelector.tsx
│       └── ModularRuleBuilder.tsx
├── core/            # Core business logic
│   └── types.ts     # Mission rule definitions
├── modules/         # Modular mission system
│   └── igaming/     # iGaming-specific logic
├── lib/             # Utilities and config
├── services/        # Business logic
└── types/           # TypeScript definitions
```

### Testing Files
```
test-fixes.js              # Main test suite
test-validation-quick.js    # Validation testing
debug-mission-details.js    # Debug scripts
final-validation-test.js    # Comprehensive validation tests
```

## 🎮 Usage Examples

### Create Mission (Admin) - NEW API
```javascript
const mission = await fetch('/api/missions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    programId: 'program_id',
    title: 'Aposte no Brasileirão',
    description: 'Descrição opcional da missão',  // Optional now!
    category: 'CUSTOM',
    type: 'RECURRING',
    reward: 100,
    xpReward: 50,
    startDate: '2025-01-10T15:30:00',  // At least one date required
    endDate: '2025-05-20T23:59:00',    // Optional if startDate provided
    requirement: {
      triggers: [{
        event: 'sportsbook_bet_placed',
        filters: []
      }],
      conditions: [{
        field: 'amount',
        operator: '>=',
        value: '10'
      }, {
        field: 'championship',
        operator: '==',
        value: 'Brasileirão'
      }],
      logic: 'AND'
    },
    productRewards: [{  // NEW: Physical/Digital rewards
      productId: 'free_spins_product_id',
      quantity: 1
    }]
  })
})
```

### Redeem Product (User)
```javascript
const redemption = await fetch('/api/rewards/product_id/redeem', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    quantity: 1,
    deliveryInfo: { address: '...' }
  })
})
```

## 🧪 Testing & Quality Assurance

### Automated Testing
- **E2E Testing**: Playwright-based browser automation
- **Validation Testing**: Comprehensive form validation testing
- **Regression Testing**: Automated screenshot comparison
- **API Testing**: Backend endpoint validation
- **Integration Testing**: Full mission creation flow testing

### Manual Testing Workflows
1. **Mission Creation**: Use Mission Builder to create complex missions
2. **Validation Testing**: Test form validation with various input combinations  
3. **Product Integration**: Associate physical/digital rewards with missions
4. **Admin Operations**: Test edit, delete, and management functions

### Debugging Tools
- **Console Logging**: Detailed validation and state tracking
- **Screenshot Capture**: Visual debugging for UI issues
- **Error Handling**: Comprehensive error messages and recovery
- **Performance Monitoring**: Real-time validation feedback

## 🤝 Integration

This API is designed to integrate with:
- **Frontend Applications** (alfa-front)  
- **Mobile Apps** (React Native, Flutter)
- **Gaming Platforms** (Sportsbook, Casino)
- **E-commerce Systems**
- **Third-party Tools** (Webhooks, Analytics)
- **MCP (Model Context Protocol)**: Playwright automation support

## 📄 License

MIT License - See LICENSE file for details

---

**Built with ❤️ for the Alfa ecosystem**