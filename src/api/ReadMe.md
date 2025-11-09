# 📊 SaasFinanceApp API

## 💡 Korte projectbeschrijving
**SaasFinanceApp** is een moderne **financiële SaaS-toepassing** waarmee gebruikers hun inkomsten, uitgaven en budgetten kunnen beheren.  
De API biedt slimme **analyse**, **budgetadvies**, en **automatische voorspellingen** om gebruikers te helpen hun financiële doelen te bereiken.  
Gebouwd met **.NET 9**, **Entity Framework Core** en **PostgreSQL**, met een **React (Expo)** frontend.

---

## 🌐 API-informatie
**Productie-API:**  
👉 [https://saasfinanceapp-v8zp.onrender.com/api](https://saasfinanceapp-v8zp.onrender.com/api)

---

## 📑 Gebruikte API + endpoints

### 🔐 AuthController
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| `POST` | `/api/auth/register` | Nieuwe gebruiker registreren |
| `POST` | `/api/auth/login` | Gebruiker inloggen en JWT-token ontvangen |
| `GET` | `/api/auth/me` | Ingelogde gebruiker ophalen (via JWT) |

---

### 💸 TransactionController
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| `GET` | `/api/transactions` | Alle transacties van de gebruiker ophalen (met filters en paginatie) |
| `GET` | `/api/transactions/{id}` | Één specifieke transactie ophalen |
| `POST` | `/api/transactions` | Nieuwe transactie toevoegen |
| `PUT` | `/api/transactions/{id}` | Bestaande transactie bijwerken |
| `DELETE` | `/api/transactions/{id}` | Transactie verwijderen |

---

### 🏷️ CategoryController
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| `GET` | `/api/categories` | Alle categorieën ophalen |
| `POST` | `/api/categories` | Nieuwe categorie aanmaken |
| `PUT` | `/api/categories/{id}` | Categorie bijwerken |
| `DELETE` | `/api/categories/{id}` | Categorie verwijderen |

---

### 📈 AnalyticsController
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| `GET` | `/api/analytics/monthly-average` | Gemiddelde maandelijkse uitgaven |
| `GET` | `/api/analytics/category-summary` | Uitgaven per categorie |
| `GET` | `/api/analytics/income-expense-ratio` | Inkomens-/uitgavenratio |
| `GET` | `/api/analytics/forecast` | Financiële voorspelling |

---

### 💬 AdviceController
| Methode | Endpoint | Beschrijving |
|----------|-----------|---------------|
| `POST` | `/api/advice/ask` | Financieel advies aanvragen |
| `GET` | `/api/advice/history` | Adviesgeschiedenis ophalen |

---

## 🧭 Run-instructies

### 🔧 Backend (API)
1. Open de map `SaasFinanceApp.Api`
2. Controleer of **PostgreSQL** actief is en pas `appsettings.json` aan:
   ```json
   "ConnectionStrings": {
       "DefaultConnection": "Host=localhost;Database=FinanceDb;Username=postgres;Password=yourpassword"
   }
Voer de migraties uit:

bash
Copier le code
dotnet ef database update
Start de API:

bash
Copier le code
dotnet run
Open Swagger:
👉 https://localhost:5001/swagger

📱 Frontend (React + Expo)
Open de map SaasFinanceApp.ReactNative

Installeer dependencies:

bash
Copier le code
npm install
Start de app:

bash
Copier le code
npm start
Scan de QR-code in de terminal met de Expo Go app (Android/iOS).

De app communiceert met de online API via:

bash
Copier le code
https://saasfinanceapp-v8zp.onrender.com/api
🔍 Zoeken & sorteren
De API ondersteunt zoeken, filteren en sorteren voor transacties via queryparameters:

Voorbeeld:

sql
Copier le code
GET /api/transactions?type=Expense&category=Food&month=2025-11&sortBy=amount&order=desc&page=1&pageSize=10
Parameters:

type: Income of Expense

category: filter op categorie

month: filter per maand

sortBy: veld om op te sorteren (bijv. date, amount)

order: asc of desc

page / pageSize: voor paginatie

De resultaten worden automatisch beperkt tot de transacties van de ingelogde gebruiker (via JWT-authenticatie).

🧱 Gebruikte technologieën
Technologie	Beschrijving
.NET 9 (C#)	Backend API met Identity + JWT
Entity Framework Core	ORM voor PostgreSQL-database
PostgreSQL	Relationele database
Swagger UI	Documentatie en test van endpoints
JWT Auth	Gebruikersauthenticatie
React + Expo	Cross-platform frontend (web, Android, iOS)

👤 Auteur
Naam: Youssri Ghanmi
GitHub: https://github.com/Yussri-dev/bilancia