import { z } from "zod";
import type { ApiResponse, ApiError } from "./types";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RequestConfig<TBody = unknown> {
  method?: HttpMethod;
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean | undefined>;
  body?: TBody;
  signal?: AbortSignal;
  cache?: RequestCache;
}

export type RequestInterceptor = (
  config: RequestConfig
) => RequestConfig | Promise<RequestConfig>;

export type ResponseInterceptor = <T>(
  response: Response,
  data: T
) => T | Promise<T>;

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, unknown>;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.statusCode = error.statusCode;
    this.details = error.details;
  }
}

export class EnterpriseApiClient {
  private readonly baseUrl: string;
  private readonly requestInterceptors: RequestInterceptor[] = [];
  private readonly responseInterceptors: ResponseInterceptor[] = [];

  constructor(baseUrl: string = "") {
    this.baseUrl = baseUrl;
    this.setupDefaultInterceptors();
  }

  private setupDefaultInterceptors(): void {
    // Inject headers and trace ID
    this.useRequestInterceptor((config) => {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        "X-Request-Trace-Id": `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        ...config.headers,
      };
      return { ...config, headers };
    });

    // Logging & Telemetry hook
    this.useResponseInterceptor((response, data) => {
      if (process.env.NODE_ENV === "development") {
        // High-density enterprise telemetry logging
        const traceId = response.headers.get("X-Request-Trace-Id") ?? "local";
        if (!response.ok) {
          console.warn(`[API Telemetry] [FAIL] status=${response.status} trace=${traceId}`);
        }
      }
      return data;
    });
  }

  public useRequestInterceptor(interceptor: RequestInterceptor): void {
    this.requestInterceptors.push(interceptor);
  }

  public useResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.responseInterceptors.push(interceptor);
  }

  public async request<TOutput, TSchema extends z.ZodType<TOutput> = z.ZodType<TOutput>>(
    endpoint: string,
    schema?: TSchema,
    config: RequestConfig = {}
  ): Promise<TOutput> {
    let finalConfig: RequestConfig = { ...config, method: config.method ?? "GET" };

    for (const interceptor of this.requestInterceptors) {
      finalConfig = await interceptor(finalConfig);
    }

    let url = `${this.baseUrl}${endpoint}`;
    if (finalConfig.params) {
      const searchParams = new URLSearchParams();
      Object.entries(finalConfig.params).forEach(([key, val]) => {
        if (val !== undefined) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    const fetchInit: RequestInit = {
      method: finalConfig.method,
      headers: finalConfig.headers,
      signal: finalConfig.signal,
      cache: finalConfig.cache,
    };

    if (finalConfig.body !== undefined && finalConfig.method !== "GET") {
      fetchInit.body = JSON.stringify(finalConfig.body);
    }

    let rawResponse: Response;
    try {
      rawResponse = await fetch(url, fetchInit);
    } catch (err: unknown) {
      throw new ApiClientError({
        code: "NETWORK_FAILURE",
        message: err instanceof Error ? err.message : "Network error occurred",
        statusCode: 0,
      });
    }

    let responseData: unknown;
    try {
      responseData = await rawResponse.json();
    } catch {
      responseData = null;
    }

    if (!rawResponse.ok) {
      const errPayload = responseData as { error?: string; message?: string } | null;
      throw new ApiClientError({
        code: `HTTP_${rawResponse.status}`,
        message: errPayload?.error ?? errPayload?.message ?? `Request failed with status ${rawResponse.status}`,
        statusCode: rawResponse.status,
      });
    }

    let parsedData = responseData;
    for (const interceptor of this.responseInterceptors) {
      parsedData = await interceptor(rawResponse, parsedData);
    }

    if (schema) {
      const validationResult = schema.safeParse(parsedData);
      if (!validationResult.success) {
        throw new ApiClientError({
          code: "SCHEMA_VALIDATION_ERROR",
          message: "API response failed schema validation",
          statusCode: 422,
          details: { issues: validationResult.error.issues },
        });
      }
      return validationResult.data;
    }

    return parsedData as TOutput;
  }

  public get<TOutput, TSchema extends z.ZodType<TOutput> = z.ZodType<TOutput>>(
    endpoint: string,
    schema?: TSchema,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<TOutput> {
    return this.request(endpoint, schema, { ...config, method: "GET" });
  }

  public post<TOutput, TBody = unknown, TSchema extends z.ZodType<TOutput> = z.ZodType<TOutput>>(
    endpoint: string,
    body: TBody,
    schema?: TSchema,
    config?: Omit<RequestConfig, "method" | "body">
  ): Promise<TOutput> {
    return this.request(endpoint, schema, { ...config, method: "POST", body });
  }
}

export const apiClient = new EnterpriseApiClient();
