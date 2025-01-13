import { fluentObject } from '@codibre/fluent-iterable';
import { ObjectKeyType } from 'is-this-a-pigeon';
import { applyClassDecorators } from 'src/decorator-helpers';
import { getClassMetadata } from 'src/meta-info';
import { ClassType } from 'src/meta-type';

export type HandlersImport = Record<ObjectKeyType, ClassType<HandlerLike>>;
export interface HandlerLike {
  execute(command: unknown): unknown;
}

let cqrs: Record<'CommandHandler' | 'QueryHandler', Function>;

export function getHandlersMeta(handlers: HandlersImport) {
  return fluentObject(handlers)
    .map(1)
    .map((cls: ClassType<HandlerLike>) => ({
      cls,
      command: getClassMetadata(cls)?.methods.get('execute')?.args[0],
    }))
    .filter('command');
}

export function defineCommandHandlers(handlers: HandlersImport) {
  cqrs ??= require('@nestjs/cqrs');
  getHandlersMeta(handlers).forEach((meta) => {
    applyClassDecorators(meta.cls, [cqrs.CommandHandler(meta.command)]);
  });
}

export function defineQueryHandlers(handlers: HandlersImport) {
  cqrs ??= require('@nestjs/cqrs');
  getHandlersMeta(handlers).forEach((meta) => {
    applyClassDecorators(meta.cls, [cqrs.QueryHandler(meta.command)]);
  });
}
