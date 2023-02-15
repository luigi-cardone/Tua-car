import { Footer } from './Views/footer';
import './App.css';
import { Dashboard } from './Pages/dashboard';
import { Login } from './Forms/login';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from './layout';
import Register from './Forms/register';
import History from './Pages/history'
import UserMenu from './Pages/user'
import RequiredAuth from './Components/requireAuth';
import { Admin } from './Pages/admin';
import ROLES from './Classes/roles'
import PersistLogin from './Components/persistLogin';
import UserConfigArea from './Pages/userConfigArea';

function App() {

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          
          <Route element={<PersistLogin/>}>
            <Route element={<RequiredAuth allowedRoles={[ROLES.Admin]} />}>
                <Route path="admin/" element={<Admin/>}/>
                <Route path="admin/userConfigArea/:id" element={<UserConfigArea />}/>
                <Route path="admin/history/:id" element={<History />}/>
            </Route>
            <Route element={<RequiredAuth allowedRoles={[ROLES.Admin, ROLES.User]} />}>
                <Route path="history/:id" element={<History />}/>
              <Route index element={<Dashboard/>} />
              <Route path="user" element={<UserMenu />}/>
            </Route>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register/>} />
            </Route>
          </Route>
          
      </Routes>
    </BrowserRouter>
    <Footer/>
    </>
  );
}

export default App;
