import { existsSync } from 'fs';
import { getModuleRealPath } from './ts-loader';

export function moduleExists(moduleName: string) {
  try {
    const tsConfigTreatedModuleName = getModuleRealPath(moduleName);
    if (tsConfigTreatedModuleName
        && (existsSync(tsConfigTreatedModuleName)
        || existsSync(`${tsConfigTreatedModuleName}.ts`)
        || existsSync(`${tsConfigTreatedModuleName}.js`))
    ) return true;
    require(tsConfigTreatedModuleName ?? moduleName);
    return true;
  } catch {
    return false;
  }
}
