// See also https://codesandbox.io/s/cancelable-missiles-tfiv9u?file=/src/index.ts:964-1111
import { concat, Observable, of } from "https://cdn.skypack.dev/rxjs@7.5.4";;
import __rxjs_operators_ns from "https://dev.jspm.io/rxjs@7.5.4/operators";
const { tap } = __rxjs_operators_ns;
import { after } from './after.ts';

const ASYNC_DELAY = 10

describe('after', () => {

  describe('return value of after(delay, fn)', () => {

    it('calls function after a delay upon .subscribe()', async () => {
      let flag = false
      const setFlag = () => { flag = true }

      const result = after(ASYNC_DELAY, setFlag).subscribe()

      await duration(ASYNC_DELAY);
      expect(flag).toBeTruthy()
    })
    it('does not call function immediately', async () => {
      let flag = false
      const setFlag = () => { flag = true }

      const result = after(ASYNC_DELAY, setFlag)
      await duration(ASYNC_DELAY);
      expect(flag).toBeFalsy()

    })

    it('is an Observable', () => {
      expect(after(1, () => 1)).toBeInstanceOf(Observable);
    });
    it('is awaitable', async () => {
      const result = await after(1, '1.1');
      expect(result).toEqual('1.1');
    });
    it('is thenable', async () => {
      return after(1, () => 52).then((result) => {
        expect(result).toEqual(52);
      });
    });

    describe('the underlying value', () => {
      it('can be obtained from .subscribe()', async () => {
        let count = 0
        const increment = () => { return count++ }

        let retVal
        const sub = after(ASYNC_DELAY, increment).subscribe(v => retVal = v)
        await duration(ASYNC_DELAY)
        expect(retVal).toEqual(0)
      })
      describe('When a Promise', () => {
        it('if second argument returns a Promise, it too is awaited', async () => {
          let count = 0
          const result = after(0, () => duration(6)).then(() => {
            count++
          })
          await duration(5)
          expect(count).toEqual(0)
          await duration(2)
          expect(count).toEqual(1)
        })
      })
      describe('From a Promise', () => {
        it('cannot be obtained synchronously', () => {
          let flag = false
          Promise.resolve().then(() => { flag = true })
          expect(flag).toBeFalsy()
        })
      })
      it('can be obtained synchronously', () => {
        let flag = false
        after(0, () => { flag = true }).subscribe()
        expect(flag).toBeTruthy()
      })
      it('can be awaited', async () => {
        const result = await after(ASYNC_DELAY, () => 2);
        expect(result).toEqual(2)
      })
      it('can be obtained from then()', async () => {
        let result;
        after(ASYNC_DELAY, () => 2).then(v => { result = v })
        await duration(ASYNC_DELAY)
        expect(result).toEqual(2)
      });
    })
  })

  describe('delay arg', () => {
    describe('when 0', () => {
      it('is synchronous', () => {
        let result;
        after(0, () => {
          result = 3;
        }).subscribe();
        expect(result).toEqual(3);
      });
    });
    describe('when a promise', () => {
      it('chains onto its end', async () => {
        let result = await after(Promise.resolve(), 2);
        expect(result).toEqual(2)
      })

      it('does not invoke mapper when canceled before Promise resolves', async () => {
        let flag = false
        let result = after(Promise.resolve(), () => { flag = true }).subscribe();
        result.unsubscribe()

        await Promise.resolve()
        // still flag is false
        expect(flag).toBeFalsy()
      });

      it('recieves the value of the delay in its valueProducer', async () => {
        let result = await after(Promise.resolve(3.14), (n: number) => 2 * n)
        expect(result).toEqual(6.28)
      })
      it('recieves the resolved value of the delay in its valueProducer', async () => {
        let result = await after(Promise.resolve(3.14), (n: number) => Promise.resolve(2 * n))
        expect(result).toEqual(6.28)
      })

      describe('When a Promise', () => {
        it('if second argument returns a Promise, it too is awaited', async () => {
          let count = 0
          const result = after(0, () => duration(6)).then(() => {
            count++
          })
          await duration(5)
          expect(count).toEqual(0)
          await duration(2)
          expect(count).toEqual(1)
        })
      })

    })
  });

  describe('value arg', () => {
    describe('when a value', () => {
      it('is returned', async () => {
        const result = await after(1, 2.718);
        expect(result).toEqual(2.718);
      });
    });

    describe('when undefined', () => {
      it('is ok', async () => {
        const result = await after(1);
        expect(result).toBeUndefined();
      });
    });

    describe('when a function', () => {
      it('schedules its execution later', async () => {
        let counter = 0;
        let thenable = after(1, () => counter++);
        expect(counter).toEqual(0);
        await thenable;
        expect(counter).toEqual(1);
      });

      it('returns its return value', async () => {
        let result = await after(1, () => 2.71);
        expect(result).toEqual(2.71);
      });
    });

    describe('when an Observable', () => {
      it('defers subscription', async () => {
        const events: Array<string> = [];
        const toDefer = of(2).pipe(
          tap({
            subscribe() {
              events.push('subscribe');
            },
          })
        );
        const subject = after(1, toDefer);
        subject.subscribe();
        expect(events).toEqual([]);
        await after(2);
        expect(events).toEqual(['subscribe']);
      });

      it('yields the value', async () => {
        return after(1, of(2)).then((v) => {
          expect(v).toEqual(2);
        });
      });
    });
  });

  describe('cancelation', () => {
    it('cancels the timeout upon sub.unsubscribe()', async () => {
      let flag = false
      const setFlag = () => { flag = true }

      const result = after(ASYNC_DELAY, setFlag).subscribe()
      result.unsubscribe();

      await duration(ASYNC_DELAY);
      expect(flag).toBeFalsy()
    })
  })

  describe('composition', () => {
    it('can be sequenced', async () => {
      const result = concat(
        after(ASYNC_DELAY, () => 1),
        after(ASYNC_DELAY, () => 2)
      )
      const seen: number[] = [];
      result.subscribe(value => seen.push(value))
      await duration(ASYNC_DELAY * 3);
      expect(seen).toEqual([1, 2])
    })
    describe('cancelation of composed', () => {
      it('all are canceled upon sub.unsubscribe()', async () => {
        const result = concat(
          after(ASYNC_DELAY, () => 1),
          after(ASYNC_DELAY, () => 2)
        )
        const seen: number[] = [];
        const sub = result.subscribe(value => seen.push(value))
        sub.unsubscribe()
        await duration(ASYNC_DELAY * 3);
        expect(seen).toEqual([])
      })
      it('sync are not canceled upon sub.unsubscribe()', async () => {
        const result = concat(
          after(0, () => 1),
          after(ASYNC_DELAY, () => 2)
        )
        const seen: number[] = [];
        const sub = result.subscribe(value => seen.push(value))
        sub.unsubscribe()
        await duration(ASYNC_DELAY * 2);
        expect(seen).toEqual([1])
      })
    })
  })
})


// Use this in tests
const duration = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
