type MapLimitType = <T, R>(arr: Array<T>, limit: number, func: (arg: T) => Promise<R>) => Promise<R[]>


export const mapLimit: MapLimitType = async (arr, limit = 5, func) => {
  const results = []

  for (let i = 0; i < arr.length; i = i + 5) {
    const promises = arr.slice(i, i + limit).map(p => func(p))
    results.push(...await Promise.all(promises))
  }

  return results;
}