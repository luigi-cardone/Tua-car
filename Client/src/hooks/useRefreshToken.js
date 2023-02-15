import axios from '../api/axios'
import useAuth from './useAuth'

export default function useRefreshToken() {
    const { setAuth} = useAuth()

    const refresh = async () =>{
        const res = await axios.get('/refresh', {
            withCredentials : true
        })
        setAuth(prev => {
            console.log(JSON.stringify(prev))
            return {
                ...prev, 
                roles: res.data.roles,
                name: res.data.name,
                id: res.data.user_id,
                accessToken : res.data.accesstoken
            }
        })
        return res.data.accessToken
    }

  return refresh
}
