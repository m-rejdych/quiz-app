const replace = <T, U>(value: T, replaceValue: U): T | U => {
  if (typeof value !== 'object' || !value) return value;

  if (Array.isArray(value)) {
    return value.reduce((acc, item) => {
      return [
        ...acc,
        item === undefined ? replaceValue : replace(item, replaceValue),
      ];
    }, []);
  }

  const copy = { ...value };

  Object.entries(value).forEach(([key, objValue]) => {
    copy[key as keyof typeof copy] =
      objValue === undefined ? replaceValue : replace(objValue, replaceValue);
  });

  return copy;
};

export const replaceUndefined = <T extends object, U>(
  obj: T,
  replaceValue: U,
): T => {
  const result = replace(obj, replaceValue);

  return result as T;
};
