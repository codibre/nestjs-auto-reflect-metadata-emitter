import { fluentObject } from '@codibre/fluent-iterable';
import { ObjectKeyType, RecursiveOmit } from 'is-this-a-pigeon';
import { getClassMetadata } from 'src/meta-info';
import { ClassType } from 'src/meta-type';

declare const noKey: unique symbol;
type NoKey = typeof noKey;
const noKeys = new Set<ObjectKeyType>();

export { RecursiveOmit, ObjectKeyType };

/**
 * Returns a new object with all keys not belonged to the class type of
 * the informed object removed.
 * @param obj the object
 */
export function removeUnknownProperties<T>(obj: T): T;
/**
 * Return a new object with all keys not belonged to the class type of
 * the informed object removed. Additionally, removes other keys
 * informed in a Set. For type safety, it's important
 * that the item type of the set represents the type of
 * its content as const. Example: Set<'field1' | 'field2'>
 * Otherwise the type produced will exclude out those types
 * @param obj the object
 * @param prohibitedKeyList the list of additional keys to be removed
 */
export function removeUnknownProperties<T, K extends ObjectKeyType>(
  obj: T,
  prohibitedKeyList: Set<K>,
): RecursiveOmit<T, ObjectKeyType extends K ? NoKey : K>;
export function removeUnknownProperties<T, K extends ObjectKeyType = NoKey>(
  obj: T,
  prohibitedKeyList: Set<ObjectKeyType> = noKeys,
): K extends NoKey | ObjectKeyType ? T : RecursiveOmit<T, K> {
  if (Array.isArray(obj)) {
    return obj.map((x) =>
      removeUnknownProperties(x, prohibitedKeyList),
    ) as K extends NoKey | ObjectKeyType ? T : RecursiveOmit<T, K>;
  }
  if (typeof obj !== 'object' || obj === null) {
    return obj as K extends NoKey | ObjectKeyType ? T : RecursiveOmit<T, K>;
  }
  const meta = getClassMetadata(
    obj.constructor as ClassType<Record<string, unknown>>,
  );
  const result = fluentObject(obj)
    .filter(
      ([k]) =>
        !prohibitedKeyList.has(k) &&
        (meta?.properties.has(k as string) ?? true),
    )
    .toObject(0, (x) =>
      removeUnknownProperties(x[1], prohibitedKeyList),
    ) as K extends NoKey | ObjectKeyType ? T : RecursiveOmit<T, K>;
  Object.setPrototypeOf(result, obj.constructor);
  return result;
}
