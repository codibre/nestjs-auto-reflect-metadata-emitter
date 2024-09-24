import { getMetadataStorage } from '../internal';
import {
  ClassType,
  ConstructorMetadata,
  Key,
  ModifiersMetadata,
} from '../meta-type';

const metadata = getMetadataStorage();

function getMeta(prototype: object) {
  let ref = metadata.get(prototype);
  if (!ref) {
    ref = {
      ctor: undefined as unknown as ConstructorMetadata,
      properties: new Map(),
      methods: new Map(),
    };
    metadata.set(prototype, ref);
  }
  return ref;
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

export function registerMethodMetadata(modifiers: ModifiersMetadata) {
  return (
    prototype: object,
    key: Key,
    propertyDescriptor: PropertyDescriptor,
  ) => {
    const ref = getMeta(prototype);
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
