import React, { Fragment, Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import moment from 'moment'
import Options from '../../../../components/Options'
import AditionalInfo from '../../../../components/AditionalInfo'
import { deleteAgenda, fetchAgenda } from '../../../../actions/agenda'
import { fetchCalendars } from '../../../../actions/calendar'

class Agenda extends Component {
  constructor(props) {
    super(props)

    this.handleDelete = this.handleDelete.bind(this)
  }

  componentDidMount() {
    const { match } = this.props
    const { semestre } = match.params
    this.handleAgenda(semestre)
  }

  handleAgenda(semestre) {
    const { fetchCalendars, fetchAgenda } = this.props
    fetchCalendars({ semestre })
    fetchAgenda({ semestre })
  }

  // eslint-disable-next-line class-methods-use-this
  handleUrls(id, discriminadaPorNivel) {
    const showUrl = discriminadaPorNivel
      ? '/calendarioAcademico/evento/asignaturas/'
      : '/calendarioAcademico/evento/show/'
    const urls = [showUrl, '/calendarioAcademico/programacion/edit/']

    return urls.map(url => url.concat(id))
  }

  handleDelete(id) {
    const confirmDelete = window.confirm('Estas seguro que deseas eliminar?')
    if (confirmDelete) {
      const { calendars, deleteAgenda } = this.props
      const calendarioId = calendars._id
      const programacionId = id

      const params = {
        calendarioId,
        programacionId,
      }

      deleteAgenda(params)
    }
  }

  render() {
    const titles = ['semestre', 'fecha Inicio', 'fecha Fin']
    const { schedules, calendars } = this.props
    return (
      <Fragment>
        <AditionalInfo data={calendars} titles={titles} />

        <div className="module--container">
          <h3>Programaciones</h3>
          {schedules.length > 0 ? (
            <table className="table">
              <thead className="thead">
                <tr>
                  <th>NOMBRE</th>
                  <th>FECHA INICIO</th>
                  <th>FECHA FIN</th>
                  <th>ACCIONES</th>
                </tr>
              </thead>
              <tbody>{this.renderSchedule()}</tbody>
            </table>
          ) : (
            <div>
              <p>No hay programaciones todavía...</p>
              <br />
            </div>
          )}

          <Link
            to={{
              pathname: '/calendarioAcademico/programacion/create',
              state: { calendar: calendars },
            }}
            className="reset--link button"
          >
            Añadir Programación
          </Link>
        </div>
      </Fragment>
    )
  }

  renderSchedule() {
    const { schedules, calendars } = this.props
    return schedules.map(schedule => (
      <tr key={schedule._id}>
        <td>{schedule.tipo}</td>
        <td>
          {moment(schedule.fechaInicio)
            .utc()
            .format('l')}
        </td>
        <td>
          {moment(schedule.fechaFin)
            .utc()
            .format('l')}
        </td>
        <Options
          handleDelete={() => this.handleDelete(schedule._id)}
          urls={this.handleUrls(schedule.nombre, schedule.discriminadaPorNivel)}
          state={{ calendar: calendars, schedule }}
          showTitle={'Ver Eventos'}
        />
      </tr>
    ))
  }
}

Agenda.propTypes = {
  match: PropTypes.object.isRequired,
  calendars: PropTypes.any.isRequired,
  fetchCalendars: PropTypes.func.isRequired,
  fetchAgenda: PropTypes.func.isRequired,
  deleteAgenda: PropTypes.func.isRequired,
  schedules: PropTypes.any.isRequired,
}

function mapStateToProps(state) {
  const { errorMessage, schedules } = state.agenda
  const { calendars } = state.calendar

  return {
    errorMessage,
    schedules,
    calendars,
  }
}

export default connect(
  mapStateToProps,
  { deleteAgenda, fetchAgenda, fetchCalendars },
)(Agenda)
