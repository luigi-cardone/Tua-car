import React from 'react'
import { useState } from 'react'
import { useEffect } from 'react';
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import axios from '../api/axios';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Spinner from 'react-bootstrap/Spinner'
import ErrorModal from '../Views/errorModal';
import SuccessModal from '../Views/successModal';
export default function EditUser(props) {
    const [user, setUser] = useState(props.user)
    const [locationInfo, setLocationInfo] = useState([])
    const axiosPrivate = useAxiosPrivate()
    const [error, setError] = useState({error: false, message: ""})
    const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        setUser(props.user)
    }, [props.user]);

    const handleClose = () =>{
        props.handleClose("closeEdit")
        setIsSuccess(false)
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try {
            setIsLoading(true)
            const res = await axiosPrivate.post("/user/updateUser", user);
            setIsLoading(false)
            setIsSuccess(true)
        } catch (err) {
            setIsLoading(false)
            setError({error : true, message : err.message})
          }

    }

    const CreateStateOptions = (locations) =>{
        var ret = []
        ret.push(locations.map((location, index) =>{
            return (<option value={location.city} key={location.city}>{location.city}</option>)
        }))
        return ret
    }

    const getInfoByZip = async (zip) =>{
        try {
            console.log(zip)
            const res = await axios.get("/geoData/infoByZip"+zip);
            var data = res.data;
            var options = []
            data.forEach((town,) =>{
                options.push({region: town.regione, city: town.comune, state: town.comune})
            })
            setUser({...user, zip: zip, state: options[0].state, region: options[0].region})
            options = CreateStateOptions(options)
            setLocationInfo(options)
          } catch (err) {
            console.log(err);
          }
    }


  return (
        <Modal show={props.show} onHide={handleClose}>
            <ErrorModal title="Errore" message={error.message} show={error.error}/>
            <SuccessModal title="Operazione completata" message="Utente modificato con successo" show={isSuccess}/>
            <div className="modal-content">
                    <form id="editUserForm" method="post" className="needs-validation" noValidate onSubmit={handleSubmit}>
                        <Modal.Header className="modal-header">
                            <h5 className="modal-title" id="editUserLabel">Modifica utente</h5>
                            <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
                        </Modal.Header>
                        <Modal.Body className="modal-body">
                            <div className="row mt-2">
                                <div className="col-md-6">
                                    <div className="form-floating mb-1">
                                        {/* <!--input type="text" className="form-control" name="status" id="status" value="" placeholder="Status utente" required--> */}
                                        <select value={user.status} onChange={(e) => setUser({...user, status: e.target.value})} className="form-select" name="status" id="status" placeholder="Status utente" required>
                                            <option value="0">Account attivo</option>
                                            <option value="2">Account bannato</option>
                                            <option value="4">Attesa revisione</option>
                                            <option value="5">Account sospeso</option>
                                        </select>
                                        <label htmlFor="status"><span className="text-danger">*</span> Status utente</label>
                                        <div className="invalid-feedback">Indica uno status per l'utente</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-1">
                                        <select value={user.roles_mask} onChange={(e) => setUser({...user, roles_mask: e.target.value})} className="form-select" name="roles" id="roles" placeholder="Ruolo utente" required>
                                            <option value="0">-- non assegnato --</option>
                                            <option value="16">Utente normale</option>
                                            <option value="1">Amministratore</option>
                                        </select>
                                        <label htmlFor="roles"><span className="text-danger">*</span> Ruolo utente</label>
                                        <div className="invalid-feedback">Indica uno ruolo per l'utente</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input value={user.email} onChange={(e) => setUser({...user, email: e.target.value})} type="text" className="form-control" name="email" id="email" placeholder="Email" required/>
                                        <label htmlFor="email"><span className="text-danger">*</span> Email</label>
                                        <div className="invalid-feedback">Inserisci un indirizzo email valido!</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input value={user.name} onChange={(e) => setUser({...user, name: e.target.value})} type="text" className="form-control" name="name" id="name" placeholder="Nome Cognome" required/>
                                        <label htmlFor="name"><span className="text-danger">*</span> Nome Cognome</label>
                                        <div className="invalid-feedback">Inserisci nome e cognome!</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input value={user.company} onChange={(e) => setUser({...user, company: e.target.value})} type="text" className="form-control" name="company" id="company" placeholder="Ragione Sociale" required/>
                                        <label htmlFor="company"><span className="text-danger">*</span> Ragione Sociale</label>
                                        <div className="invalid-feedback">Inserisci Ragione Sociale!</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-1">
                                        <input value={user.vat_number} onChange={(e) => setUser({...user, vat_number: e.target.value})} type="text" className="form-control" name="vat_number" id="vat_number" placeholder="P.Iva" />
                                        <label htmlFor="vat_number"> P.Iva</label>
                                        <div className="invalid-feedback">Inserisci P.Iva!</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="form-floating mb-1">
                                        <input value={user.ssn_number} onChange={(e) => setUser({...user, ssn_number: e.target.value})} type="text" className="form-control" name="ssn_number" id="ssn_number" placeholder="Codice Fiscale" />
                                        <label htmlFor="ssn_number"> Codice Fiscale</label>
                                        <div className="invalid-feedback">Inserisci Codice Fiscale!</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input onChange={(e) => setUser({...user, phone: e.target.value})} value={user.phone} type="text" className="form-control" name="phone" id="phone" placeholder="Telefono" />
                                        <label htmlFor="phone"> Telefono</label>
                                        <div className="invalid-feedback">Inserisci un recapito telefonico!</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input value={user.address} onChange={(e) => setUser({...user, address: e.target.value})} type="text" className="form-control" name="address" id="address" placeholder="Indirizzo" required />
                                        <label htmlFor="address"><span className="text-danger">*</span> Indirizzo</label>
                                        <div className="invalid-feedback">Inserisci l'indirizzo!</div>
                                    </div>
                                </div>
                                <div className="col-md-12">
                                    <div className="row">
                                        <div className="col">
                                            <div className="form-floating mb-1">
                                                <input value={user.zip} onChange={(e) => {setUser({...user, zip: e.target.value}); getInfoByZip(e.target.value)}} type="number" className="form-control" name="zip" id="zip" placeholder="CAP" required />
                                                <label htmlFor="zip"><span className="text-danger">*</span> CAP</label>
                                                <div className="invalid-feedback">Inserisci il CAP!</div>
                                            </div>
                                        </div>
                                        <div className="col">
                                            <div className="form-floating mb-1">
                                                <select onChange={(e) =>setUser({...user, city: e.target.value})} value={user.city}  className="form-select" name="city" id="city" placeholder="Indica il CAP per selezionare la località" required>
                                                <option value="">Seleziona</option>
                                                {locationInfo}
                                            </select>
                                                <label htmlFor="city"><span className="text-danger">*</span> Località</label>
                                                <div className="invalid-feedback">Seleziona una località!</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Modal.Body>
                        <Modal.Footer className="modal-footer">
                            <Button onClick={handleClose} type="button" className="btn btn-secondary" data-bs-dismiss="modal">Chiudi</Button>
                            <Button disabled={isLoading} onClick={handleSubmit} type="submit" id="editSpokiUserFormSubmit" className="btn btn-primary">{isLoading && <Spinner as="span" animation="grow" size="sm" role="status" aria-hidden="true" />}Salva modifiche</Button>
                        </Modal.Footer>
                    </form>
            </div>
        </Modal>
  )
}
