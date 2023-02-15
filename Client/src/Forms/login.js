import logo from '../assets/imgs/header_logo.png'
import { useState, useRef, useEffect } from 'react'
import useAuth from '../hooks/useAuth'
import axios from "../api/axios.js";
import { Link, useNavigate, useLocation } from 'react-router-dom'
import Spinner from 'react-bootstrap/esm/Spinner';
import ErrorModal from '../Views/errorModal';
const LOGIN_URL = '/login'

export const Login = (props) => {
    const {setAuth, persist, setPersist} = useAuth();
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || "/"
    const [isLoading, setIsLoading] = useState(false)

    const userRef = useRef();
    const errRef = useRef();
    const [credentials, setCredentials] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState({error: false, message: ""})

    useEffect(() =>{
        userRef.current.focus()
    }, [])
    useEffect(() =>{
        setError({error: false})
    }, [credentials.email, credentials.password])


    const togglePersist = () =>{
        setPersist(prev => !prev)
    }

    useEffect(() =>{
        localStorage.setItem("persist", persist)
    }, [persist])

    const handleSubmit = async (e) =>{
        e.preventDefault();

        try{
            setIsLoading(true)
            const res = await axios.post(LOGIN_URL,
                    JSON.stringify(credentials),
                    {
                        headers: {'Content-Type' : 'application/json'},
                        withCredentials: true
                    }
                      )
            const accessToken = res?.data?.accessToken
            const roles = res?.data?.roles
            const id = res?.data?.user_id
            const email = credentials.email
            const name = res?.data?.name
            setAuth({email, id, name, roles, accessToken})
            setIsLoading(false)
            setCredentials({
            email: "",
            password: ""
            })
            navigate(from, {replace : true})
        }
        catch (err){
            setIsLoading(false)
            if(err.response?.status === 400){
                setError({error : true, message : "Missing username or password"})
            }
            else if(err.response?.status === 401){
                setError({error : true, message : "Unauthorized"})
            }
            else if(!err?.response) {
                setError({error : true, message : "No Server Response"})
            }
            else {
                setError({error : true, message : "Login Failed"})
            }
            errRef.current.focus();
        }
    }

  return (
        <div style={{display : "flex", justifyContent : "center"}} className="form-central">
            {isLoading && 
                        (       
                            <div style={{ top: "0%",  left : "0%", background: "rgba(0, 0, 0, .5)", position: "absolute", width : "100%", height: "100%", zIndex: 90}}>     
                                <Spinner style={{position: "absolute",top: "50%",  left : "50%", zIndex: 100}} variant='warning' animation='grow'/>
                            </div>
                            )            
                            }
            <div style={{width: "450px"}} className="card">
                <img src={logo} className="card-img-top" alt="TuaCar"/>
                <div className="card-body">
                    <h5 className="card-title">Autenticazione</h5>
                    <div ref={errRef} style={{display: !error.error? 'none' : 'block'}} id="formError" aria-live='assertive' className="alert alert-danger" role="alert">{error.message}</div>
                    <form onSubmit={handleSubmit} id="login" method="post" action="login">
                        <div className="form-floating mb-1">
                            <input value={credentials.email} ref={userRef} onChange={(e) => setCredentials({...credentials, email: e.target.value})} name="email" type="email" className="form-control" id="floatingInput" placeholder="name@example.com"/>
                            <label htmlFor="floatingInput">Indirizzo email</label>
                        </div>
                        <div className="form-floating mb-1">
                            <input value={credentials.password} onChange={(e) => setCredentials({...credentials, password: e.target.value})} autoComplete='on' name="password" type="password" className="form-control" id="floatingPassword" placeholder="Password"/>
                            <label htmlFor="floatingPassword">Password</label>
                        </div>
                        <div className="checkbox mb-3">
                            <label><input onChange={togglePersist} name="remember" type="checkbox" checked={persist} /> Ricordami</label>
                        </div>
                        <button className="w-100 btn btn-lg btn-primary" type="submit">Entra</button>
                    </form>
                    <p className="mt-5 mb-3 text-muted">Non hai un account? <Link to="/register"><b>Registrati</b></Link></p>

                </div>
            </div>

        </div>
  )
}
