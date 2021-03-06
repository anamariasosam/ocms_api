import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { connect } from 'react-redux'
import DownloadExcel from 'react-html-table-to-excel'
import AditionalInfo from '../../../../components/AditionalInfo'
import ExcelTable from '../../../../components/ExcelTable'
import Error from '../../../../components/Error'
import Success from '../../../../components/Success'
import {
  fetchGrupos,
  createEvents,
  fetchAsignaturasEventos,
  fetchAttendats,
} from '../../../../actions/event'

class EventsCreateForm extends Component {
  constructor(props) {
    super(props)

    this.fecha = React.createRef()
    this.toolbarDOM = React.createRef()

    this.state = {
      grupos: {},
    }

    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleSticky = this.handleSticky.bind(this)
  }

  componentDidMount() {
    const { fetchGrupos, fetchAsignaturasEventos, fetchAttendats, location } = this.props
    const { schedule } = location.state
    const { nombre } = schedule
    const semestre = nombre.slice(0, 6)

    fetchGrupos({ semestre })
    fetchAsignaturasEventos({ programacionNombre: nombre })
    fetchAttendats()

    document.addEventListener('scroll', this.handleSticky)
  }

  shouldComponentUpdate(nextProps, nextState) {
    return (
      this.props.asignaturasEventos !== nextProps.asignaturasEventos ||
      this.props.grupos !== nextProps.grupos
    )
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.handleSticky)
  }

  handleSticky() {
    const scroll = window.innerHeight + window.pageYOffset
    const limit = document.body.offsetHeight - 450

    if (scroll > limit) {
      this.toolbarDOM.current.style.bottom = `${scroll - limit}px`
    } else {
      this.toolbarDOM.current.style.bottom = 0
    }
  }

  handleSubmit(e) {
    e.preventDefault()

    const { grupos } = this.state

    const { createEvents, location } = this.props
    const { schedule } = location.state
    const { _id: programacion, nombre: programacionNombre } = schedule

    const data = {
      grupos,
      programacion,
      programacionNombre,
    }

    createEvents(data)
  }

  handleInputChange(e) {
    const { grupos } = this.state
    const { id: event, value } = e.target

    const evento = {}
    evento[event] = (grupos[event] && { ...grupos[event] }) || {}
    evento[event].encargado = document.querySelector(`.docente-${event}`).id
    evento[event][e.target.name] = value

    if (e.target.name === 'fechaInicio') {
      evento[event][e.target.name] = moment(new Date(value))
        .utc(-5)
        .toISOString()
      evento[event].fechaFin = moment(new Date(value))
        .utc(-5)
        .add(2, 'hours')
        .toISOString()
    }

    if (e.target.name === 'encargado' && value === '') {
      evento[event][e.target.name] = document.querySelector(`.docente-${event}`).id
    }

    const newEvents = Object.assign(grupos, evento)

    this.setState({
      grupos: newEvents,
    })
  }

  render() {
    const titles = ['tipo', 'fecha Inicio', 'fecha Fin']
    const { location, asignaturasEventos, grupos } = this.props
    const { schedule } = location.state
    const { tipo, nombre } = schedule
    const semestre = nombre && nombre.slice(0, 6)
    const fileName = `${semestre} ${tipo}`

    return (
      <Fragment>
        <h2>Programar Evento</h2>

        <AditionalInfo data={schedule} titles={titles} />

        <div>
          <h3 className="form--title">Programación discriminada por nivel</h3>

          <form onSubmit={this.handleSubmit}>
            {grupos.length > 0 ? (
              <table className="table">
                <thead className="thead">
                  <tr>
                    <th>NIVEL</th>
                    <th>GRUPO</th>
                    <th className="fixedWidth">NOMBRE ASIGNATURA</th>
                    <th>FECHA / HORA</th>
                    <th className="aforo-th">N° ESTUDIANTES</th>
                    <th className="fixedWidth">DOCENTE</th>
                    <th className="fixedWidth">OBSERVADOR</th>
                  </tr>
                </thead>
                <tbody>{this.renderAsignaturas()}</tbody>
              </table>
            ) : (
              <div className="module--container center">
                <img src={require('../../../../images/loading.svg')} alt="loading" />
              </div>
            )}

            <div className="form--controls toolbar sticky-in" ref={this.toolbarDOM}>
              <input type="submit" value="Guardar" className="reset--button button" />
              {Object.keys(asignaturasEventos).length > 0 && (
                <DownloadExcel
                  className="button"
                  sheet=""
                  table="excelTable"
                  filename={fileName}
                  buttonText="Descargar Excel"
                />
              )}
            </div>
          </form>
          {Object.keys(asignaturasEventos).length > 0 && (
            <ExcelTable events={asignaturasEventos} programacionNombre={nombre} />
          )}
          {this.renderAlert()}
        </div>
      </Fragment>
    )
  }

  renderAsignaturas() {
    const { location, grupos, profesores, asignaturasEventos } = this.props
    const { schedule } = location.state
    const { fechaInicio, fechaFin } = schedule

    return grupos.map(grupoUsuario => {
      const { grupo, usuario } = grupoUsuario
      const { nombre: docente, _id: docenteId } = usuario
      const { asignatura, nombre } = grupo
      const rowClass = asignatura.nivel % 2 === 0 ? 'par' : 'impar'
      const encargado = asignaturasEventos[grupo._id] ? asignaturasEventos[grupo._id].encargado : ''
      return (
        <tr key={grupo._id} className={rowClass}>
          <td className="center">{asignatura.nivel}</td>
          <td className={`grupo-${grupo._id}`}>{nombre}</td>
          <td className={`asignatura-${grupo._id} fixedWidth`}>{asignatura.nombre}</td>
          <td>
            <input
              type="datetime-local"
              id={grupo._id}
              name="fechaInicio"
              className="input events--inputs"
              onChange={this.handleInputChange}
              min={fechaInicio.split('.')[0]}
              max={fechaFin.split('.')[0]}
              defaultValue={
                asignaturasEventos[grupo._id] &&
                asignaturasEventos[grupo._id].fechaInicio.split('.')[0]
              }
            />
          </td>
          <td>
            <input
              type="number"
              id={grupo._id}
              className="input events--inputs aforo--input"
              onChange={this.handleInputChange}
              name="aforo"
              defaultValue={asignaturasEventos[grupo._id] && asignaturasEventos[grupo._id].aforo}
            />
          </td>
          <td className={`docente-${grupo._id}`} id={docenteId}>
            {docente}
          </td>
          <td>
            {profesores.length > 0 ? (
              <select
                className="input select--input events--inputs"
                onChange={this.handleInputChange}
                id={grupo._id}
                name="encargado"
              >
                <option value="" />
                {profesores.map(profesor => (
                  <option
                    key={profesor._id}
                    value={profesor._id}
                    selected={encargado === profesor._id}
                  >
                    {profesor.nombre}
                  </option>
                ))}
              </select>
            ) : (
              ''
            )}
          </td>
        </tr>
      )
    })
  }

  renderAlert() {
    const { errorMessage, successMessage } = this.props

    if (errorMessage) {
      return <Error description={errorMessage} />
    }

    if (successMessage) {
      return <Success description={successMessage} />
    }
  }
}

EventsCreateForm.propTypes = {
  fetchGrupos: PropTypes.func.isRequired,
  createEvents: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  location: PropTypes.object.isRequired,
}

function mapStateToProps(state) {
  const {
    errorMessage,
    successMessage,
    asignaturas,
    grupos,
    profesores,
    asignaturasEventos,
  } = state.event

  return {
    errorMessage,
    successMessage,
    asignaturas,
    grupos,
    profesores,
    asignaturasEventos,
  }
}

export default connect(
  mapStateToProps,
  { fetchAttendats, fetchAsignaturasEventos, fetchGrupos, createEvents },
)(EventsCreateForm)
