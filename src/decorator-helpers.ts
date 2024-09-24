import { getProperMetadataTarget } from './internal/get-proper-metadata-target';
import { getClassMetadata } from './meta-info';
import { ClassType, Key } from './meta-type';

export const DEFAULT = Symbol('default');

export function applyPropertyAndMethodsDecorators<T extends object = object>(
  cls: ClassType<T>,
  propertyAndMethodsDecorators: Partial<
    Record<Key<T> | typeof DEFAULT, (MethodDecorator | PropertyDecorator)[]>
  >,
) {
  const def = propertyAndMethodsDecorators[DEFAULT];
  const meta = getClassMetadata(cls);
  if (!meta) throw new Error('No class metadata found');
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
