import { z } from "zod";

export const taskStatusSchema = z.enum(["pending", "in_progress", "completed"]);
export const taskPrioritySchema = z.enum(["low", "medium", "high"]);
export const taskSortBySchema = z.enum(["due_date", "priority", "created_at"]);
export const taskSortOrderSchema = z.enum(["asc", "desc"]);

export const taskFiltersSchema = z.object({
  status: z.union([taskStatusSchema, z.literal("")]).optional(),
  priority: z.union([taskPrioritySchema, z.literal("")]).optional(),
  search: z.string().trim().max(160).optional(),
  sortBy: taskSortBySchema.optional(),
  sortOrder: taskSortOrderSchema.optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const taskCreateSchema = z.object({
  title: z.string().trim().min(3).max(160),
  description: z.string().trim().max(2000).optional(),
  status: taskStatusSchema.default("pending"),
  priority: taskPrioritySchema.default("medium"),
  due_date: z.string().datetime().nullable().optional(),
});

export const taskFormSchema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters.").max(160),
  description: z
    .string()
    .trim()
    .max(2000, "Description must be 2000 characters or fewer.")
    .optional()
    .or(z.literal("")),
  status: taskStatusSchema,
  priority: taskPrioritySchema,
  due_date: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || !Number.isNaN(new Date(value).getTime()), {
      message: "Due date must be a valid date and time.",
    }),
});

export type TaskFormValues = z.infer<typeof taskFormSchema>;
