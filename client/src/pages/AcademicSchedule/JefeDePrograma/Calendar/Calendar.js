import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import { Link } from 'react-router-dom'
import Options from '../../../../components/Options'
import { deleteCalendar, fetchCalendars } from '../../../../actions/calendar'

class Calendar extends Component {
  constructor(props) {
    super(props)

    this.handleDelete = this.handleDelete.bind(this)
  }

  componentDidMount() {
    const { fetchCalendars } = this.props
    fetchCalendars()
  }

  handleUrls(id) {
    const urls = [
      '/calendarioAcademico/programacion/show/',
      '/calendarioAcademico/calendario/edit/',
    ]
    return urls.map(url => url.concat(id))
  }

  handleDelete(calendarioId) {
    const confirmDelete = window.confirm('Estas seguro que deseas eliminar?')
    if (confirmDelete) {
      const params = {
        calendarioId,
      }

      const { deleteCalendar } = this.props
      deleteCalendar(params)
    }
  }

  render() {
    const { calendars } = this.props

    return (
      <Fragment>
        <div className="module--container">
          <h3>Calendarios</h3>
          {calendars.length > 0 ? (
            <table className="table">
              <thead className="thead">
                <tr>
                  <th>SEMESTRE</th>
                  <th>FECHA INICIO</th>
                  <th>FECHA FIN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>{this.renderCalendars()}</tbody>
            </table>
          ) : (
            <div>
              <p>No hay eventos todavía...</p>
              <br />
            </div>
          )}

          <Link to="/calendarioAcademico/calendario/create" className="reset--link button">
            Añadir Calendario
          </Link>
        </div>
      </Fragment>
    )
  }

  renderCalendars() {
    const { calendars } = this.props

    if (calendars.length > 0) {
      return calendars.map(calendar => (
        <tr key={calendar._id}>
          <td>{calendar.semestre}</td>
          <td>
            {moment(calendar.fechaInicio)
              .utc()
              .format('l')}
          </td>
          <td>
            {moment(calendar.fechaFin)
              .utc()
              .format('l')}
          </td>
          <Options
            handleDelete={() => this.handleDelete(calendar._id)}
            urls={this.handleUrls(calendar.semestre)}
            state={{ calendar }}
            showTitle={'Ver Programación'}
          />
        </tr>
      ))
    }
  }
}

Calendar.propTypes = {
  match: PropTypes.object.isRequired,
  calendars: PropTypes.any.isRequired,
  fetchCalendars: PropTypes.func.isRequired,
  deleteCalendar: PropTypes.func.isRequired,
}

function mapStateToProps(state) {
  const { errorMessage, calendars } = state.calendar

  return {
    errorMessage,
    calendars,
  }
}

export default connect(
  mapStateToProps,
  { deleteCalendar, fetchCalendars },
)(Calendar)
