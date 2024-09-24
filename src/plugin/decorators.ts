import { getMetadataStorage } from '../internal';
import {
  ClassMetadata,
  ClassType,
  ConstructorMetadata,
  Key,
  MethodMetadata,
  ModifiersMetadata,
  PropertyMetadata,
} from '../meta-type';

const metadata = getMetadataStorage();
const metadataSymbol = Symbol('metadataSymbol');
const metadataMarker = { [metadataSymbol]: true };

function getMeta<T extends object = object>(prototype: T) {
  let ref = metadata.get(prototype) as ClassMetadata<T> | undefined;
  if (!ref) {
    ref = {
      ctor: undefined as unknown as ConstructorMetadata<T>,
      properties: new Map<Key<T>, PropertyMetadata>(),
      methods: new Map<Key<T>, MethodMetadata>(),
    };
    Object.assign(ref, metadataMarker);
    metadata.set(prototype, ref as unknown as ClassMetadata<object>);
  }
  return ref;
}

export function isMetadata<T extends object = object>(
  ref: unknown,
): ref is ClassMetadata<T> {
  return typeof ref === 'object' && !!ref && metadataSymbol in ref;
}

export function registerClassMetadata(modifiers: ModifiersMetadata) {
  return (cls: ClassType) => {
    const { prototype } = cls;
    const ref = getMeta(prototype);
    ref.ctor = {
      cls,
      args: Reflect.getMetadata('design:paramtypes', cls),
      modifiers,
    };
  };
}

export function registerPropertyMetadata(modifiers: ModifiersMetadata) {
  return (prototype: object, key: Key) => {
    const ref = getMeta(prototype);
    const type = Reflect.getMetadata('design:type', prototype, key);
    ref.properties.set(key, {
      name: key,
      type,
      modifiers,
    });
  };
}

export function registerMethodMetadata<T extends object = object>(
  modifiers: ModifiersMetadata,
) {
  return (prototype: T, key: Key, propertyDescriptor: PropertyDescriptor) => {
    const ref = getMeta<T>(prototype);
    const returnType = Reflect.getMetadata('design:returntype', prototype, key);
    ref.methods.set(key, {
      name: key,
      args: Reflect.getMetadata('design:paramtypes', prototype, key),
      returnType,
      propertyDescriptor,
      modifiers,
    });
  };
}
