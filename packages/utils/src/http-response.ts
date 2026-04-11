import type { Response } from "express";

export function ok<T>(res: Response, data: T, message?: string) {
  return res.json({ data, ...(message && { message }) });
}

export function created<T>(res: Response, data: T, message = "Created successfully") {
  return res.status(201).json({ data, message });
}

export function paginated<T>(
  res: Response,
  data: T[],
  page: number,
  total: number,
  limit = 20,
) {
  return res.json({
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  });
}

export function noContent(res: Response) {
  return res.status(204).send();
}
