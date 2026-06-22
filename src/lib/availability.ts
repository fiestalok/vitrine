/** Returns how many of a product's articles are not in the reserved set. */
export function countAvailable(articleIds: number[], reserved: Set<number>): number {
  return articleIds.filter((id) => !reserved.has(id)).length;
}
