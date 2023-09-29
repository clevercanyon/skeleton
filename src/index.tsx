/**
 * Module.
 */

import './resources/init-env.ts';

import { $preact } from '@clevercanyon/utilities';

const classnames = (x: string) => x;

/**
 * Exports.
 */
export default function Comp() {
    return (
        <div class={$preact.classes('md-l-1 m-r-2 xyz phone:m-x-4')}>
            <div class={classnames('md-l-1 phone:m-x-4 m-r-2 xyz')}></div>
        </div>
    );
} // Nothing at this time.
