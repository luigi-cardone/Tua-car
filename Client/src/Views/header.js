import React, { useEffect } from 'react'
import logo from '../assets/imgs/header_logo.png'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Dropdown from 'react-bootstrap/Dropdown'
import useLogout from '../hooks/useLogout'

export const Header = () => {
  const { auth } = useAuth()
  const logout = useLogout()

  useEffect(() =>{
    console.log(auth)
  }, [auth])
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark p-0"  style={{fontSize: "1.2rem"}}>
    <div className="container-fluid">
        <a className="navbar-brand" href="/">
            <img width={"50%"} src={logo} alt=""/>
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0 ms-lg-4">
            <li className="nav-item">
              <Link className="nav-link" to="/"><i className="fa-solid fa-magnifying-glass fa-lg text-success"></i> Ricerca</Link>
            </li>
            <li className="nav-item">
            <Link className="nav-link" to={"history/"+auth.id}><i className="fa-solid fa-file-csv fa-lg text-primary"></i> Archivio CSV</Link>
            </li>
            {auth?.roles?.find(role => role === 1) && 
            (<li className="nav-item">
              <Link className="nav-link" to="/admin"><i className="fa-solid fa-users fa-lg text-warning"></i> Franchise</Link>
            </li>)}
        </ul>
        <div className="navbar-nav">
            <Dropdown className="d-flex nav-item dropdown">
              <Dropdown.Toggle style={{backgroundColor : '#212529'}} variant='secondary' className="nav-link dropdown-toggle" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <i className="fa-solid fa-user fa-lg text-info"></i> {auth?.name} 
              </Dropdown.Toggle>
              <Dropdown.Menu className="dropdown-menu" aria-labelledby="navbarDropdown">
                  <Dropdown.Item><Link to='/user' className="dropdown-item"><i className="fa-solid fa-id-card"></i> Profilo</Link></Dropdown.Item>
                  <li><hr className="dropdown-divider"/></li>
                  <Dropdown.Item><div className="dropdown-item" onClick={async () => await logout()}><i className="fa-solid fa-power-off"></i> Disconetti</div></Dropdown.Item>
              </Dropdown.Menu>
          </Dropdown>
        </div>
        </div>
    </div>
    </nav>
  )
}
