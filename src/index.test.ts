import { apiMocks } from "./mocks/mocks"

describe('msw', () => {
  it('should return default mocked response', async () => {
    const response = await fetch('https://google.com/boapi/user/:id/transactions').then(res => res.json())
    expect(response).toEqual([])
  })

  it('should return error for unknown path', async () => {
    const status = await fetch('https://google.com/boapi/user/transactions').then(res => res.status)
    expect(status).toEqual(500)
  })

  it('should return overridden result', async () => {
    apiMocks.transactions.getAll.get = (params) => [200, [{ owner: params?.id }]]

    const response = await fetch('https://google.com/boapi/user/user-id/transactions').then(res => res.json())
    expect(response).toEqual([{ owner: 'user-id' }])
  })
})