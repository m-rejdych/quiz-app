type UpdatePayload<T extends string> = {
  [K in T]: string;
} & {
  id?: number;
};

export default UpdatePayload;
