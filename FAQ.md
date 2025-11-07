# ❓ Často kladené otázky (FAQ)

## 🐳 Docker problémy

### Q: Kontejner zobrazuje jen tmavé pozadí, žádný obsah
**A:** Toto je nejčastější problém. Příčina je, že environment proměnné nebyly předány při buildu.

**Řešení:**
```bash
# Ujistěte se, že máte .env soubor s vašimi API klíči
# Pak použijte docker-compose:
docker-compose down
docker-compose up --build
```

### Q: "Error: Cannot find module" při buildu
**A:** Node modules nejsou správně nainstalovány.

**Řešení:**
```bash
# Rebuild bez cache
docker-compose build --no-cache
docker-compose up
```

### Q: Port 8080 je již obsazený
**A:** Jiný proces používá port 8080.

**Řešení 1 - Změnit port:**
```yaml
# V docker-compose.yml změňte:
ports:
  - "3000:80"  # Místo 8080:80
```

**Řešení 2 - Zastavit proces:**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

### Q: Docker build je velmi pomalý
**A:** Docker stahuje velké image nebo má plnou cache.

**Řešení:**
```bash
# Vyčistit Docker cache
docker system prune -a

# Použít menší base image (již používáme alpine)
# Nebo zvýšit Docker resources v Docker Desktop
```

## 🔑 API klíče a konfigurace

### Q: Kde získám TMDB API klíč?
**A:** 
1. Registrujte se na https://www.themoviedb.org/
2. Jděte do Settings → API
3. Vytvořte nový API klíč
4. Použijte **Bearer Token**, ne API Key

### Q: Jak nastavím Appwrite?
**A:**
1. Vytvořte účet na https://cloud.appwrite.io/
2. Vytvořte nový projekt
3. Vytvořte databázi a kolekci s názvem "metrics"
4. Nastavte atributy:
   - `searchTerm` (string)
   - `count` (integer)
   - `movie_id` (integer)
   - `poster_url` (string)
5. Zkopírujte Project ID, Database ID do .env

### Q: Appwrite vrací 401 Unauthorized
**A:** Zkontrolujte oprávnění v Appwrite konzoli.

**Řešení:**
1. Otevřete Appwrite Console
2. Jděte do Database → Collections → metrics
3. V Settings → Permissions přidejte:
   - Role: Any
   - Permissions: Read, Create, Update

### Q: TMDB API vrací 401
**A:** Neplatný nebo chybějící API klíč.

**Řešení:**
```bash
# Zkontrolujte .env soubor
cat .env | grep TMDB

# Ujistěte se, že používáte Bearer Token (začíná "eyJ...")
# NE API Key (začíná písmeny a čísly)
```

## 🌐 Lokální vývoj

### Q: Jak spustím aplikaci lokálně bez Dockeru?
**A:**
```bash
# 1. Nainstalujte závislosti
npm install

# 2. Vytvořte .env.local soubor
# 3. Spusťte dev server
npm run dev

# Aplikace bude na http://localhost:5173
```

### Q: Hot reload nefunguje v Dockeru
**A:** Docker kontejner nepoužívá hot reload, je to produkční build.

**Řešení:**
Pro vývoj používejte `npm run dev` lokálně, ne Docker.
Docker je určen pro testování produkčního buildu.

### Q: Změny v kódu se neprojevují
**A:** Musíte rebuild Docker image.

**Řešení:**
```bash
docker-compose down
docker-compose up --build
```

## 📦 Build a deployment

### Q: Jak vytvořím produkční build?
**A:**
```bash
# Lokální build
npm run build

# Výstup bude v dist/ složce
# Nebo použijte Docker pro kompletní produkční setup
docker-compose up --build
```

### Q: Jak nasadím na server?
**A:** Několik možností:

**1. Docker na VPS:**
```bash
# Na serveru
git clone <repo>
cd JSM-MOVIE-APP
# Vytvořte .env s vašimi klíči
docker-compose up -d
```

**2. Vercel/Netlify:**
```bash
# Build command: npm run build
# Output directory: dist
# Environment variables: Nastavte v dashboard
```

