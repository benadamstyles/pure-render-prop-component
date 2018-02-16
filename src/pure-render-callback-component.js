// @flow

import {Component} from 'react'
import omit from 'lodash.omit'

export default class PureRenderCallbackComponent<
  P: {children: Function, extraProps: {}},
  S
> extends Component<P, S> {
  shouldComponentUpdate(nextProps: P, nextState: S) {
    const {props, state} = this
    const omitKeys = ['extraProps', 'children']
    return (
      !shallowEqual(state, nextState) ||
      !shallowEqual(omit(props, omitKeys), omit(nextProps, omitKeys)) ||
      !shallowEqual(props.extraProps, nextProps.extraProps)
    )
  }
}
