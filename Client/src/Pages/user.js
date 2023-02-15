import React, { useState, useEffect } from 'react'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import useAuth from '../hooks/useAuth'
import Spinner from 'react-bootstrap/Spinner'
import ErrorModal from '../Views/errorModal'

const UserMenu = () => {
  const { auth } = useAuth()
  const [user, setUser] = useState({})
  const axiosPrivate = useAxiosPrivate()
  const [error, setError] = useState({erro: false, message: ""})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() =>{  
    const fetchUser = async () => {
      try {
            setIsLoading(true)
            const res = await axiosPrivate.get('/user/user/'+auth.id);
            setIsLoading(false)
            setUser(res.data[0])
        } catch (err) {
        setIsLoading(false)
        setError({error: true, message : err.message})
        console.log(err.message);
    }
};
fetchUser();
}, [])

const handleSubmit = async (e) =>{
    e.preventDefault()
    try {
        setIsLoading(true)
        const res = await axiosPrivate.post('/user/updateUser', user);
        setIsLoading(false)
        console.log(res.data)
    } 
    catch (err) {
        setIsLoading(false)
        setError({error: true, message : err.message})
          console.log(err.message);
    }
  }
  return (
    <div class="container rounded bg-white mt-5 mb-5">
        <ErrorModal title="Errore" message={error.message} show={error.error}/>
        {isLoading && 
        (       
            <div style={{ top: "0%",  left : "0%", background: "rgba(0, 0, 0, .5)", position: "absolute", width : "100%", height: "100%", zIndex: 90}}>     
                <Spinner style={{position: "absolute",top: "50%",  left : "50%", zIndex: 100}} variant='warning' animation='grow'/>
            </div>
            )            
            }
        <div class="row">
            <div class="col-md-3 border-right">
                <div class="d-flex flex-column align-items-center text-center p-3 py-5"><i class="fa-solid fa-circle-user fa-5x text-secondary"></i><span class="fs-5 font-weight-bold">{auth.name}</span><span class="text-black-50">{auth.email}</span><span> </span></div>
            </div>
            <div class="col-md-5 border-right">
                <form method="post" action="updateUser" class="requires-validation" onSubmit={handleSubmit}>
                    <div class="p-3 py-5">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h4 class="text-right">Profilo utente</h4>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-12">
                                <div class="form-floating mb-1">
                                    <input type="text" class="form-control" name="name" id="name" value={user.name} onChange={(e) => setUser({...user, name : e.target.value})} placeholder="Nome Cognome" required/>
                                    <label for="name"><span class="text-danger">*</span> Nome Cognome</label>
                                    <div class="invalid-feedback">Inserisci nome e cognome!</div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating mb-1">
                                    <input type="text" class="form-control" name="company" id="company" value={user.company} onChange={(e) => setUser({...user, company : e.target.value})} placeholder="Ragione Sociale" required/>
                                    <label for="company"><span class="text-danger">*</span> Ragione Sociale</label>
                                    <div class="invalid-feedback">Inserisci Ragione Sociale!</div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating mb-1">
                                    <input type="text" class="form-control" name="phone" id="phone" value={user.phone} onChange={(e) => setUser({...user, phone : e.target.value})} placeholder="Telefono" required/>
                                    <label for="phone"><span class="text-danger">*</span> Telefono</label>
                                    <div class="invalid-feedback">Inserisci un recapito telefonico!</div>
                                </div>
                            </div>
                            <div class="col-md-12">
                                <div class="form-floating mb-1">
                                    <input type="text" class="form-control" name="indirizzo" id="indirizzo" value={user.address} onChange={(e) => setUser({...user, address : e.target.value})} placeholder="Indirizzo" required/>
                                    <label for="indirizzo"><span class="text-danger">*</span> Indirizzo</label>
                                    <div class="invalid-feedback">Inserisci l'indirizzo!</div>
                                </div>
                            </div>
                        </div>
                        <div class="mt-5 text-center"><button class="btn btn-primary profile-button" type="submit" id="saveProfile">Salva profilo</button></div>
                    </div>

                </form>
            </div>
            <div class="col-md-4">
                <div class="p-3 py-5">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h4 class="text-right">Modifica password</h4></div>
                    <div class="row">
                        <div class="col-md-12">
                            <div class="form-floating mb-1">
                                <input pattern=".{8,20}" type="password" class="form-control" name="oldpassword" id="oldpassword" placeholder="Password attuale" required/>
                                <label for="oldpassword"><span class="text-danger">*</span> Password attuale</label>
                                <div class="invalid-feedback">Password attuale richiesta!</div>
                            </div>
                            <div class="form-floating mb-1">
                                <input pattern=".{8,20}" type="password" class="form-control" name="password" id="password" placeholder="Nuova password" required/>
                                <label for="password"><span class="text-danger">*</span> Nuova password</label>
                                <div class="invalid-feedback">La password deve avere minimo 8 e massimo 20 caratteri!</div>
                            </div>
                            <div class="form-floating mb-1">
                                <input pattern=".{8,20}" type="password" class="form-control" name="password_confirm" id="password_confirm" placeholder="Conferma nuova password" required/>
                                <label for="password_confirm"><span class="text-danger">*</span> Conferma nuova password</label>
                                <div class="invalid-feedback">Le password non coincidono!</div>
                            </div>
                        </div>
                    </div>
                    <div class="mt-5 text-center"><button class="btn btn-primary profile-button" type="button" id="passwordChange">Modifica password</button></div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default UserMenu
