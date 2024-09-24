import 'reflect-metadata';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ClassType = abstract new (...args: any[]) => unknown;
export type Key = string | symbol;

export interface ConstructorMetadata {
  cls: ClassType;
  args: unknown[];
}
export interface MethodMetadata {
  name: Key;
  args: unknown[];
  returnType: unknown;
  propertyDescriptor: PropertyDescriptor;
}
export interface PropertyMetadata {
  name: Key;
  type: unknown;
}

interface ClassMetadata {
  ctor: ConstructorMetadata;
  properties: Map<Key, PropertyMetadata>;
  methods: Map<Key, MethodMetadata>;
}
const metadata = new Map<object, ClassMetadata>();

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

export function registerClassMetadata(cls: ClassType) {
  const { prototype } = cls;
  const ref = getMeta(prototype);
  ref.ctor = {
    cls,
    args: Reflect.getMetadata('design:paramtypes', cls),
  };
}

export function registerPropertyMetadata(prototype: object, key: Key) {
  const ref = getMeta(prototype);
  const type = Reflect.getMetadata('design:type', prototype, key);
  ref.properties.set(key, {
    name: key,
    type,
  });
}

export function registerMethodMetadata(
  prototype: object,
  key: Key,
  propertyDescriptor: PropertyDescriptor,
) {
  const ref = getMeta(prototype);
  const returnType = Reflect.getMetadata('design:returntype', prototype, key);
  ref.methods.set(key, {
    name: key,
    args: Reflect.getMetadata('design:paramtypes', prototype, key),
    returnType,
    propertyDescriptor,
  });
}

/**
 * Return metadata of the class informed, or undefined if there is none
 * @param cls The Class to get metadata from
 */
export function getClassMetadata(cls: ClassType) {
  return metadata.get(cls.prototype);
}

/**
 * Returns an iterable that allows you to iterate over all the metadata
 * collected. You must filter it as you need
 */
export function iterateMetadata() {
  return metadata.values();
}

/**
 * Clear all the metadata collected. We recommend you to call this function
 * at the and of the metadata consumption
 */
export function clearAllMetadata() {
  metadata.clear();
}
