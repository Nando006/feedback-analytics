import type express from 'express';

type TypedErrorPayload<
  TError extends string,
  TMeta extends Record<string, unknown> | undefined,
> = (TMeta extends Record<string, unknown> ? TMeta : {}) & { error: TError };

export function sendTypedError<
  TError extends string,
  TMeta extends Record<string, unknown> | undefined = undefined,
>(
  res: express.Response,
  status: number,
  error: TError,
  meta?: TMeta,
) {
  if (meta) {
    const payload = { ...meta, error } as TypedErrorPayload<TError, TMeta>;
    return res.status(status).json(payload);
  }

  const payload = { error } as TypedErrorPayload<TError, TMeta>;
  return res.status(status).json(payload);
}
