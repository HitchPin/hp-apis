import { z } from "zod"

export const Hi = z.object({ "hello": z.string().optional(), "name": z.boolean().optional() })
export type Hi = z.infer<typeof Hi>
