// @flow

import {Component} from 'react'
import omit from 'lodash.omit'
import shallowEqual from 'fbjs/lib/shallowEqual'

export default class PureRenderCallbackComponent<
  P: {children: Function} | {render: Function},
  S = *
> extends Component<P, S> {
  shouldComponentUpdate(nextProps: P, nextState: S) {
    const {props, state} = this
    const omitKeys = ['extraProps', 'children', 'render']
    return (
      !shallowEqual(state, nextState) ||
      !shallowEqual(omit(props, omitKeys), omit(nextProps, omitKeys)) ||
      !shallowEqual((props: Object).extraProps, (nextProps: Object).extraProps)
    )
  }
}
