import {
  Between,
  Equal,
  FindOperator as TypeOrmFindOperator,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  ObjectLiteral,
  Raw,
} from 'typeorm';
import { IdVo } from '../value-objects';

export enum FindOperation {
  Equal = 'EQUAL',
  NotEqual = 'NOT_EQUAL',
  In = 'IN',
  NotIn = 'NOT_IN',
  MoreThan = 'MORE_THEN',
  MoreThanOrEqual = 'MORE_THEN_OR_EQUAL',
  LessThan = 'LESS_THEN',
  LessThanOrEqual = 'LESS_THEN_OR_EQUAL',
  Between = 'BETWEEN',
  Like = 'LIKE',
  ILike = 'I_LIKE',
  JsonbSearch = 'JSONB_SEARCH',
  JsonbContains = 'JSONB_CONTAINS',
  IsNull = 'IS_NULL',
  IsNotNull = 'IS_NOT_NULL',
}

export class QueryOperator {
  private constructor(
    public readonly operation: FindOperation,
    public readonly values: any[],
  ) {}

  private get value() {
    return this.values[0];
  }

  static isQueryOperator(value: unknown): value is QueryOperator {
    return value instanceof QueryOperator;
  }

  static equal(value: number | string | boolean) {
    return new QueryOperator(FindOperation.Equal, [value]);
  }

  static notEqual(value: number | string | boolean) {
    return new QueryOperator(FindOperation.NotEqual, [value]);
  }

  static in(values: (number | string | boolean | IdVo)[]) {
    const rawValues: (number | string | boolean)[] = [];
    for (const value of values) {
      if (IdVo.isValueObject(value)) {
        rawValues.push(value.value);
      } else {
        rawValues.push(value);
      }
    }

    return new QueryOperator(FindOperation.In, rawValues);
  }

  static jsonbSearch(query: string, params?: ObjectLiteral) {
    return new QueryOperator(FindOperation.JsonbSearch, [query, params]);
  }

  static jsonbContains(obj: object) {
    return new QueryOperator(FindOperation.JsonbContains, [JSON.stringify(obj)]);
  }

  static notIn(values: (number | string | boolean)[]) {
    return new QueryOperator(FindOperation.NotIn, values);
  }

  static moreThan(value: number | string | boolean) {
    return new QueryOperator(FindOperation.MoreThan, [value]);
  }

  static moreThanOrEqual(value: number | string | boolean) {
    return new QueryOperator(FindOperation.MoreThanOrEqual, [value]);
  }

  static lessThan(value: number | string | boolean) {
    return new QueryOperator(FindOperation.LessThan, [value]);
  }

  static lessThanOrEqual(value: number | string | boolean) {
    return new QueryOperator(FindOperation.LessThanOrEqual, [value]);
  }

  static between(min: number | string | boolean | Date, max: number | string | boolean | Date) {
    return new QueryOperator(FindOperation.Between, [min, max]);
  }

  static like(value: string) {
    return new QueryOperator(FindOperation.Like, [`%${value}%`]);
  }

  static iLike(value: string) {
    return new QueryOperator(FindOperation.ILike, [`%${value}%`]);
  }

  static isNull() {
    return new QueryOperator(FindOperation.IsNull, []);
  }

  static isNotNull() {
    return new QueryOperator(FindOperation.IsNotNull, []);
  }

  build<T = unknown>(): TypeOrmFindOperator<T> {
    switch (this.operation) {
      case FindOperation.In:
        return In(this.values);
      case FindOperation.NotIn:
        return Not(In(this.values));
      case FindOperation.Equal:
        return Equal(this.value);
      case FindOperation.NotEqual:
        return Not(Equal(this.value));
      case FindOperation.MoreThan:
        return MoreThan(this.value);
      case FindOperation.MoreThanOrEqual:
        return MoreThanOrEqual(this.value);
      case FindOperation.LessThan:
        return LessThan(this.value);
      case FindOperation.LessThanOrEqual:
        return LessThanOrEqual(this.value);
      case FindOperation.Between:
        return Between(this.values[0], this.values[1]);
      case FindOperation.Like:
        return Like(this.value);
      case FindOperation.ILike:
        return ILike(this.value);
      case FindOperation.JsonbSearch: {
        const query = this.values[0];
        const params = this.values[1];
        return Raw((alias: string) => `${alias} @? ('${query}')::jsonpath`, params);
      }
      case FindOperation.JsonbContains:
        return Raw((alias: string) => `${alias} @> (:value)::jsonb`, { value: this.value });
      case FindOperation.IsNull:
        return IsNull();
      case FindOperation.IsNotNull:
        return Not(IsNull());
      default:
        throw new Error(`Unknown operation [${this.operation}]`);
    }
  }
}
