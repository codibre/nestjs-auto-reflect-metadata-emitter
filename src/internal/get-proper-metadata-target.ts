import { PropertyMetadata, ClassType, MethodMetadata } from '../meta-type';

export function getProperMetadataTarget<T extends object = object>(
  prop: PropertyMetadata<T> | MethodMetadata<T>,
  cls: ClassType,
): Object {
  return prop.modifiers.static ? cls : cls.prototype;
}
