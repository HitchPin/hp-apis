import { z } from "zod"

export const Hi1 = z.object({ "asdf": z.string().optional(), "3tg": z.number().optional() })
export const Hi2 = z.object({ "hello": z.string().optional(), "name": z.boolean().optional() })

const hI3 = z.union([ Hi1, Hi2 ]);
type HI = z.infer<typeof hI3>;
type Hi2 = HI