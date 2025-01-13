export * from './decorator-helpers';
export * from './meta-info';
export * from './meta-type';
export * from './helpers';

import './plugin/decorators';
import { blockAccess } from './internal';
blockAccess();
