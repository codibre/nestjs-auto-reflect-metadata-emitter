import { fluentObject } from '@codibre/fluent-iterable';
import { ObjectKeyType } from 'is-this-a-pigeon';
import {
  applyPropertyAndMethodsDecorators,
  DEFAULT,
} from 'src/decorator-helpers';
import { getClassMetadata } from 'src/meta-info';
import { ClassType } from 'src/meta-type';

let swagger: { ApiProperty: Function };

/**
 * Decorates to every property of every class in the informed import
 * with the metadata ApiProperty, to expose it to @nestjs/swagger
 * Usage:
 * import * as dto from './my-dto';
 * import { defineAllApiProperties } from 'nestjs-auto-reflect-metadata-emitter';
 *
 * defineAllApiProperties(dto);
 * @param dto
 */
export function defineAllApiProperties(dto: Record<ObjectKeyType, object>) {
  swagger ??= require('@nestjs/swagger');
  fluentObject(dto)
    .map((x) => getClassMetadata(x[1] as ClassType))
    .filter()
    .forEach((meta) => {
      applyPropertyAndMethodsDecorators(meta, {
        [DEFAULT]: [swagger.ApiProperty()],
      });
    });
}
