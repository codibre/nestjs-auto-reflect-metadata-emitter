import { ClassMetadata } from '../meta-type';

let blocked = false;
const metadata = new Map<object, ClassMetadata>();

export function getMetadataStorage() {
  if (!blocked) return metadata;
  throw new Error('Invalid Operation');
}

export function blockAccess() {
  blocked = true;
}
