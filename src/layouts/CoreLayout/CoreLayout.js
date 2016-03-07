import React, { PropTypes } from 'react'
import Relay from 'react-relay'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import LoginForm from 'components/LoginForm/LoginForm'
import ProjectSelection from 'components/ProjectSelection/ProjectSelection'
import Header from 'components/Header/Header'
import SideNav from 'components/SideNav/SideNav'
import LoginMutation from 'mutations/LoginMutation'
import AddProjectMutation from 'mutations/AddProjectMutation'
import { saveToken, updateNetworkLayer } from 'utils/relay'
import classes from './CoreLayout.scss'

import '../../styles/core.scss'

export class CoreLayout extends React.Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    viewer: PropTypes.object.isRequired,
    params: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props)

    this._addProject = ::this._addProject
    this._login = ::this._login
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (!this._checkProjects(nextProps.viewer.user.projects, nextProps.params.projectId)) {
      return false
    }

    return PureRenderMixin.shouldComponentUpdate(nextProps, nextState)
  }

  componentWillMount () {
    if (this.props.viewer.user) {
      this._checkProjects(this.props.viewer.user.projects, this.props.params.projectId)
    }
  }

  _checkProjects (projects, selectedProjectId) {
    const projectIds = projects.map((project) => project.id)
    if (!projectIds.includes(selectedProjectId)) {
      this.context.router.replace(`/${projectIds[0]}`)
      return false
    }

    return true
  }

  _addProject () {
    const projectName = window.prompt('Project name')
    if (projectName) {
      Relay.Store.commitUpdate(new AddProjectMutation({ projectName, user: this.props.viewer.user }))
    }
  }

  _login (email, password) {
    const payload = { email, password, viewer: this.props.viewer }
    const onSuccess = (response) => {
      saveToken(response.signinUser.token)
      updateNetworkLayer()
    }
    Relay.Store.commitUpdate(new LoginMutation(payload), { onSuccess })
  }

  render () {
    if (!this.props.viewer.user) {
      return (
        <LoginForm login={this._login} />
      )
    }

    const projects = this.props.viewer.user.projects
    const selectedProject = projects.find((project) => project.id === this.props.params.projectId)

    // render nothing since redirect is scheduled
    if (!selectedProject) {
      return false
    }

    return (
      <div className={classes.root}>
        <header className={classes.header}>
          <div className={classes.headerLeft}>
            <ProjectSelection
              projects={projects}
              selectedProject={selectedProject}
              add={this._addProject}
            />
          </div>
          <div className={classes.headerRight}>
            <Header />
          </div>
        </header>
        <div className={classes.main}>
          <div className={classes.sidenav}>
            <SideNav
              params={this.props.params}
              project={selectedProject}
              />
          </div>
          <div className={classes.content}>
            {this.props.children}
          </div>
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(CoreLayout, {
  fragments: {
    viewer: () => Relay.QL`
      fragment on Viewer {
        id
        user {
          name
          projects {
            id
            name
            ${SideNav.getFragment('project')}
          }
        }
      }
    `,
  },
})
