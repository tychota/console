import * as React from 'react'
import { updateNetworkLayer } from '../../utils/relay'
import { getQueryVariable } from '../../utils/location'
import tracker from '../../utils/metrics'
import * as cookiestore from 'cookiestore'

export default class TokenRedirectView extends React.Component<{}, {}> {

  componentWillMount () {
    const token = getQueryVariable('token')
    if (token) {
      tracker.reset()
      cookiestore.set('graphcool_auth_token', token)
      cookiestore.set('graphcool_customer_id', 'tmp')
      updateNetworkLayer()
      window.location.href = window.location.origin
    }
  }

  render () {
    return (
      <div>Redirecting...</div>
    )
  }
}
