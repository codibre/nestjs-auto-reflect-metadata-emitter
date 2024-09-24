import 'reflect-metadata';
import { ClassType, ClassMetadata } from './meta-type';
import { getMetadataStorage } from './internal';

const metadata = getMetadataStorage();

/**
 * Return metadata of the class informed, or undefined if there is none
 * @param cls The Class to get metadata from
 */
export function getClassMetadata<T extends object = object>(
  cls: ClassType<T>,
): ClassMetadata<T> | undefined {
  return metadata.get(cls.prototype) as ClassMetadata<T> | undefined;
}

/**
 * Returns an iterable that allows you to iterate over all the metadata
 * collected. You must filter it as you need
 */
export function iterateMetadata(): Iterable<ClassMetadata> {
  return metadata.values();
}

/**
 * Clear all the metadata collected. We recommend you to call this function
 * at the and of the metadata consumption
 */
export function clearAllMetadata(): void {
  metadata.clear();
}
