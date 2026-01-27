# 🚀 RAILWAY DEPLOYMENT GUIDE

## 📋 PREREQUISITES

1. Create accounts:
   - **Railway**: https://railway.app (Use GitHub to sign up)
   - **GitHub**: https://github.com (if you don't have one)

2. Install Git (if not installed):
   - Download from https://git-scm.com/downloads

---

## 🔧 STEP 1: PREPARE YOUR PROJECT

### 1.1 Update Backend Requirements

Add `gunicorn` to requirements.txt:

```bash
cd c:\harsha\SmartRoadSystem\backend_django
```

Update `requirements.txt` to include:
```
Django==4.2.9
djangorestframework==3.14.0
djangorestframework-simplejwt==5.3.1
django-cors-headers==4.3.1
python-dotenv==1.0.0
Pillow==10.2.0
gunicorn==21.2.0
whitenoise==6.6.0
```

### 1.2 Update Django Settings

The settings are already configured, but verify `settings.py` has:
- `DEBUG = False` for production
- `ALLOWED_HOSTS` includes `.railway.app`
- CORS settings configured

---

## 🚂 STEP 2: DEPLOY BACKEND TO RAILWAY

### 2.1 Create GitHub Repository

```bash
# Navigate to your project
cd c:\harsha\SmartRoadSystem

# Initialize git (if not already done)
git init

# Create .gitignore
echo "*.pyc
__pycache__/
*.db
*.sqlite3
.env
node_modules/
build/
.DS_Store" > .gitignore

# Add all files
git add .
git commit -m "Initial commit - Smart Road System"

# Create repository on GitHub
# Go to https://github.com/new
# Create a new repository named "smart-road-system"

# Link to GitHub (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/smart-road-system.git
git branch -M main
git push -u origin main
```

### 2.2 Deploy on Railway

1. **Go to Railway**: https://railway.app/new

2. **Click "Deploy from GitHub repo"**
   - Authorize Railway to access your GitHub
   - Select your `smart-road-system` repository

3. **Configure Backend Service**:
   - Railway will auto-detect Django
   - Click on the service → **Settings**
   
4. **Add Environment Variables**:
   - Click **Variables** tab
   - Add these variables:
     ```
     SECRET_KEY = django-insecure-generate-a-new-secret-key-here
     DEBUG = False
     ALLOWED_HOSTS = .railway.app
     PORT = 8000
     ```

5. **Set Root Directory** (Important!):
   - In Settings → **Root Directory**
   - Set to: `backend_django`

6. **Deploy**:
   - Click **Deploy**
   - Wait 2-3 minutes for build to complete

7. **Get Your Backend URL**:
   - Go to **Settings** → **Domains**
   - Click **Generate Domain**
   - You'll get: `https://your-app-name.railway.app`
   - **SAVE THIS URL!**

---

## ⚛️ STEP 3: DEPLOY FRONTEND TO VERCEL

### 3.1 Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 3.2 Update Frontend Config

Create `.env.production` in frontend folder:

```bash
cd c:\harsha\SmartRoadSystem\frontend
```

Create file `.env.production`:
```
REACT_APP_API_URL=https://your-backend-name.railway.app
```

### 3.3 Deploy to Vercel

**Option A: Using Vercel Dashboard (Easiest)**

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure:
   - **Framework**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
4. Add Environment Variable:
   - `REACT_APP_API_URL` = `https://your-backend-name.railway.app`
5. Click **Deploy**
6. Get your URL: `https://your-app.vercel.app`

**Option B: Using CLI**

```bash
cd frontend
vercel --prod
```

---

## 🔗 STEP 4: CONNECT BACKEND & FRONTEND

### 4.1 Update Backend CORS Settings

Go back to **Railway** → Your Backend Service → **Variables**

Update:
```
ALLOWED_HOSTS = .railway.app,.vercel.app,your-app.vercel.app
```

### 4.2 Update Frontend API URL

In **Vercel** → Your Project → **Settings** → **Environment Variables**

