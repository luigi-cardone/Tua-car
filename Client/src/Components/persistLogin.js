import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import useRefreshToken from '../hooks/useRefreshToken';
import useAuth from '../hooks/useAuth';
import Spinner from "react-bootstrap/Spinner";

const PersistLogin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const refresh = useRefreshToken();
    const { auth, persist } = useAuth();

    useEffect(() => {
        let isMounted = true;

        const verifyRefreshToken = async () => {
            try {
                await refresh();
            }
            catch (err) {
                console.error(err);
            }
            finally {
                isMounted && setIsLoading(false);
            }
        }

        // persist added here AFTER tutorial video
        // Avoids unwanted call to verifyRefreshToken
        !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);

        return () => isMounted = false;
    }, [])

    useEffect(() => {
        console.log(`isLoading: ${isLoading}`)
        console.log(`aT: ${JSON.stringify(auth?.accessToken)}`)
    }, [isLoading])

    return (
        <>
            {!persist
                ? <Outlet />
                : isLoading
                    ? 
                        (       
                            <div style={{ top: "0%",  left : "0%", background: "rgba(0, 0, 0, .5)", position: "absolute", width : "100%", height: "100%", zIndex: 90}}>     
                                <Spinner style={{position: "absolute",top: "50%",  left : "50%", zIndex: 100}} variant='warning' animation='grow'/>
                            </div>
                            )            
                            
                    : <Outlet />
            }
        </>
    )
}

export default PersistLogin