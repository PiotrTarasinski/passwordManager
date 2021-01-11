import { Repository } from 'typeorm';

//@ts-ignore
export const addressRepositoryMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    findOne: jest.fn(entity => entity),
    findAll: jest.fn(entity => entity),
    find: jest.fn(() => null),
    delete: jest.fn((entity) => entity),
    save: jest.fn(entity => entity),
    generateHash: jest.fn(hash => hash),
    insert: jest.fn(entity => entity),
    update: jest.fn(entity => entity)
    // ...
}));

//@ts-ignore
export const passwordServiceMockFactory: () => MockType<Repository<any>> = jest.fn(() => ({
    findAll: jest.fn(entity => entity),
    // ...
}));

export type MockType<T> = {
    [P in keyof T]: jest.Mock<{}>;
};