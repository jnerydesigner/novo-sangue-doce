export abstract class FoodsRepository {
    abstract list(name?: string): Promise<any[]>;
    abstract create(food: any): Promise<void>;
    abstract update(id: string, food: any): Promise<void>;
    abstract delete(id: string): Promise<void>;
}
