import { Observable, of, firstValueFrom, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

function makeThenable<T>(obs: Observable<T>) {
  Object.assign(obs, {
    then(resolve: (v: T) => any, reject: (e: unknown) => unknown) {
      return (firstValueFrom(obs) as PromiseLike<T>).then(resolve, reject);
    },
  });
  return obs as Observable<T> & PromiseLike<T>;
}

/**
 * `after` returns an Observable of the value, or result of the function call, after the number of milliseconds given.
 * For a delay of 0, the function is executed synchronously when `.subscribe()` is called.
 * `after` is 'thenable' - and can be awaited like a Promise.
 * However, since underneath it is an Observable, `after` is both lazy and cancelable!
 *
 * @returns An optionally delayed Observable of the object, thunk return value, or Observable's notification(s).
 * @argument delay Either a number of milliseconds, or a Promise. 
 * @argument valueProvider Can be a value, a function returning a value, or an Observable.
 */
export function after<T>(
  delay: number | Promise<any>,
  valueProvider?: T | ((v?: T) => T) | ((v?: T) => PromiseLike<T>) | Observable<T>) {
  const resultFn = (typeof (valueProvider) === "function" ? valueProvider : () => valueProvider) as (v?: T) => T

  // case: synchronous
  if (delay === 0) {
    return makeThenable(of(resultFn()))
  }

  // case: 1st argument Promise. Errors if last argument is an Observable.
  if (typeof delay === "object" && (delay as PromiseLike<T>).then) {
    const obs = new Observable(notify => {
      let canceled = false
      const conditionalSeq = (delay as Promise<T>).then((resolved) => {
        if (!canceled) {
          const result = resultFn(resolved)
          notify.next(result)
          notify.complete()
        }
      }
      )
      return () => { canceled = true }
    })
    return makeThenable(obs)
  }

  // Case: 2nd argument Observable. Errors unless first arg is a number.
  if ((valueProvider as Observable<T>)?.subscribe) {
    const _timer: Observable<number> = timer(delay as unknown as number)
    return makeThenable(_timer.pipe(
      mergeMap(() => (valueProvider as Observable<T>))
    ))
  }

  // Default - a value or thunk and a number of milliseconds
  const obs = new Observable((notify) => {
    const id = setTimeout(() => {
      const retVal = resultFn();
      notify.next(retVal)
      notify.complete()
    }, delay as number)
    return () => { id && clearTimeout(id) }
  })

  return makeThenable(obs)
}
