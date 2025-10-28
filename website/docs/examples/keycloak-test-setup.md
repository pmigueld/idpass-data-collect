# Keycloak Test Setup Guide

This guide provides instructions for setting up Keycloak for testing ID PASS DataCollect authentication features.

## Option A: Docker Setup (Recommended)

### Prerequisites
- Docker installed and running

### Quick Start

```bash
docker run -p 8080:8080 \
  -e KC_BOOTSTRAP_ADMIN_USERNAME=admin \
  -e KC_BOOTSTRAP_ADMIN_PASSWORD=admin \
  --name idpass-keycloak \
  quay.io/keycloak/keycloak:26.0.0 start-dev
```

### Access Admin Console
- URL: http://localhost:8080
- Username: `admin`
- Password: `admin`

## Option B: Docker Compose (Persistent Setup)

### Start Keycloak with PostgreSQL

```bash
cd docker/keycloak
docker-compose -f docker-compose.keycloak.yaml up -d
```

This starts:
- Keycloak on port 8080
- PostgreSQL database for Keycloak persistence

### Stop Keycloak

```bash
cd docker/keycloak
docker-compose -f docker-compose.keycloak.yaml down
```

## Option C: Non-Docker Setup

### Prerequisites
- Java 17 or later
- `JAVA_HOME` environment variable set

### Steps

1. Download Keycloak:
```bash
wget https://github.com/keycloak/keycloak/releases/download/26.0.0/keycloak-26.0.0.tar.gz
tar -xzf keycloak-26.0.0.tar.gz
cd keycloak-26.0.0
```

2. Start Keycloak:
```bash
export KEYCLOAK_ADMIN=admin
export KEYCLOAK_ADMIN_PASSWORD=admin
bin/kc.sh start-dev
```

3. Access at http://localhost:8080

## Keycloak Configuration for Testing

### 1. Create Test Realm

1. Click **"Create Realm"** button
2. Name: `idpass-test`
3. Click **"Create"**

### 2. Create Test Client

1. Navigate to: **Clients** → **Create client**
2. Configure:
   - Client ID: `idpass-datacollect`
   - Client type: `OpenID Connect`
   - Click **Next**
3. Capability config:
   - Client authentication: `OFF` (public client)
   - Click **Next**
4. Login settings:
   - Valid redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
   - Click **Save**

### 3. Enable Direct Access Grants

For username/password authentication to work:

1. Go to your client (`idpass-datacollect`)
2. Click **Settings** tab
3. Scroll to **Advanced** section
4. Find **Direct access grants** and ensure it's **enabled**
5. Click **Save**

### 4. Create Test Users

#### User 1: Field Worker

1. Navigate to: **Users** → **Add user**
2. Fill in:
   - Username: `fieldworker`
   - Email: `field@example.com`
   - First name: `Field`
   - Last name: `Worker`
   - Email verified: `ON`
3. Click **Create**
4. Go to **Credentials** tab
5. Click **Set password**
   - Password: `test123`
   - Temporary: `OFF`
6. Click **Save**

#### User 2: Data Admin

1. Navigate to: **Users** → **Add user**
2. Fill in:
   - Username: `dataadmin`
   - Email: `admin@example.com`
   - First name: `Data`
   - Last name: `Admin`
   - Email verified: `ON`
3. Click **Create**
4. Go to **Credentials** tab
5. Click **Set password**
   - Password: `admin123`
   - Temporary: `OFF`
6. Click **Save**

### 5. Get Realm Configuration

1. Navigate to: **Realm settings** → **General**
2. Note the **OpenID Endpoint Configuration** link
3. Authority URL: `http://localhost:8080/realms/idpass-test`

## Testing Authentication

### Get Access Token

```bash
curl -X POST http://localhost:8080/realms/idpass-test/protocol/openid-connect/token \
  -H "Content-Type: application/x-form-urlencoded" \
  -d "grant_type=password" \
  -d "client_id=idpass-datacollect" \
  -d "username=fieldworker" \
  -d "password=test123"
```

### Validate Token

```bash
TOKEN="your-access-token-here"

curl -X GET http://localhost:8080/realms/idpass-test/protocol/openid-connect/userinfo \
  -H "Authorization: Bearer $TOKEN"
```

## ID PASS DataCollect Configuration

Configure your app to use Keycloak:

```json
{
  "id": "default",
  "name": "Test App",
  "authConfigs": [
    {
      "type": "keycloak",
      "fields": {
        "authority": "http://localhost:8080/realms/idpass-test",
        "client_id": "idpass-datacollect",
        "redirect_uri": "http://localhost:3000/callback",
        "scope": "openid profile email"
      }
    }
  ]
}
```

## Troubleshooting

### Port Already in Use

If port 8080 is already in use, modify the port mapping:

```bash
docker run -p 8081:8080 ...
```

Then use `http://localhost:8081` instead.

### Direct Access Grants Not Working

Ensure that:
1. Client has **Direct access grants** enabled in settings
2. User credentials are set with **Temporary** = OFF
3. Client authentication is OFF for public clients

### Connection Refused

Ensure Keycloak is fully started:

```bash
docker logs idpass-keycloak
```

Wait for the message: "Listening on: http://0.0.0.0:8080"

## Clean Up

### Docker

```bash
docker stop idpass-keycloak
docker rm idpass-keycloak
```

### Docker Compose

```bash
cd docker/keycloak
docker-compose -f docker-compose.keycloak.yaml down -v
```

The `-v` flag removes the database volume.