Verify:
```
REACT_APP_API_URL = https://your-backend-name.railway.app
```

Redeploy if needed.

---

## ✅ STEP 5: TEST YOUR DEPLOYMENT

### 5.1 Test Backend

Visit: `https://your-backend-name.railway.app/api/contractors/`

You should see JSON data.

### 5.2 Test Frontend

Visit: `https://your-app.vercel.app`

You should see your dashboard.

### 5.3 Test Admin Login

1. Go to your frontend URL
2. Click Admin Login
3. Use credentials: `admin` / `Admin@456`

---

## 🗄️ STEP 6: SETUP DATABASE (IMPORTANT!)

### Option A: Keep SQLite (Simple)

Railway will persist your SQLite database automatically.

To seed data on Railway:

1. Go to Railway Dashboard
2. Click your service → **Deployments**
3. Click latest deployment → **View Logs**
4. In **Settings** → click **+ New → Database → SQLite**

### Option B: Use PostgreSQL (Recommended for Production)

1. In Railway Dashboard:
   - Click **+ New** → **Database** → **PostgreSQL**
   
2. Update Backend Environment Variables:
   ```
   DATABASE_URL = (Railway will auto-populate this)
   ```

3. Update `settings.py` to use PostgreSQL:
   ```python
   import dj_database_url
   
   DATABASES = {
       'default': dj_database_url.config(
           default=f'sqlite:///{BASE_DIR / "smart_road_system.db"}'
       )
   }
   ```

4. Add to `requirements.txt`:
   ```
   dj-database-url==2.1.0
   psycopg2-binary==2.9.9
   ```

5. Redeploy

### 6.3 Run Initial Setup

On Railway, you can run commands:

1. Go to Railway Dashboard → Your Service
2. Click **Deployments** → Latest → **View Logs**
3. Use Railway CLI to run:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run python manage.py migrate

# Create superuser
railway run python manage.py createsuperuser

# Seed data
railway run python seed_all_data.py
```

---

## 🎯 YOUR PERMANENT URLS

After deployment, you'll have:

- **Frontend**: `https://smart-road-system.vercel.app`
- **Backend API**: `https://smart-road-system.railway.app`
- **Admin Panel**: `https://smart-road-system.vercel.app/admin`
- **QR Codes**: `https://smart-road-system.vercel.app/contractor-qr`

---

## 📱 SHARE YOUR PROJECT

Share these URLs in your presentation:

```
🌐 Live Demo: https://your-app.vercel.app
🔗 API Docs: https://your-backend.railway.app/api/
📊 GitHub: https://github.com/yourusername/smart-road-system
```

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**Error: Application failed to start**
- Check Railway logs for errors
- Verify `Procfile` is correct
- Ensure `gunicorn` is in requirements.txt

**Error: Module not found**
- Check all dependencies are in `requirements.txt`
- Verify Root Directory is set to `backend_django`

**Database errors**
- Run migrations on Railway
- Check DATABASE_URL environment variable

### Frontend Issues

**Error: API calls failing**
- Verify `REACT_APP_API_URL` is correct
- Check CORS settings in Django
- Ensure backend is running

**Build failed**
- Check Node.js version compatibility
- Verify all dependencies in `package.json`
- Check build logs in Vercel

---

## 💡 COST

- **Railway**: Free tier includes:
  - $5 credit monthly
  - 500 hours execution
  - Sufficient for demo/testing

- **Vercel**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth
  - Perfect for frontend

---

## 🔄 CONTINUOUS DEPLOYMENT

Once set up, any push to your GitHub repository will automatically:
1. Trigger new Railway deployment (backend)
2. Trigger new Vercel deployment (frontend)

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Both services will redeploy automatically! 🎉

---

## 📞 SUPPORT

If you need help:
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Django Deployment: https://docs.djangoproject.com/en/4.2/howto/deployment/

---

**STATUS**: Ready for Deployment ✅
**ESTIMATED TIME**: 20-30 minutes
**DIFFICULTY**: Beginner-Friendly 🟢
