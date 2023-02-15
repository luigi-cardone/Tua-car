import React from 'react'
import {useParams} from 'react-router-dom'
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import { useState, useEffect } from 'react'
import Select from 'react-select';
import ErrorModal from '../Views/errorModal';
import SuccessModal from '../Views/successModal'

const UserConfigArea = () => {
    const { id : user_id } = useParams()
    const axiosPrivate = useAxiosPrivate()
    const [regions, setRegions] = useState([]);
    const [provinces, setProvinces] = useState([])
    const [townOptions, setTownOptions] = useState([])
    const [selectedTowns, setselectedTowns] = useState([])
    const [error, setError] = useState({erro: false, message: ""})
    const [success, setSuccess] = useState(false)
    
    useEffect(() => {
        const fetchAllTowns = async () => {
            try {
                const res = await axiosPrivate.get("/user/userCity"+user_id);
                await fetchTowns(JSON.parse(res.data[0].user_config));
          } catch (err) {
            setError({error : true, message : err.message})
          }
        };
        const fetchAllRegions = async () => {
            try {
                const res = await axiosPrivate.get("geoData/regions");
                setRegions(res.data);
            } catch (err) {
                setError({error : true, message : err.message})
          }
        };
        const fetchTowns = async (towns) => {
          try {
              const res = await axiosPrivate.post("/towns", towns);
              setselectedTowns(res.data)
            } catch (err) {
                setError({error : true, message : err.message})
          }
        };
        fetchAllRegions();
        fetchAllTowns();
      }, [user_id]);

      const getProvincesByRegion = async (region_id) =>{
          try {
              const res = await axiosPrivate.get("/geoData/provincesByregion"+region_id);
              var data = res.data;
              setProvinces(data)
            } catch (err) {
            setError({error : true, message : err.message})
          }
    }
    const getTownsByProvince = async (province_sigla) =>{
        try {
            const res = await axiosPrivate.get("/geoData/townsByProvince"+province_sigla);
            var data = res.data;
            var options = townOptions
            data.forEach((town) =>{
                options.push({value: town, label: town.comune})
            })
            setTownOptions(options)
          } catch (err) {
            setError({error : true, message : err.message})
          }
    }

    const handleSubmit = async (e) =>{
        e.preventDefault()
        try {
            await axiosPrivate.post("/user/updateUserCity", {user_id : user_id, config_data : selectedTowns.map((town) => town.comune)});
            setSuccess(true)
          } catch (err) {
            setError({error : true, message : err.message})
          }
    }

  return (
        <div className="container mt-5">
            <ErrorModal title="Errore" message={error.message} show={error.error}/>
            <SuccessModal title="Operazione eseguita" message={"Utente modificato con successo"} show={success}/>
            <h5 className="text-center mb-5">Configurazione ambito di ricerca per NOME</h5>            
            <div className="row">
                <div className="col-md-6">
                    <p>Seleziona i comuni di pertinenza da assegnare all'utente</p>
                    <form id="adminSetAreaForUser" method="post" onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col mb-2">
                                <div className="form-floating">
                                    <select defaultValue="" onChange={e => getProvincesByRegion(e.target.value)} name="geoRegion" data-selector="geoRegionP2" data-child="geoProvinceP2" className="form-select">
                                        <option value="">Qualsiasi</option>
                                        {regions.map((region) =>{
                                            return (
                                                <option key={region.id_regione} value={region.id_regione}>{region.regione}</option>
                                            )
                                        })}
                                    </select>
                                    <label className="fw-bold"><i className="fa-solid fa-earth-europe"></i> Regione <span className="text-danger fw-bold">*</span></label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col mb-2">
                                <div className="form-floating">
                                    <select defaultValue="" onChange={e => getTownsByProvince(e.target.value)} name="geoProvince" data-selector="geoProvinceP2" data-child="geoTownP2" className="form-select">
                                        <option value="">Qualsiasi</option>
                                        {provinces.map((province) =>{
                                            return (
                                                <option key={province.sigla} value={province.sigla}>{province.provincia}</option>
                                            )
                                        })}
                                    </select>
                                    <label className="fw-bold"><i className="fa-solid fa-map"></i> Provincia <span className="text-danger fw-bold">*</span></label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="row">
                            <div className="col mb-2">
                                <div className="form-floating">
                                    <label className="fw-bold"><i className="fa-solid fa-location-pin"></i> Localit&agrave; <span className="text-danger fw-bold">*</span></label>
                                    <Select
                                    isMulti
                                    name="Towns"
                                    options={townOptions}
                                    onChange={async e => {
                                        e.map((town) =>{
                                            if(selectedTowns.find((selectedTown) => selectedTown.comune === town.value.comune)){
                                                return 0
                                            }
                                            setselectedTowns(selectedTowns.concat(town.value))
                                            return 0
                                        })
                                    }}
                                     />
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col mb-2 align-right">
                                <div className="form-floating">
                                    <button name="submit" id='submitBtn' type="submit" className="btn btn-success">Assegna comuni</button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div className="col-md-6">
                    <p>Aree assegnate</p>
                    {selectedTowns.length > 0
                    ? <ul className="list-group">
                         {selectedTowns.map((town, index) => {
                        return (
                            <li key={index} className="list-group-item" data-cap={town.cap}><button onClick={() => {setselectedTowns(selectedTowns.filter((selectedTown) => selectedTown.comune !== town.comune))}} className="text-danger px-2" data-action="adminRemoveGeoTown" data-value={town.cap} data-clientid={user_id} data-bs-toggle="tooltip" data-bs-placement="top" title="Rimuovi Comune (CAP)"><i className="fa-solid fa-lg fa-trash-can"></i></button>{town.cap}-{town.comune}({town.provincia}) {town.regione}</li>
                        )
                        })}
                     </ul>
                    : "Nessuna restrizione di ricerca impostata"
                    }
                </div>
            </div>
            
        </div>
  )
}

export default UserConfigArea