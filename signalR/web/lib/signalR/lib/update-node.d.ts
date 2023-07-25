/**
 * If you import a dependency which does not include its own type definitions,
 * TypeScript will try to find a definition for it by following the `typeRoots`
 * compiler option in tsconfig.json. For this project, we've configured it to
 * fall back to this folder if nothing is found in node_modules/@types.
 *
 * Often, you can install the DefinitelyTyped
 * (https://github.com/DefinitelyTyped/DefinitelyTyped) type definition for the
 * dependency in question. However, if no one has yet contributed definitions
 * for the package, you may want to declare your own. (If you're using the
 * `noImplicitAny` compiler options, you'll be required to declare it.)
 *
 * This is an example type definition which allows import from `module-name`,
 * e.g.:
 * ```ts
 * import something from 'module-name';
 * something();
 * ```
 */
import { NodeQueryIdentifier, NodeType, PathValue, Type } from "./node.js";
export interface IUpdateNode {
    name?: string | null;
    parentId?: NodeQueryIdentifier | null;
    type?: NodeType;
    displayName?: string | null;
    description?: string | null;
    maxValueAge?: number | null;
    pathType?: Type;
    path?: PathValue | null;
}
export interface IUpdateValueNode extends IUpdateNode {
    valueType?: Type;
    location?: string | null;
    historyOptions?: string | null;
    historyInterval?: number | null;
    minValue?: number | null;
    maxValue?: number | null;
    hysteresis?: number | null;
    scalingFactor?: number | null;
    scalingOffset?: number | null;
    unit?: string | null;
    format?: string | null;
}
