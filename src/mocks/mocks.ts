import { NestedMocks } from './types'

export const OK = 200;
export const FORBIDDEN = 403;
export const NOT_FOUND = 404;
export const INTERNAL_ERROR = 500;

const mocks = {
  transactions: {
    getAll: {
      path: "/boapi/user/:id/transactions",
      permission: "user.transactions.list.get",
      get: () => [OK, []] as const,
    },
  },
};

export type ApiMocks = NestedMocks<typeof mocks>;
export const apiMocks: ApiMocks = mocks;
