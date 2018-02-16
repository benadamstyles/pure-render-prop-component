# PureRenderCallbackComponent

[![Build Status](https://travis-ci.org/Leeds-eBooks/pure-render-callback-component.svg?branch=master)](https://travis-ci.org/Leeds-eBooks/pure-render-callback-component)
[![Greenkeeper badge](https://badges.greenkeeper.io/Leeds-eBooks/pure-render-callback-component.svg)](https://greenkeeper.io/)

```sh
npm install --save pure-render-callback-component
# or
yarn add pure-render-callback-component
```

The [render callback pattern](https://reactpatterns.com/#render-callback) in React allows us to build highly functional components, but it doesn’t play well with how React currently manages re-rendering.

```js
import React, {Component} from 'react'

class CurrentTime extends Component {
  state = {currentTime: Date.now()}
  render() {
    return this.props.children(this.state.currentTime)
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <CurrentTime>
          {// *
          currentTime => (
            <div>
              <p>{this.props.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        </CurrentTime>
      </div>
    )
  }
}
```

Here, our `CurrentTime` component will re-render every time our `App` component renders, even if neither `CurrentTime`’s `state` nor its `props` (in this case, its `children` function) have changed.

However, changing `CurrentTime` to [inherit from `PureComponent`](https://reactjs.org/docs/react-api.html#reactpurecomponent) doesn’t help. [The React docs explain why](https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent): `PureComponent` compares `state` and `props`, and **only** if a property of `state` or of `props` has changed, does it re-render. In the above case, every time `App` re-renders, the render callback supplied to `CurrentTime` (marked `*`) is recreated. Two functions which look the same are still two different functions, so `CurrentTime#props.children` has changed, and `CurrentTime` re-renders.

We can solve this by, [as the React docs put it](https://reactjs.org/docs/render-props.html#be-careful-when-using-render-props-with-reactpurecomponent), defining the function “as an instance method”, in other words, moving the function out of our `App` component’s `render` method.

```js
import React, {Component, PureComponent} from 'react'

class CurrentTime extends PureComponent {
  state = {currentTime: Date.now()}
  render() {
    return this.props.children(this.state.currentTime)
  }
}

class App extends Component {
  currentTimeCallback = currentTime => (
    <div>
      <p>{this.props.pageTitle}</p>
      <p>{currentTime}</p>
    </div>
  )

  render() {
    return (
      <div>
        <CurrentTime>{this.currentTimeCallback}</CurrentTime>
      </div>
    )
  }
}
```

Now, `currentTimeCallback` is only created once. `PureComponent` compares `props` before and after the re-render of `App`, finds that the `children` function hasn’t changed, and aborts the re-render of `CurrentTime`. Performance improved!

**But there is a big problem waiting to happen.** Our `currentTimeCallback` doesn’t just depend on the `currentTime` argument passed down from our `CurrentTime` component. It also renders `App`’s `props.pageTitle`. But with the above setup, when `pageTitle` changes, `currentTimeCallback` will not re-render. It will show **the old `pageTitle`**.

I struggled with this problem, trying all sorts of horrible hacks, until I came across [this Github issue on the React repo](https://github.com/facebook/react/issues/4136), and the [suggestion](https://github.com/facebook/react/issues/4136#issuecomment-112168425) by a React developer of a possible solution. `pure-render-callback-component` is my implementation of that solution.

## Usage

```js
import React, {Component} from 'react'
import PureRenderCallbackComponent from 'pure-render-callback-component'

class CurrentTime extends PureRenderCallbackComponent {
  state = {currentTime: Date.now()}
  render() {
    return this.props.children(this.state.currentTime, this.props.extraProps)
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <CurrentTime extraProps={{pageTitle: this.props.pageTitle}}>
          {(currentTime, extraProps) => (
            <div>
              <p>{extraProps.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        </CurrentTime>
      </div>
    )
  }
}
```

Now, our render callback will always re-render when, and **only** when, `CurrentTime#state.currentTime` or `App#props.pageTitle` change.

You can also pass other props into your render callback component and they will be treated in the same way.

```js
import React, {Component} from 'react'
import PureRenderCallbackComponent from 'pure-render-callback-component'

class CurrentTime extends PureRenderCallbackComponent {
  state = {currentTime: Date.now()}

  format(timestamp) {
    return String(new Date(timestamp))
  }

  render() {
    const time = this.props.format
      ? this.format(this.state.currentTime)
      : this.state.currentTime
    return this.props.children(time, this.props.extraProps)
  }
}

class App extends Component {
  render() {
    return (
      <div>
        <CurrentTime
          format={true}
          extraProps={{pageTitle: this.props.pageTitle}}>
          {(currentTime, extraProps) => (
            <div>
              <p>{extraProps.pageTitle}</p>
              <p>{currentTime}</p>
            </div>
          )}
        </CurrentTime>
      </div>
    )
  }
}
```

Here, our render callback will also re-render when the boolean passed into `CurrentTime`’s `format` prop changes.

## Recompose

TODO: documentation coming soon . . .
