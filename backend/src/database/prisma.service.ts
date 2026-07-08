import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma, PrismaClient } from "@prisma/client";

function positiveNumberFromEnv(name: string, fallback: number) {
  const raw = process.env[name];
  if (!raw) return fallback;

  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function currentConnectionLimit() {
  return positiveNumberFromEnv("PRISMA_CONNECTION_LIMIT", 5);
}

function currentQueryConcurrency() {
  const connectionLimit = currentConnectionLimit();
  const configured = positiveNumberFromEnv(
    "DB_QUERY_CONCURRENCY",
    connectionLimit,
  );
  return Math.min(configured, connectionLimit);
}

function buildRuntimeDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) return undefined;

  try {
    const url = new URL(rawUrl);
    const isPostgres =
      url.protocol === "postgresql:" || url.protocol === "postgres:";
    if (!isPostgres) return rawUrl;

    const connectionLimit = process.env.PRISMA_CONNECTION_LIMIT;
    if (connectionLimit || !url.searchParams.has("connection_limit")) {
      url.searchParams.set(
        "connection_limit",
        connectionLimit || String(currentConnectionLimit()),
      );
    }

    const poolTimeout = process.env.PRISMA_POOL_TIMEOUT;
    if (poolTimeout || !url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", poolTimeout || "60");
    }

    const connectTimeout = process.env.PRISMA_CONNECT_TIMEOUT;
    if (connectTimeout || !url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", connectTimeout || "30");
    }

    const isSupabasePooler =
      url.hostname.includes("pooler.supabase.com") || url.port === "6543";
    if (isSupabasePooler && !url.searchParams.has("pgbouncer")) {
      url.searchParams.set("pgbouncer", "true");
    }

    return url.toString();
  } catch {
    return rawUrl;
  }
}

function buildPrismaClientOptions(): Prisma.PrismaClientOptions {
  const url = buildRuntimeDatabaseUrl();
  return {
    ...(url
      ? {
          datasources: {
            db: { url },
          },
        }
      : {}),
    transactionOptions: {
      maxWait: positiveNumberFromEnv("PRISMA_TRANSACTION_MAX_WAIT_MS", 20000),
      timeout: positiveNumberFromEnv("PRISMA_TRANSACTION_TIMEOUT_MS", 60000),
    },
  };
}

class QuerySemaphore {
  private active = 0;
  private readonly queue: Array<{
    resolve: () => void;
    reject: (error: Error) => void;
    timer: NodeJS.Timeout;
    settled: boolean;
  }> = [];

  constructor(
    private readonly maxActive: number,
    private readonly waitTimeoutMs: number,
  ) {}

  async run<T>(operation: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await operation();
    } finally {
      this.release();
    }
  }

  private acquire(): Promise<void> {
    if (this.active < this.maxActive) {
      this.active += 1;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const waiter = {
        resolve: () => {
          if (waiter.settled) return;
          waiter.settled = true;
          clearTimeout(waiter.timer);
          this.active += 1;
          resolve();
        },
        reject,
        timer: undefined as unknown as NodeJS.Timeout,
        settled: false,
      };

      waiter.timer = setTimeout(() => {
        if (waiter.settled) return;
        waiter.settled = true;

        const index = this.queue.indexOf(waiter);
        if (index >= 0) {
          this.queue.splice(index, 1);
        }
        reject(
          new ServiceUnavailableException(
            "Database is busy. Please retry shortly.",
          ),
        );
      }, this.waitTimeoutMs);

      this.queue.push(waiter);
    });
  }

  private release() {
    this.active = Math.max(0, this.active - 1);
    let next = this.queue.shift();
    while (next?.settled) {
      next = this.queue.shift();
    }
    if (next) {
      next.resolve();
    }
  }
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);
  private readonly queryLimiter = new QuerySemaphore(
    currentQueryConcurrency(),
    positiveNumberFromEnv("DB_QUEUE_TIMEOUT_MS", 30000),
  );

  constructor() {
    super(buildPrismaClientOptions());
    this.registerQueryLimiter();
  }

  private registerQueryLimiter() {
    const client = this as unknown as {
      $use?: (
        middleware: (
          params: any,
          next: (params: any) => Promise<any>,
        ) => Promise<any>,
      ) => void;
    };

    if (typeof client.$use !== "function") {
      this.logger.warn(
        "Prisma middleware is unavailable; DB query concurrency limiter was not registered.",
      );
      return;
    }

    client.$use((params, next) => this.queryLimiter.run(() => next(params)));
  }

  onModuleInit() {
    void this.connectInBackground();
  }

  private async connectInBackground() {
    try {
      await this.$connect();
      this.logger.log("Successfully connected to database.");
    } catch (error) {
      this.logger.warn(
        `Database connection failed on startup: ${error.message}. Prisma will attempt to reconnect lazily on the first query.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
