export type ResourceResponseHandler = (params?: Record<string, unknown>) => readonly [number, unknown];

export type ResourceDescriptor = {
  readonly path: string;
  readonly permission?: string;
  get?: ResourceResponseHandler;
  post?: ResourceResponseHandler;
  put?: ResourceResponseHandler;
  patch?: ResourceResponseHandler;
  delete?: ResourceResponseHandler;
};

type HasOnlyRecordValues<T extends {}> = false extends {
  [K in keyof T]: T[K] extends Record<string, any> ? true : false;
}[keyof T]
  ? false
  : true;

type IsResourceDescriptor<T extends {}> = "path" extends keyof T
  ? string extends T["path"]
    ? true
    : false
  : false;

export type NestedMocks<T extends {}> = {
  readonly [K in keyof T]: true extends HasOnlyRecordValues<T[K]>
    ? NestedMocks<T[K]>
    : true extends IsResourceDescriptor<T[K]>
      ? ResourceDescriptor
      : never
};
