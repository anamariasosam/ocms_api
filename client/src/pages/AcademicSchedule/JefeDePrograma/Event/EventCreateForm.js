import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import AditionalInfo from '../../../../components/AditionalInfo'
import Success from '../../../../components/Success'
import Error from '../../../../components/Error'
import { fetchGrupos, createEvent, fetchAttendats, fetchPlaces } from '../../../../actions/event'

class EventCreateForm extends Component {
  constructor(props) {
    super(props)

    this.encargado = React.createRef()
    this.fechaInicio = React.createRef()
    this.fechaFin = React.createRef()
    this.aforo = React.createRef()
    this.grupo = React.createRef()
    this.nombre = React.createRef()
    this.lugar = React.createRef()

    this.handleSubmit = this.handleSubmit.bind(this)
  }

  componentDidMount() {
    const { fetchGrupos, fetchAttendats, fetchPlaces } = this.props
    fetchPlaces()
    fetchGrupos()
    fetchAttendats()
  }

  handleSubmit(e) {
    e.preventDefault()

    const fechaInicio = this.fechaInicio.current.value
    const fechaFin = this.fechaFin.current.value
    const aforo = this.aforo.current.value
    const encargado = this.encargado.current.value
    const lugar = this.lugar.current.value
    const nombre = this.nombre.current && this.nombre.current.value
    const grupo = this.grupo.current && this.grupo.current.value
    const { createEvent, location } = this.props
    const { schedule } = location.state

    const { _id: programacion, nombre: programacionNombre } = schedule

    const data = {
      fechaInicio,
      fechaFin,
      aforo,
      encargado,
      programacion,
      programacionNombre,
      lugar,
      nombre,
      grupo,
    }

    createEvent(data)
  }

  render() {
    const titles = ['tipo', 'fecha Inicio', 'fecha Fin']
    const { profesores, location, lugares } = this.props

    const { schedule } = location.state
    const { fechaInicio, fechaFin } = schedule

    return (
      <Fragment>
        <h2>Programar Evento</h2>

        <AditionalInfo data={schedule} titles={titles} />

        <div className="form--container">
          <h3 className="form--title">Crear Evento</h3>
          <form onSubmit={this.handleSubmit}>
            {this.renderGroups()}

            <label htmlFor="encargado" className="required label">
              Observador:
            </label>
            <select id="encargado" className="input select--input" ref={this.encargado}>
              {profesores.map(encargado => (
                <option key={encargado._id} value={encargado._id}>
                  {encargado.nombre}
                </option>
              ))}
            </select>

            <label htmlFor="aforo" className="required label">
              Aforo:
            </label>
            <input type="number" id="aforo" className="input" ref={this.aforo} required min="1" />

            <label htmlFor="fechaInicio" className="required label">
              Fecha Inicio:
            </label>
            <input
              type="datetime-local"
              id="fechaInicio"
              className="input"
              ref={this.fechaInicio}
              required
              min={fechaInicio.split('.')[0]}
              max={fechaFin.split('.')[0]}
            />

            <label htmlFor="fechaFin" className="required label">
              Fecha Fin:
            </label>
            <input
              type="datetime-local"
              id="fechaFin"
              className="input"
              ref={this.fechaFin}
              required
              min={fechaInicio.split('.')[0]}
              max={fechaFin.split('.')[0]}
            />

            <label htmlFor="lugar" className="required label">
              Lugar:
            </label>
            <select id="lugar" className="input select--input" ref={this.lugar}>
              {lugares &&
                lugares.map(lugar => (
                  <option key={lugar._id} value={lugar._id}>
                    {lugar.nombre}
                  </option>
                ))}
            </select>

            <div className="form--controls">
              <input type="submit" value="Guardar" className="reset--button button" />
            </div>
          </form>

          {this.renderAlert()}
        </div>
      </Fragment>
    )
  }

  renderGroups() {
    const { grupos, location } = this.props
    const { schedule } = location.state

    if (schedule.tipo === 'Programación Académica') {
      return (
        <Fragment>
          <label htmlFor="nombre" className="required label">
            Nombre:
          </label>
          <input type="text" id="nombre" className="input" ref={this.nombre} required />
        </Fragment>
      )
    }

    return (
      <Fragment>
        <label htmlFor="grupo" className="label">
          Grupo:
        </label>
        <select id="grupo" className="input select--input" ref={this.grupo}>
          {grupos &&
            grupos.map(grupoUsuario => {
              const { grupo } = grupoUsuario

              return (
                <option key={grupo._id} value={grupo._id}>
                  {`${grupo.asignatura.nombre}: ${grupo.nombre}`}
                </option>
              )
            })}
        </select>
      </Fragment>
    )
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

EventCreateForm.propTypes = {
  createEvent: PropTypes.func.isRequired,
  fetchGrupos: PropTypes.func.isRequired,
  fetchAttendats: PropTypes.func.isRequired,
  grupos: PropTypes.any.isRequired,
  errorMessage: PropTypes.string,
  successMessage: PropTypes.string,
  profesores: PropTypes.array.isRequired,
  location: PropTypes.object.isRequired,
  lugares: PropTypes.any,
}

function mapStateToProps(state) {
  const { errorMessage, successMessage, grupos, profesores, lugares } = state.event

  return {
    errorMessage,
    successMessage,
    grupos,
    profesores,
    lugares,
  }
}

export default connect(
  mapStateToProps,
  { fetchGrupos, createEvent, fetchAttendats, fetchPlaces },
)(EventCreateForm)
