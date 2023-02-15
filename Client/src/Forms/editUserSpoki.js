import React from 'react'
import { useState } from 'react'
import Modal from 'react-bootstrap/Modal'
import Button from 'react-bootstrap/Button'
import { useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import Spinner from 'react-bootstrap/Spinner'
import ErrorModal from '../Views/errorModal';
import SuccessModal from '../Views/successModal';

export default function EditUserSpoki(props) {
    const [user, setUser] = useState(props.user)
    const axiosPrivate = useAxiosPrivate()
    const [error, setError] = useState({error: false, message: ""})
    const [isSuccess, setIsSuccess] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    useEffect(() => {
        setUser(props.user)
    }, [props.user]);

    const handleClose = () =>{
        props.handleClose("closeSpoki")
        setIsSuccess(false)
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try {
            setIsLoading(true)
            await axiosPrivate.post("/user/updateUserSpoki", user);
            setIsLoading(false)
            setIsSuccess(true)
        } catch (err) {
            setIsLoading(false)
            setError({error: true, message: err.message})
        }

    }

  return (
        <Modal show={props.show} onHide={handleClose}>
            <ErrorModal title="Errore" message={error.message} show={error.error}/>
            <SuccessModal title="Operazione completata" message="Utente modificato con successo" show={isSuccess}/>
            <div className="modal-content">
                <form id="editSpokiUserForm" method="post" className="needs-validation" noValidate onSubmit={handleSubmit}>
                    <Modal.Header className="modal-header">
                        <h5 className="modal-title" id="editSpokiUserLabel">Modifica dati Spoki per l'utente</h5>
                        <button onClick={handleClose} type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Chiudi"></button>
                    </Modal.Header>
                    <Modal.Body className="modal-body">
                        
                            <div className="row mt-2">

                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input value={user.spoki_api} type="text" className="form-control" name="spokiApiKey" id="spokiApiKey" onChange={(e) => {setUser({...user, spoki_api : e.target.value})}} placeholder="Api Key" required/>
                                        <label htmlFor="spokiApiKey"><span className="text-danger">*</span> spokiApiKey</label>
                                        <div className="invalid-feedback">Inserisci un valore ApiKey valido</div>
                                    </div>
                                </div>
                            <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <input value={user.Secret} type="text" className="form-control" name="spokiServiceKey" id="spokiServiceKey" onChange={(e) => {setUser({...user, Secret : e.target.value})}} placeholder="Api Key" required/>
                                        <label htmlFor="spokiServiceKey"><span className="text-danger">*</span> spokiServiceKey</label>
                                        <div className="invalid-feedback">Inserisci un valore spokiServiceKey valido</div>
                                    </div>
                                </div>
								<div className="form-floating mb-1">
                                        <input value={user.uuID} type="text" className="form-control" name="uuID" id="uuID" onChange={(e) => {setUser({...user, uuID : e.target.value})}} placeholder="uuID link" required/>
                                        <label htmlFor="spokiServiceKey"><span className="text-danger">*</span> link uuID</label>
                                        <div className="invalid-feedback">Inserisci un valore uuID valido</div>
                                </div>
                                <div className="col-md-12">
                                    <div className="form-floating mb-1">
                                        <div className="form-check form-switch">
                                            <input className="form-check-input" checked={user.IsSpokiEnabled} onChange={(e) => {setUser({...user, IsSpokiEnabled : e.target.checked})}} type="checkbox" name="enableSpoki" id="enableSpoki" value="1"/>
                                            <label htmlFor="enableSpoki" className="form-check-label"> Abilita / Disabilita Spoki per questo utente</label>
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
