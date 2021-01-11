import { Repository } from 'typeorm';

//@ts-ignore
export const passwordsRepositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    findOne: jest.fn(entity => entity),
    find: jest.fn(() => null),
    delete: jest.fn((entity) => entity),
    save: jest.fn(entity => entity)
    // ...
}));

export type MockType<T> = {
    [P in keyof T]: jest.Mock<{}>;
};