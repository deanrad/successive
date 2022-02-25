// See also https://codesandbox.io/s/cancelable-missiles-tfiv9u?file=/src/index.ts:964-1111
import { concat } from "https://cdn.skypack.dev/rxjs@7.5.4";;
import { after } from './after.ts';


describe('after', () => {
  const ASYNC_DELAY = 10

  it('exists', () => {
    expect(after).toBeDefined()
  })

  describe('return value of after(ms, fn)', () => {

    it('does not set a timeout immediately', async () => {
      let flag = false
      const setFlag = () => { flag = true }

      const result = after(ASYNC_DELAY, setFlag)
      await duration(ASYNC_DELAY);
      expect(flag).toBeFalsy()

    })
    it('sets a timeout upon .subscribe()', async () => {
      let flag = false
      const setFlag = () => { flag = true }

      const result = after(ASYNC_DELAY, setFlag).subscribe()

      await duration(ASYNC_DELAY);
      expect(flag).toBeTruthy()
    })

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
