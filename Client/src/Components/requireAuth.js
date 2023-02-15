import { useLocation, Navigate, Outlet} from 'react-router-dom'
import useAuth from '../hooks/useAuth'

const RequiredAuth = ({allowedRoles}) =>{
    const { auth } = useAuth()
    const location = useLocation()
    return (
        auth?.roles?.find(role => allowedRoles.includes(role))
            ? <Outlet />
            : auth?.id
                ? <Navigate to="/unuthorized" state={{from: location}} replace /> 
                : <Navigate to="/login" state={{from: location}} replace/>
    )
}

export default RequiredAuth