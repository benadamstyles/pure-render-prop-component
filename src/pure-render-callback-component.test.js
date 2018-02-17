// @flow

import React, {PureComponent} from 'react'
import deepRenderer from 'react-test-renderer'
import PureRenderCallbackComponent from './pure-render-callback-component'

const wait = ms => new Promise(r => setTimeout(r, ms))

type State = {
  a: string,
  b: number,
  cb: Function,
}

const renderSpy = jest.fn()

describe('PureRenderCallbackComponent', () => {
  beforeEach(() => {
    renderSpy.mockClear()
  })

  describe('using children prop', () => {
    class TestComponent extends PureRenderCallbackComponent<{
      children: Function,
      extraProps: {a: string},
      other?: string,
    }> {
      render() {
        renderSpy()
        return this.props.children()
      }
    }

    class TestWrapper extends PureComponent<{}, State> {
      constructor(props) {
        super(props)
        this.state = {
          a: 'a',
          b: 1,
          cb: jest.fn(() => null),
        }
      }

      render() {
        return (
          <TestComponent test={this.state.b} extraProps={{a: this.state.a}}>
            {this.state.cb}
          </TestComponent>
        )
      }
    }

    let instance

    beforeEach(() => {
      instance = deepRenderer.create(<TestWrapper />).getInstance()
    })

    it('doesn’t update if children changes', () => {
      const newCb = jest.fn(() => null)
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({cb: newCb})
      expect(newCb).toHaveBeenCalledTimes(0)
      expect(renderSpy).toHaveBeenCalledTimes(1)
      instance.setState({a: 'b'})
      expect(newCb).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('doesn’t update if extraProps changes but is shallowEqual', () => {
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({a: 'a'})
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
    })

    it('updates if extraProps changes', () => {
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({a: 'a'})
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({a: 'b'})
      expect(instance.state.cb).toHaveBeenCalledTimes(2)
    })

    it('updates if other props change', () => {
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({b: 1})
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({b: 2})
      expect(instance.state.cb).toHaveBeenCalledTimes(2)
    })
  })

  describe('using render prop', () => {
    class TestComponent extends PureRenderCallbackComponent<{
      render: Function,
      extraProps: {a: string},
      other?: string,
    }> {
      render() {
        renderSpy()
        return this.props.render()
      }
    }

    class TestWrapper extends PureComponent<{}, State> {
      constructor(props) {
        super(props)
        this.state = {
          a: 'a',
          b: 1,
          cb: jest.fn(() => null),
        }
      }

      render() {
        return (
          <TestComponent
            test={this.state.b}
            extraProps={{a: this.state.a}}
            render={this.state.cb}
          />
        )
      }
    }

    let instance

    beforeEach(() => {
      instance = deepRenderer.create(<TestWrapper />).getInstance()
    })

    it('doesn’t update if render prop changes', () => {
      const newCb = jest.fn(() => null)
      expect(renderSpy).toHaveBeenCalledTimes(1)
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({cb: newCb})
      expect(newCb).toHaveBeenCalledTimes(0)
      expect(renderSpy).toHaveBeenCalledTimes(1)
      instance.setState({a: 'b'})
      expect(newCb).toHaveBeenCalledTimes(1)
      expect(renderSpy).toHaveBeenCalledTimes(2)
    })

    it('doesn’t update if extraProps changes but is shallowEqual', () => {
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({a: 'a'})
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
    })

    it('updates if extraProps changes', () => {
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({a: 'a'})
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({a: 'b'})
      expect(instance.state.cb).toHaveBeenCalledTimes(2)
    })

    it('updates if other props change', () => {
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({b: 1})
      expect(instance.state.cb).toHaveBeenCalledTimes(1)
      instance.setState({b: 2})
      expect(instance.state.cb).toHaveBeenCalledTimes(2)
    })
  })
})
