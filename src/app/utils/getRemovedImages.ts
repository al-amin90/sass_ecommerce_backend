export const getRemovedImages = (
  existingInDB: string[],
  keptByClient: string[],
): string[] => {
  const keptSet = new Set(keptByClient);
  console.log("keptSet", keptSet);
  return existingInDB.filter((url) => !keptSet.has(url));
};
