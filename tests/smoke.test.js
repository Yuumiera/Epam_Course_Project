beforeEach(async () => {
    jest.resetModules();
    process.env.NODE_ENV = 'test';
    process.env.DATABASE_URL = 'file:./test.db';
    global.prisma = undefined;
});
test("smoke", () => {
  expect(1 + 1).toBe(2);
});