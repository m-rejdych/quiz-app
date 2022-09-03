export const isDuplicated =
  <T extends object>(key: keyof T) =>
  (item: T, index: number, self: T[]) =>
    self.some(
      (otherItem, otherIndex) =>
        item[key] === otherItem[key] && index !== otherIndex,
    );
