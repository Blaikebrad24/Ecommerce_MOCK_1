import { unstable_cache as nextCache } from "next/cache";
import { cache as reactCache } from "react"

//just want a function that returns something
type Callback =(...args: any[]) => Promise<any>

// alleviates the need to wrapping requests with both cache systems
export function cache<T extends Callback>(cb : T, keyParts: string[], options: {revalidate?: number | false; tags?: string[]} = {})
{
    return nextCache(reactCache(cb),keyParts, options) // cache using react first then cache using Next with keyparts/options
}