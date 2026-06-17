# Deployment Guide: Quita Backend on Railway

This document details the configuration requirements and deployment steps to deploy the Quita backend (`quita-api`) to the Railway platform.

## Required Environment Variables

When deploying the service on Railway, you must configure the following environment variables:

| Variable Name | Description | Example / Recommended Value |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Active spring profile. Must be set to `prod` to use cloud configuration. | `prod` |
| `JWT_SECRET` | Strong secret key for JWT signing. Must be at least 64 hex characters (256-bit). | *[Generate a random 64-character hex string]* |
| `SPRING_DATASOURCE_URL` | JDBC URL for the PostgreSQL database (provided automatically by Railway if postgres is attached). | `jdbc:postgresql://<railway-db-host>:<port>/railway` |
| `SPRING_DATASOURCE_USERNAME`| Username for the PostgreSQL database. | `postgres` |
| `SPRING_DATASOURCE_PASSWORD`| Password for the PostgreSQL database. | *[Railway database password]* |
| `PORT` | Port number. Railway injects this dynamically, and the app is preconfigured to bind to it. | *[Dynamically injected by Railway]* |
| `GEMINI_API_KEY` | (Optional) Google Gemini API Key for Complaint Engine. | *[Your API Key]* |
| `OPENAI_API_KEY` | (Optional) OpenAI API Key (if using OpenAI provider). | *[Your API Key]* |
| `OLLAMA_URL` | (Optional) URL to access local/cloud Ollama service (default is http://localhost:11434/api/generate). | `http://<ollama-service>:11434/api/generate` |
| `UPLOAD_DIR` | Directory to save files. Set to `/tmp` on Railway since files are deleted immediately after processing. | `/tmp` |

## Deployment Steps

1. **Prerequisites**: Ensure the Quita repository is pushed to a remote Git hosting service (e.g. GitHub).
2. **Create a Railway Project**:
   - Log in to your [Railway Dashboard](https://railway.app/).
   - Click on **New Project** -> **Deploy from GitHub repo**.
   - Select the repository containing the Quita code.
3. **Configure the Service Root**:
   - In the service configuration, navigate to **Settings** -> **Build**.
   - Set the **Root Directory** to `quita-api`.
   - Railway will automatically detect the `pom.xml`, Maven wrapper, Java 21, and build the JAR using `mvn clean package`.
4. **Provision PostgreSQL**:
   - Click on **New** (or use CMD+K) -> **Database** -> **Add PostgreSQL**.
   - Railway will automatically generate environment variables like `PORT`, `DATABASE_URL`, `PGPASSWORD`, `PGUSER`, `PGDATABASE`.
5. **Reference DB Credentials**:
   - Railway injects `DATABASE_URL` (in format `postgresql://...`). Spring Boot requires `jdbc:postgresql://...`.
   - You can map `SPRING_DATASOURCE_URL` to reference Railway variables dynamically:
     ```
     SPRING_DATASOURCE_URL = jdbc:postgresql://${{Postgres.DATABASE_HOST}}:${{Postgres.DATABASE_PORT}}/${{Postgres.DATABASE_NAME}}
     SPRING_DATASOURCE_USERNAME = ${{Postgres.DATABASE_USER}}
     SPRING_DATASOURCE_PASSWORD = ${{Postgres.DATABASE_PASSWORD}}
     ```
6. **Add Other Variables**:
   - Go to the backend service -> **Variables**.
   - Add `SPRING_PROFILES_ACTIVE = prod`
   - Add `JWT_SECRET` (generate a secure random 256-bit key). **Placeholders are not accepted and will crash the app.**
   - Add `GEMINI_API_KEY` (and other optional LLM environment variables). **If provider is GEMINI and mock is false, this is strictly validated.**
   - Add `UPLOAD_DIR = /tmp`
7. **Deploy and Validate**:
   - Railway will trigger a build and deploy.
   - Once deployed, verify that the health check endpoint responds successfully:
     - Endpoint: `https://<your-railway-app-url>/actuator/health`
     - Response: `{"status": "UP"}`

## Startup Validation

To prevent silent errors or misconfigured production instances, the backend enforces configuration hardening rules when running under the `prod` profile.

### Mandatory Environment Variables
The application will **abort startup immediately** if any of these variables are null, empty, or contain known placeholders (like `your_`, `YOUR_`, `change-me`, `replace-me`, `example`):
- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`

Additionally, if `QUITA_LLM_PROVIDER` is set to `GEMINI` (default) and `QUITA_LLM_MOCK` is set to `false`, the app enforces that `GEMINI_API_KEY` is present and does not contain placeholders.

### Diagnosing Startup Failures
If any required variable is missing or misconfigured, the build logs on Railway will show a block like this:

```text
=======================================================================
  APPLICATION STARTUP FAILED: Missing Required Environment Variables
=======================================================================
  The following configurations are invalid for the 'prod' profile:
  - JWT_SECRET: Missing or contains invalid placeholder value.
=======================================================================
```

Followed by an `IllegalStateException` that terminates the process. Check the service **Deploy Logs** in the Railway dashboard to identify which variable is causing the failure.

