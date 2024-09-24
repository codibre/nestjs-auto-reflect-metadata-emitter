import { getProperMetadataTarget } from './internal/get-proper-metadata-target';
import { getClassMetadata } from './meta-info';
import { ClassMetadata, ClassType, Key } from './meta-type';
import { isMetadata } from './plugin';

export const DEFAULT = Symbol('default');

export function applyPropertyAndMethodsDecorators<T extends object = object>(
  clsOrMeta: ClassMetadata<T>,
  propertyAndMethodsDecorators: Partial<
    Record<Key<T> | typeof DEFAULT, (MethodDecorator | PropertyDecorator)[]>
  >,
): void;
export function applyPropertyAndMethodsDecorators<T extends object = object>(
  clsOrMeta: ClassType<T>,
  propertyAndMethodsDecorators: Partial<
    Record<Key<T> | typeof DEFAULT, (MethodDecorator | PropertyDecorator)[]>
  >,
): void;
export function applyPropertyAndMethodsDecorators<T extends object = object>(
  clsOrMeta: ClassType<T> | ClassMetadata<T>,
  propertyAndMethodsDecorators: Partial<
    Record<Key<T> | typeof DEFAULT, (MethodDecorator | PropertyDecorator)[]>
  >,
): void {
  const meta = isMetadata<T>(clsOrMeta)
    ? clsOrMeta
    : getClassMetadata(clsOrMeta);
  if (!meta) throw new Error('No class metadata found');
  const cls = meta.ctor.cls;
  const def = propertyAndMethodsDecorators[DEFAULT];
  for (const prop of meta?.properties.values()) {
    const decorators = propertyAndMethodsDecorators[prop.name] ?? def;
    if (decorators) {
      Reflect.decorate(
        decorators,
        getProperMetadataTarget(prop, cls),
        prop.name,
      );
    }
  }
  for (const prop of meta?.methods.values()) {
    const decorators = propertyAndMethodsDecorators[prop.name] ?? def;
    if (decorators) {
      Reflect.decorate(
        decorators,
        getProperMetadataTarget(prop, cls),
        prop.name,
      );
    }
  }
}

export function applyClassDecorators<T extends object = object>(
  cls: ClassType<T>,
  decorators: ClassDecorator[],
) {
  Reflect.decorate(decorators, cls);
}
