import { z } from 'zod';

const FIELD_COUNT = 30;

export const fieldNames: string[] = Array.from(
  { length: FIELD_COUNT },
  (_, index) => `field${index + 1}`,
);

export const fields = fieldNames.map((name, index) => ({
  name,
  placeholder: `Field ${index + 1}`,
}));

const MIN_LENGTH = 3;

/** Every field is required, so all thirty take part in validation and in errors. */
const shape: Record<string, z.ZodType<string, string>> = Object.fromEntries(
  fieldNames.map((name, index) => [
    name,
    z.string().min(MIN_LENGTH, `Field ${index + 1} must be at least ${MIN_LENGTH} characters`),
  ]),
);

export type FormData = Record<string, string>;

export const formSchema: z.ZodType<FormData, FormData> = z.object(shape);

export const initialValues: FormData = Object.fromEntries(fieldNames.map((name) => [name, '']));
