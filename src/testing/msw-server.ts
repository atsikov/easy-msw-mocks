import { RequestHandler, rest } from "msw";
import { setupServer } from "msw/node";
import { apiMocks, ApiMocks, INTERNAL_ERROR } from "../mocks/mocks";
import { NestedMocks, ResourceDescriptor } from "../mocks/types";

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"] as const;

function isResourceDescriptor(value: unknown): value is ResourceDescriptor {
  return (
    typeof value === "object" &&
    !!value &&
    !Array.isArray(value) &&
    "path" in value &&
    typeof (value as { path: unknown }).path === "string"
  );
}

function collectResourceDescriptors(
  mocks: NestedMocks<any>
): ResourceDescriptor[] {
  const descriptors: ResourceDescriptor[] = [];

  Object.values(mocks).forEach((value) => {
    if (isResourceDescriptor(value)) {
      descriptors.push(value);
    } else {
      descriptors.push(...collectResourceDescriptors(value));
    }
  });

  return descriptors;
}

function isPrimitiveValue(value: unknown): boolean {
  return (
    typeof value === "boolean" ||
    typeof value === "number" ||
    typeof value === "string"
  );
}

function createRequestHandlers(mocks: ApiMocks) {
  const descriptors = collectResourceDescriptors(mocks);

  return descriptors
    .map((descriptor) =>
      HTTP_METHODS.reduce<RequestHandler[]>((acc, method) => {
        if (descriptor[method]) {
          acc.push(
            rest[method](`*${descriptor.path}`, (req, res, ctx) => {
              const [status, body] = descriptor[method]!(req.params);
              return res(
                ctx.status(status),
                isPrimitiveValue(body) ? ctx.text(String(body)) : ctx.json(body)
              );
            })
          );
        }

        return acc;
      }, [])
    )
    .flat()
    .concat(HTTP_METHODS.map(method => rest[method]('*', (req, res, ctx) => res(
      ctx.status(INTERNAL_ERROR),
      ctx.text(`${req.method.toUpperCase()} ${req.url.pathname}: unknown request. Please check if mock is provided.`)
    ))));
}

export function initMSW() {
  const server = setupServer(...createRequestHandlers(apiMocks));

  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
}
