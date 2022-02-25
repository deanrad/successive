import { Observable, firstValueFrom } from 'rxjs';

export function after<T>(ms: number, fn: () => T) {
  // @ts-ignore
  const obs = new Observable((notify) => {
    if (ms === 0) {
      notify.next(fn());
      notify.complete()
    }
    const id = setTimeout(() => {
      const retVal = fn();
      notify.next(retVal)
      notify.complete()
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
