/**
 * Shared IP rate limiter: public health and artifact routes, and token refresh.
 */
import "dotenv/config";

import fs from "fs/promises";
import path from "path";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import { createIpRateLimiter, RATE_LIMITS } from "../middlewares/rateLimit";
import { createUserRoutes } from "../routes/userRoutes";
import { Role, UserStore, UserWithPasswordHash } from "../types";
import { run } from "../syncServer";
import { SyncServerInstance } from "../types";
import { getConnectionString, ensureDatabaseExists, describeIfPostgres } from "./helpers/testDb";

function buildUserStore(): jest.Mocked<UserStore> {
  const user: UserWithPasswordHash = {
    id: 1,
    email: "admin@example.com",
    passwordHash: "ignored",
    role: Role.ADMIN,
    tenantIds: [],
    roleAssignments: [],
  };
  return {
    initialize: jest.fn(),
    getAllUsers: jest.fn().mockResolvedValue([]),
    saveUser: jest.fn().mockResolvedValue(undefined),
    getUser: jest.fn().mockResolvedValue(user),
    getUserById: jest.fn().mockResolvedValue(user),
    updateUser: jest.fn().mockResolvedValue(undefined),
    deleteUser: jest.fn(),
    hasAtLeastOneAdmin: jest.fn().mockResolvedValue(true),
    clearStore: jest.fn(),
    closeConnection: jest.fn(),
  } as jest.Mocked<UserStore>;
}

describe("createIpRateLimiter", () => {
  const previous = process.env.RATE_LIMIT_ENFORCE;

  afterEach(() => {
    if (previous === undefined) {
      delete process.env.RATE_LIMIT_ENFORCE;
    } else {
      process.env.RATE_LIMIT_ENFORCE = previous;
    }
  });

  function appWithLimit(limit: number): express.Express {
    const app = express();
    app.get("/limited", createIpRateLimiter({ limit, windowMs: 60_000 }), (_req, res) => {
      res.json({ ok: true });
    });
    return app;
  }

  it("keeps the configured limit when RATE_LIMIT_ENFORCE=1", async () => {
    process.env.RATE_LIMIT_ENFORCE = "1";
    const app = appWithLimit(2);
    expect((await request(app).get("/limited")).status).toBe(200);
    expect((await request(app).get("/limited")).status).toBe(200);
    const blocked = await request(app).get("/limited");
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe("Too many requests, please try again later");
  });

  it("raises the ceiling under Jest when enforcement is off", async () => {
    delete process.env.RATE_LIMIT_ENFORCE;
    const app = appWithLimit(2);
    for (let i = 0; i < 5; i++) {
      expect((await request(app).get("/limited")).status).toBe(200);
    }
  });
});

describe("POST /api/users/refresh rate limit", () => {
  const previous = process.env.RATE_LIMIT_ENFORCE;

  beforeAll(() => {
    process.env.JWT_SECRET = "refresh-rate-limit-test-secret-32chars";
    process.env.RATE_LIMIT_ENFORCE = "1";
  });

  afterAll(() => {
    if (previous === undefined) {
      delete process.env.RATE_LIMIT_ENFORCE;
    } else {
      process.env.RATE_LIMIT_ENFORCE = previous;
    }
  });

  it("rejects further refresh attempts after the configured limit", async () => {
    const app = express();
    app.use(bodyParser.json());
    app.use("/api/users", createUserRoutes(buildUserStore()));

    let blocked = false;
    for (let i = 0; i < RATE_LIMITS.refresh.limit + 1; i++) {
      const response = await request(app).post("/api/users/refresh").send({});
      if (response.status === 429) {
        blocked = true;
        expect(response.body.error).toMatch(/refresh/i);
        break;
      }
      expect(response.status).toBe(401);
    }
    expect(blocked).toBe(true);
  });
});

const postgresUrl = getConnectionString("shared_ratelimit");

describeIfPostgres("public route rate limits (live)", () => {
  let app: SyncServerInstance;
  const previous = process.env.RATE_LIMIT_ENFORCE;

  beforeAll(async () => {
    process.env.JWT_SECRET = "shared-ratelimit-test-secret-32-characters";
    process.env.RATE_LIMIT_ENFORCE = "1";
    delete process.env.TRUST_PROXY;
    await ensureDatabaseExists(postgresUrl);
    app = await run({
      port: 0,
      adminPassword: "AdminRate123!",
      adminEmail: "admin-shared-ratelimit@example.com",
      postgresUrl,
    });
  });

  afterAll(async () => {
    if (previous === undefined) {
      delete process.env.RATE_LIMIT_ENFORCE;
    } else {
      process.env.RATE_LIMIT_ENFORCE = previous;
    }
    if (app) {
      await app.clearStore();
      await app.closeConnection();
    }
  });

  async function expectEventuallyLimited(path: string, limit: number): Promise<void> {
    let blocked = false;
    for (let i = 0; i < limit + 1; i++) {
      const response = await request(app.httpServer).get(path);
      if (response.status === 429) {
        blocked = true;
        expect(response.body.error).toBe("Too many requests, please try again later");
        break;
      }
    }
    expect(blocked).toBe(true);
  }

  it("limits GET /health", async () => {
    await expectEventuallyLimited("/health", RATE_LIMITS.health.limit);
  });

  it("limits an artifact file that already exists on disk", async () => {
    const artifactsDir = path.join(__dirname, "../public/artifacts");
    const filePath = path.join(artifactsDir, "rate-limit-existing.json");
    await fs.mkdir(artifactsDir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify({ ok: true }));
    try {
      let sawFile = false;
      let blocked = false;
      for (let i = 0; i < RATE_LIMITS.artifacts.limit + 1; i++) {
        const response = await request(app.httpServer).get("/artifacts/rate-limit-existing.json");
        if (response.status === 200) {
          sawFile = true;
          expect(response.body).toEqual({ ok: true });
        }
        if (response.status === 429) {
          blocked = true;
          expect(response.body.error).toBe("Too many requests, please try again later");
          break;
        }
      }
      expect(sawFile).toBe(true);
      expect(blocked).toBe(true);
      const png = await request(app.httpServer).get("/artifacts/missing.png");
      expect(png.status).toBe(429);
    } finally {
      await fs.unlink(filePath).catch(() => {});
    }
  });
});
