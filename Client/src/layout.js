import { Header } from "./Views/header";
import { Outlet } from "react-router-dom";
const Layout = () => {
    return (
      <>
        <div className='d-flex flex-column min-vh-100'>
            <Header/>
            <div className="container">
                <Outlet/>
            </div>
        </div>
      </>
    )
  };
  
  export default Layout;