**3. Docker Hub:**
```bash
# Push image na Docker Hub
docker tag jsm-movie-app-movie-app username/movie-app:latest
docker push username/movie-app:latest

# Na serveru
docker pull username/movie-app:latest
docker run -p 80:80 username/movie-app:latest
```

## 🔧 Debugging

### Q: Jak vidím console.log v Dockeru?
**A:**
```bash
# Zobrazit logy kontejneru
docker-compose logs -f

# Nebo otevřete aplikaci v prohlížeči a použijte DevTools (F12)
```

### Q: Jak zkontroluju, co je uvnitř Docker image?
**A:**
```bash
# Vstupte do běžícího kontejneru
docker exec -it jsm-movie-app sh

# Zkontrolujte soubory
ls -la /usr/share/nginx/html/
cat /usr/share/nginx/html/index.html

# Zkontrolujte nginx config
cat /etc/nginx/nginx.conf

# Odejděte
exit
```

### Q: Aplikace načítá nekonečně dlouho
**A:** Zkontrolujte network requesty v DevTools.

**Možné příčiny:**
1. TMDB API klíč je neplatný
2. Appwrite endpoint je špatný
3. CORS problémy (mělo by být OK s Appwrite Cloud)

### Q: Obrázky filmů se nenačítají
**A:** TMDB API vrací relativní cesty k obrázkům.

**Řešení:**
Zkontrolujte, že v kódu používáte:
```javascript
`https://image.tmdb.org/t/p/w500${movie.poster_path}`
```

## 🔒 Bezpečnost

### Q: Je bezpečné commitovat .env soubor?
**A:** **NE! NIKDY!**

.env soubor obsahuje citlivé API klíče a měl by být v .gitignore.
Používejte .env.example jako šablonu.

### Q: Jak sdílím projekt s týmem?
**A:**
1. Commitujte .env.example (bez skutečných hodnot)
2. Každý člen týmu si vytvoří vlastní .env
3. Pro produkci použijte secrets management (GitHub Secrets, AWS Secrets Manager, atd.)

### Q: Někdo vidí moje API klíče v buildu?
**A:** V produkčním buildu jsou API klíče "zapečené" do JavaScript souborů.

**Bezpečnější řešení:**
- Pro citlivé operace použijte backend API
- TMDB a Appwrite klíče jsou relativně bezpečné pro frontend (mají rate limiting)
- Pro produkci zvažte proxy server

## 📱 Kompatibilita

### Q: Funguje aplikace na mobilu?
**A:** Ano, aplikace je responzivní díky Tailwind CSS.

### Q: Které prohlížeče jsou podporované?
**A:** Všechny moderní prohlížeče:
- Chrome/Edge (doporučeno)
- Firefox
- Safari
- Opera

### Q: Funguje to na Windows/Mac/Linux?
**A:** Ano, Docker funguje na všech platformách.

## 💡 Tipy a triky

### Q: Jak zrychlit Docker build?
**A:**
```dockerfile
# Používejte .dockerignore
# Kopírujte package.json před zbytkem kódu (již implementováno)
# Používejte multi-stage build (již implementováno)
```

### Q: Jak snížit velikost Docker image?
**A:**
Již používáme optimalizace:
- Alpine Linux (malý base image)
- Multi-stage build (pouze produkční soubory)
- Nginx místo Node.js serveru

Aktuální velikost: ~50MB

### Q: Mohu použít jiný port než 8080?
**A:** Ano, změňte v docker-compose.yml:
```yaml
ports:
  - "3000:80"  # Vaše aplikace bude na localhost:3000
```

## 🆘 Stále nefunguje?

Pokud žádné z těchto řešení nepomohlo:

1. **Zkontrolujte logy:**
   ```bash
   docker-compose logs -f
   ```

2. **Rebuild bez cache:**
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

3. **Vyčistěte Docker:**
   ```bash
   docker system prune -a
   docker-compose up --build
   ```

4. **Zkontrolujte .env soubor:**
   ```bash
   cat .env
   # Ujistěte se, že všechny hodnoty jsou vyplněné
   ```

5. **Otevřete issue na GitHubu** s:
   - Popisem problému
   - Logy z `docker-compose logs`
   - Screenshot chyby
   - Vaše prostředí (OS, Docker verze)
