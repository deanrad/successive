import { Observable, firstValueFrom } from "https://cdn.skypack.dev/rxjs@7.5.4";;

export function after<T>(ms: number, fn: () => T) {
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

  return obs as Observable<T> & PromiseLike<T>;
}
