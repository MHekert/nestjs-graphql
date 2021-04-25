export type MockObject<T> = {
  [Property in keyof T]: T[Property] extends (...args: any[]) => any
    ? jest.MockedFunction<T[Property]>
    : T[Property];
};

export type PartialMockObject<T> = Partial<MockObject<T>>;
