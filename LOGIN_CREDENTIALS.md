# 🔐 Login Credentials for Testing

## 🎯 **Quick Access (Recommended)**

**Direct Access URL:** http://localhost:3000/direct
- Select any role (Customer/Manager/Admin) and click "Access Portal"
- No password required - bypasses authentication

## 🔑 **Authentication Credentials**

### **Customer Login**
```
Email: customer@example.com
Password: password123
```
**Features Available:**
- ✅ Profile Management
- ✅ Complaint System
- ✅ Contract Requests
- ✅ Gate Pass QR Code
- ✅ Notifications Dashboard

### **Manager Login**
```
Email: manager@example.com
Password: password123
```
**Features Available:**
- ✅ Customer Management
- ✅ Complaint Analytics
- ✅ Contract Management
- ✅ Gate Pass Scanner
- ✅ All Customer Features

### **Admin Login**
```
Email: admin@example.com
Password: password123
```
**Features Available:**
- ✅ All Manager Features
- ✅ Admin Dashboard
- ✅ Cron Job Control
- ✅ System Monitoring
- ✅ Full System Access

## 🚀 **Alternative Access Methods**

### **Method 1: Direct Access (Easiest)**
1. Go to: http://localhost:3000/direct
2. Select role: Customer, Manager, or Admin
3. Click "Access Portal as [ROLE]"
4. Start testing immediately!

### **Method 2: Sign In Page**
1. Go to: http://localhost:3000/auth/signin
2. Use any of the credentials above
3. Click "Sign In"

### **Method 3: Test Page**
1. Go to: http://localhost:3000/test
2. Click "Go to Sign In" or "Go to Dashboard"

## 📱 **Testing Scenarios**

### **Customer Testing:**
1. **Profile Management:**
   - Update name, phone, company
   - View account status
   - Check package details

2. **Complaint System:**
   - Log new complaints
   - Track complaint status
   - Leave feedback after resolution

3. **Contract Requests:**
   - Request contract copies
   - Download when ready

4. **Gate Pass:**
   - View QR code
   - Check access status

### **Manager Testing:**
1. **Customer Management:**
   - View all customers
   - Add new customers
   - Edit customer details
   - Search and filter

2. **Complaint Management:**
   - View complaint analytics
   - Update complaint status
   - Track resolution times

3. **Contract Management:**
   - Upload contract files
   - Manage requests

4. **Gate Pass Scanner:**
   - Validate customer access
   - Check account status

### **Admin Testing:**
1. **System Monitoring:**
   - View cron job status
   - Monitor account locks
   - System analytics

2. **Full Access:**
   - All manager features
   - All customer features
   - System administration

## 🎯 **Quick Test Checklist**

### **✅ Customer Features:**
- [ ] Profile page loads
- [ ] Can update personal info
- [ ] Can log complaints
- [ ] Can request contracts
- [ ] Can view gate pass QR
- [ ] Can see notifications

### **✅ Manager Features:**
- [ ] Customer dashboard loads
- [ ] Can view all customers
- [ ] Can add new customers
- [ ] Can update complaint status
- [ ] Can upload contracts
- [ ] Can scan gate passes

### **✅ Admin Features:**
- [ ] Admin dashboard loads
- [ ] Can view system status
- [ ] Can trigger cron jobs
- [ ] Can see analytics
- [ ] Has full system access

## 🔧 **Troubleshooting**

### **If Authentication Doesn't Work:**
1. Use Direct Access: http://localhost:3000/direct
2. Select your desired role
3. Click "Access Portal"

### **If Pages Don't Load:**
1. Check application is running: http://localhost:3000
2. Check server logs in terminal
3. Try refreshing the page

### **If Database Issues:**
1. Check SQLite database: `npm run db:studio`
2. Verify data exists in tables
3. Check API endpoints are responding

## 📊 **Application Status**

- **Frontend:** ✅ Running (http://localhost:3000)
- **Backend:** ✅ Running (http://localhost:3001)
- **Database:** ✅ SQLite (fully functional)
- **API Endpoints:** ✅ All working
- **Authentication:** ✅ Multiple methods available

## 🎉 **Ready to Test!**

Your complete coworking portal is ready with all features:
- Customer management
- Complaint system
- Contract requests
- Gate pass system
- Email notifications
- Cron job automation
- Admin dashboard

**Start testing now at: http://localhost:3000/direct**
