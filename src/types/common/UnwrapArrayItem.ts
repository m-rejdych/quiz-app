type UnwrapArrayItem<T> = T extends (infer U)[] ? U : never;

export default UnwrapArrayItem;
