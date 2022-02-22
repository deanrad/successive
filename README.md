# `after` - the async utility you didn't know you needed.

Allows you to:
* Mix and match Promises and Observables.
* Support cancelation without additional objects (AbortController, clearTimeout)
* Create scripts with specific delays to test debouncing, etc.
* Compose in a cancelation-preserving way

It has a dual identity as both a Promise and an Observable. It's an Observable by day and underneath, but at night, and in an `await` , it can be treated as a Promise.

[CodeSandbox Demo](https://codesandbox.io/s/after-thought-docs-v9z4nw)

## Installation

```
npm i -S after-thought

import { after } from 'after-thought';  // client or server
```

---

## `after` is a Promise (a _"thenable"_)

When used as you would a Promise, `after()` represents a delay, an value, or a value calculated after either a) a time in milliseconds, or b) a Promise.

```js
await after(100) // only a delay

await after(100, {
    updatedAt: '2020-04-01'
})
await after(100, () => ({
    updatedAt: new Date()
}))

after(credentialPromise, user => logIn(user))
    .then(token => /* */ )
```

---

## `after` is an Observable!

`after` is also an Observable, so you can obtain its value via, `subscribe()` , and cancel its subscription by calling `.unsubscribe()` . A stream with any desired timing can be created by `concat` -enating a bunch of `after` s.

```js
after(100, 3.14).subscribe(pi => (setDiameter(radius * 2 * pi)))

after(0, 3.14).subscribe(pi => Math.TAU = 2 * pi);
// Math.TAU is immediately available because its after '0'

concat(
    after(0, Math.PI),
    after(1000, 2.718)
).subscribe(constant)
```

Passing `0 msec` causes `after` to be a synchronous Observable. 

For e2e and unit testing, and Storybook, in order to simulate component interaction precisely, it is useful to create a script by concatenating `after` s of user interactions, or other function invocations.

```js
const sub = concat(
    after(0, () => userEvent.type(email, "me@email.com")),
    after(1000, () => userEvent.type(password, "password123"))
).subscribe()

// unsubscribe, and unstarted steps will not run
sub.unsubscribe();
```
Unlike Promises, which run to completion by design (they are a _Promise_ after all), an `after` or a `concat`-enation of `after`s is fully cancelable! So if you `unsubscribe()` on component unmount, for example, the chain will be halted wherever it is.

Also unlike Promises, the Observable model assumes nothing about whether the execution is sync or async, or whether yielding zero- single- or multiple -values. Notifications are simply delivered whenever the Observable calls `observer.next()`.

## `after` can delay an Observable!

When the `valueProducer` argument is an Observable, `after` returns a delayed subscription to the Observable. 

In contrast, RxJS [ `delay` ](https://rxjs.dev/api/operators/delay) only delays the _notifications_. The difference is when the underlying resource is actually used at subscription time, or only after the delay.

---

## Conclusion

That's all - enjoy using `after` (and `concat` )!
