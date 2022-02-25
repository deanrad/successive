import { Observable, firstValueFrom } from 'rxjs';
import type { Observer } from 'rxjs';

/**
 * `after` returns an Observable of the value, or result of the function call, after the number of milliseconds given.
 * For a delay of 0, the function is executed synchronously when `.subscribe()` is called.
 * `after` is 'thenable' - and can be awaited like a Promise.
 * However, since underneath it is an Observable, `after` is both lazy and cancelable!
 *
 * @returns An Observable of the object or thunk return value, which can be the target of an `await`.
 */
export function after<T>(ms: number, fn: () => T) {
  const obs = new Observable((notify: Observer<T>) => {
    if (ms === 0) {
      notify.next(fn());
      notify.complete();
      return;
    }
    const id = setTimeout(() => {
      const retVal = fn();
      notify.next(retVal);
      notify.complete();
    }, ms)
    return () => { id && clearTimeout(id) }
  })

  Object.assign(obs, {
    then(resolve: (v: T) => any, reject: (e: unknown) => unknown) {
      return (firstValueFrom(obs) as PromiseLike<T>).then(resolve, reject);
    },
  });

  // @ts-ignore
  return obs as Observable<T> & PromiseLike<T>;
}
