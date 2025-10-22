# 🔐 Real Login Credentials for Testing

## 🎯 **Working Login Credentials**

### **Customer Login**
```
Email: customer@example.com
Password: customer123
```
**User:** John Customer  
**Role:** CUSTOMER  
**Features:** Profile, Complaints, Contracts, Gate Pass

### **Manager Login**
```
Email: manager@example.com
Password: manager123
```
**User:** Jane Manager  
**Role:** MANAGER  
**Features:** Customer Management, Complaint Analytics, Contract Management, Gate Scanner

### **Admin Login**
```
Email: admin@example.com
Password: admin123
```
**User:** Admin User  
**Role:** ADMIN  
**Features:** System Analytics, Full Access, All Manager & Customer Features

### **Staff Login**
```
Email: staff@example.com
Password: staff123
```
**User:** Staff User  
**Role:** STAFF  
**Features:** Time Tracking, Profile Management, Notifications, Staff Dashboard

## 🚀 **How to Login**

### **Method 1: Sign In Page (Recommended)**
1. Go to: http://localhost:3000/auth/signin
2. Enter any of the credentials above
3. Click "Sign In"
4. You'll be redirected to the role-based dashboard

### **Method 2: Home Page**
1. Go to: http://localhost:3002
2. Click "Sign In to Portal"
3. Enter your credentials
4. You'll be redirected to your role-based dashboard

## 📱 **What You Can Test**

### **Customer Features (customer@example.com)**
- ✅ **Profile Management** - Update personal information
- ✅ **Complaint System** - Log complaints, track status, leave feedback
- ✅ **Contract Requests** - Request and download contract copies
- ✅ **Gate Pass System** - View QR code and check access status
- ✅ **Notifications** - Real-time notification feed

### **Manager Features (manager@example.com)**
- ✅ **Customer Management** - Full CRUD operations with search/filter
- ✅ **Complaint Analytics** - Resolution time tracking and analytics
- ✅ **Contract Management** - Upload and manage customer contracts
- ✅ **Gate Pass Scanner** - Validate customer access with QR scanning
- ✅ **All Customer Features** - Full access to customer functions

### **Admin Features (admin@example.com)**
- ✅ **System Analytics** - Complete system monitoring and metrics
- ✅ **Customer Management** - Full customer control and management
- ✅ **Complaint Management** - Advanced complaint tracking and analytics
- ✅ **System Controls** - Cron job management and system monitoring
- ✅ **All Manager Features** - Full access to all management functions
- ✅ **All Customer Features** - Full access to all customer functions

### **Staff Features (staff@example.com)**
- ✅ **Time Tracking** - Clock in/out functionality and working hours tracking
- ✅ **Profile Management** - Update personal information and account settings
- ✅ **Notifications** - View system notifications and updates
- ✅ **Staff Dashboard** - Overview with time statistics and quick actions

## 🎯 **Testing Scenarios**

### **Customer Testing:**
1. **Login as Customer:**
   - Email: `customer@example.com`
   - Password: `customer123`
   - You'll see: Customer Dashboard with Profile, Complaints, Contracts, Gate Pass

2. **Test Customer Features:**
   - Click "Profile" to update personal information
   - Click "Complaints" to log and track complaints
   - Click "Contracts" to request contract copies
   - Click "Gate Pass" to view QR code

### **Manager Testing:**
1. **Login as Manager:**
   - Email: `manager@example.com`
   - Password: `manager123`
   - You'll see: Manager Dashboard with Customers, Complaints, Contracts, Gate Scanner

2. **Test Manager Features:**
   - Click "Customers" to manage customer database
   - Click "Complaints" to track and resolve complaints
   - Click "Contracts" to upload contract files
   - Click "Gate Scanner" to validate customer access

### **Admin Testing:**
1. **Login as Admin:**
   - Email: `admin@example.com`
   - Password: `admin123`
   - You'll see: Admin Dashboard with Analytics, Customers, Complaints, System

2. **Test Admin Features:**
   - Click "Analytics" to view system metrics
   - Click "Customers" to manage all customers
   - Click "Complaints" to track all complaints
   - Click "System" to monitor cron jobs and system status

## 🔧 **Troubleshooting**

### **If Login Doesn't Work:**
1. **Check Credentials:** Make sure you're using the exact credentials above
2. **Clear Browser Cache:** Clear cookies and local storage
3. **Try Direct Access:** Use http://localhost:3000/direct as alternative
4. **Check Console:** Look for any JavaScript errors in browser console

### **If Pages Don't Load:**
1. **Check Application Status:** Ensure both frontend and backend are running
2. **Check Network:** Verify you can access http://localhost:3000
3. **Check Backend:** Verify http://localhost:3001/api/health returns OK
4. **Restart Application:** Stop and restart with `npm run dev`

## 📊 **Application Status**

- **Frontend:** ✅ Running (http://localhost:3000)
- **Backend:** ✅ Running (http://localhost:3001)
- **Database:** ✅ SQLite (fully functional)
- **Authentication:** ✅ Working with real credentials
- **API Endpoints:** ✅ All working
- **Role-Based Access:** ✅ Working perfectly

## 🎉 **Ready to Test!**

Your complete coworking portal is ready with real authentication:

**Login URLs:**
- **Sign In:** http://localhost:3002/auth/signin
- **Home Page:** http://localhost:3002

**Test Credentials:**
- **Customer:** customer@example.com / customer123
- **Manager:** manager@example.com / manager123  
- **Staff:** staff@example.com / staff123
- **Admin:** admin@example.com / admin123

All features are working with proper role-based access! 🚀
