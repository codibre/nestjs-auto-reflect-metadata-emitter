export * from './decorator-helpers';
export * from './meta-info';
export * from './meta-type';

import './plugin/decorators';
import { blockAccess } from './internal';
blockAccess();
