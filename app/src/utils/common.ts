/* eslint-disable @typescript-eslint/no-unsafe-assignment */
export function mergeObjects(obj1: Record<string, any>, obj2: Record<string, any>) {
  const result = { ...obj1 };

  for (const key in obj2) {
    if (obj2.hasOwnProperty(key) && obj2[key] !== null) {
      result[key] = obj2[key];
    }
  }

  return result;
}