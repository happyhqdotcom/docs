import { z } from 'zod'

const nextjsMetadata = z
  .object({
    title: z.string().optional(),
    description: z.string().optional(),
  })
  .optional()

export const baseFrontmatterSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  hidden: z.boolean().optional().default(false),
  lastupdated: z.string().optional(),
  nextjs: z.object({ metadata: nextjsMetadata }).partial().optional(),
})

export const docsFrontmatterSchema = baseFrontmatterSchema

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

export const changelogFrontmatterSchema = baseFrontmatterSchema.extend({
  date: isoDate,
  tags: z.array(z.string()).optional().default([]),
})

export type DocsFrontmatter = z.infer<typeof docsFrontmatterSchema>
export type ChangelogFrontmatter = z.infer<typeof changelogFrontmatterSchema>

export type SurfaceFrontmatter = {
  docs: DocsFrontmatter
  changelog: ChangelogFrontmatter
}

export type Surface = keyof SurfaceFrontmatter

export const frontmatterSchemas: {
  [K in Surface]: typeof baseFrontmatterSchema
} = {
  docs: docsFrontmatterSchema,
  changelog: changelogFrontmatterSchema,
}

export const metaSchema = z.object({
  title: z.string().optional(),
  pages: z.array(z.string()).optional().default([]),
})

export type Meta = z.infer<typeof metaSchema>
