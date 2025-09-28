# QuickBite - Food Delivery App

A comprehensive food delivery application built with React.js, similar to Swiggy, featuring multiple user roles and a modern, responsive UI.

## 🚀 Features

### Customer Features
- **Restaurant Browsing**: Browse restaurants by cuisine, ratings, and location
- **Menu Management**: View detailed menus with customization options
- **Shopping Cart**: Add/remove items with quantity management
- **Order Placement**: Place orders with multiple payment options
- **Order Tracking**: Real-time order status updates
- **User Profile**: Manage personal information and delivery addresses
- **Reviews & Ratings**: Rate restaurants and delivery experience

### Admin Features
- **Dashboard**: Comprehensive analytics and overview
- **User Management**: Manage customers, restaurant owners, and delivery partners
- **Restaurant Management**: Approve, manage, and monitor restaurants
- **Order Management**: Track and manage all orders
- **Delivery Partner Management**: Manage delivery personnel
- **Promotions**: Create and manage discount coupons

### Restaurant Owner Features
- **Restaurant Dashboard**: Overview of orders and performance
- **Menu Management**: Add, edit, and manage menu items
- **Order Management**: Accept/reject orders and update status
- **Analytics**: View sales reports and popular items
- **Restaurant Profile**: Manage restaurant information

### Delivery Partner Features
- **Order Assignment**: Accept available delivery orders
- **Navigation**: GPS navigation to pickup and delivery locations
- **Order Tracking**: Update delivery status
- **Earnings**: Track daily and weekly earnings
- **Performance**: View ratings and delivery statistics

## 🛠️ Tech Stack

- **Frontend**: React.js 19.1.1
- **State Management**: Redux Toolkit with Thunk
- **UI Framework**: Material-UI (MUI) v5
- **Styling**: Tailwind CSS + Custom CSS
- **Form Handling**: Formik with Yup validation
- **Routing**: React Router v6
- **Build Tool**: Vite
- **Icons**: Material-UI Icons

## 📁 Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components
│   ├── forms/           # Form components
│   ├── modals/          # Modal components
│   └── layout/          # Layout components
├── pages/
│   ├── customer/        # Customer-facing pages
│   ├── admin/           # Admin dashboard pages
│   ├── restaurant/      # Restaurant owner pages
│   └── delivery/        # Delivery partner pages
├── store/
│   └── slices/          # Redux slices
├── constants/           # Mock data and constants
├── services/            # API services
├── utils/               # Utility functions
└── hooks/               # Custom React hooks
```

## 🎨 Design Features

- **Swiggy-like UI**: Modern, clean, and intuitive design
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Professional Styling**: Custom CSS with Swiggy-inspired color scheme
- **Smooth Animations**: Hover effects and transitions
- **Accessibility**: Proper focus management and keyboard navigation

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd quickbite
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5174`

## 📱 User Roles & Access

### Test Users (Mock Data)

**Customer:**
- Email: `john@example.com`
- Password: `password123`

**Admin:**
- Email: `admin@quickbite.com`
- Password: `admin123`

**Restaurant Owner:**
- Email: `owner@restaurant.com`
- Password: `owner123`

**Delivery Partner:**
- Email: `delivery@quickbite.com`
- Password: `delivery123`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 📋 Key Components

### Reusable Components
- **Button**: Custom styled button with loading states
- **Card**: Restaurant and menu item cards
- **Modal**: Sticky header/footer modals for forms
- **TextField**: Custom styled form inputs
- **LoadingSpinner**: Loading indicators
- **Notification**: Toast notifications

### Form Components
- **LoginForm**: User authentication
- **RegisterForm**: User registration
- **AddressForm**: Delivery address management

### Layout Components
- **Layout**: Main application layout with header
- **ProtectedRoute**: Role-based route protection

## 🎯 Future Enhancements

- **Backend Integration**: Connect to Spring Boot backend
- **Real-time Updates**: WebSocket integration for live order tracking
- **Payment Gateway**: RazorPay integration
- **Push Notifications**: Real-time order updates
- **Maps Integration**: Google Maps for delivery tracking
- **Advanced Analytics**: Detailed reporting and insights
- **Multi-language Support**: Internationalization
- **Dark Mode**: Theme switching capability

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please contact the development team.

---

**QuickBite** - Bringing delicious food to your doorstep! 🍕🍔🍜