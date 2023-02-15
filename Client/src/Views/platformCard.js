import React, { useEffect } from 'react'
import Col from 'react-bootstrap/Col';
import ListGroup from 'react-bootstrap/ListGroup';
import Row from 'react-bootstrap/Row';
import Tab from 'react-bootstrap/Tab';
import { useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate';
import Select from 'react-select';

export const PlatformCard = (props) => {
    const [provinces, setProvinces] = useState([])
    const axiosPrivate = useAxiosPrivate()
    const [isChecked, setIsChecked] = useState(false)

    const [townOptions, setTownOptions] = useState([])
    const [taskData, setTaskData] = useState({
        platform: props.platform.id,
        yearFrom : '',
        yearTo: '',
        mileageFrom: '',
        mileageTo: '',
        geoRegion: '',
        geoProvince: '',
        geoTowns: []
    })
 
    var yearOptions = []
    var milesOptions = []
    for(let year = new Date().getFullYear(); year >= 1980; year--){
        yearOptions.push(<option key={year} value={year}>{year}</option>)
    }
    var counter = 5000
    for (let mile = 0; mile <= 500000;)
    {
        if(mile >= 100000) {
            counter = 10000
            if(mile >= 200000) {counter = 50000}
        }
        milesOptions.push(<option key={mile} value={mile}>{mile} km</option>)
        mile += counter
    }

    const getProvincesByRegion = async (region_id) =>{
        try {
            const res = await axiosPrivate.get("/geoData/provincesByregion"+region_id);
            var data = res.data;
            setProvinces(data)
          } catch (err) {
            console.log(err);
          }
    }
    const getTownsByProvince = async (province_sigla) =>{
        try {
            console.log(province_sigla)
            const res = await axiosPrivate.get("/geoData/townsByProvince"+province_sigla);
            var data = res.data;
            var options = townOptions
            data.forEach((town,) =>{
                options.push({value: town.comune, label: town.comune})
            })
            setTownOptions(options)
          } catch (err) {
            console.log(err);
          }
    }

    const InputHandler = (task) =>{
        props.taskDataHandler({...taskData,geoTowns: task});
    }

    useEffect (() =>{
        const handleChange = () =>{
            var platform_id = props.platform.id
            var platformCheck = {}
            platformCheck[platform_id] = isChecked
            props.checkPlatformHandler(platformCheck)
        }
        handleChange()
    }, [isChecked])

  return (
    <>
        <div className="card">
            <div style={{background: props.platform.color}} className="card-header bg-platform-02 text-center"><h5>{props.platform.name}</h5></div>
            <div className="card-body">
                <sup className="fst-italic"> con <span className="text-danger fw-bold">*</span> vengono indicati i campi richiesti</sup>
                <form data-platform="platform-02" method="post">
                    <div className="row">
                        <div className="col mb-2">
                            <div className="form-floating">
                                    <select required value={taskData.yearFrom} onChange={e => setTaskData({...taskData, yearFrom : e.target.value})} name="yearFrom" className="form-select">
                                    <option value="">Qualsiasi</option>
                                    {yearOptions}
                                </select>
                                <label className="fw-bold"><i className="fa-solid fa-calendar-minus"></i> Anno Da</label>
                            </div>
                        </div>
                        <div className="col mb-2">
                            <div className="form-floating">
                                    <select value={taskData.yearTo} onChange={e => setTaskData({...taskData, yearTo : e.target.value})} name="yearTo" className="form-select">
                                    <option value="">Qualsiasi</option>
                                    {yearOptions}
                                </select>
                                <label className="fw-bold"><i className="fa-solid fa-calendar-plus"></i> Anno A</label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col mb-2">
                            <div className="form-floating">
                                <select value={taskData.mileageFrom} onChange={e => setTaskData({...taskData, mileageFrom : e.target.value})} name="mileageFrom" className="form-select">
                                    <option value="">Qualsiasi</option>
                                    {milesOptions}
                                </select>
                                <label className="fw-bold"><i className="fa-solid fa-car"></i> Km Da</label>
                            </div>
                        </div>
                        <div className="col mb-2">
                            <div className="form-floating">
                                <select value={taskData.mileageTo} onChange={e => setTaskData({...taskData, mileageTo : e.target.value})} name="mileageTo" className="form-select">
                                    <option value="">Qualsiasi</option>
                                    {milesOptions}
                                </select>
                                <label className="fw-bold"><i className="fa-solid fa-car"></i> Km A</label>
                            </div>
                        </div>
                    </div>
                    {props.assignedTowns.length > 0 ?
                    <div className="row">
                        <div className="col mb-2">
                            <p>La ricerca verrà effetuata solo nei comuni a te assegnati</p>
                            <div>
                                    <h6>
                                {props.assignedTowns.map((town, key) =>{
                                        return town.comune + ", "
                                })}
                                            </h6>
                            </div>
                        </div>
                    </div>
                    :
                    <>
                        <div className="row">
                            <div className="col mb-2">
                                <div className="form-floating">
                                    <select value={taskData.geoRegion} onChange={e => {setTaskData({...taskData, geoRegion : e.target.value}); getProvincesByRegion(e.target.value)}} name="geoRegion" data-selector="geoRegionP2" data-child="geoProvinceP2" className="form-select">
                                        <option value="">Qualsiasi</option>
                                        {props.regions.map((region) =>{
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
                                    <select value={taskData.geoProvince} onChange={e => {setTaskData({...taskData, geoProvince : e.target.value}); getTownsByProvince(e.target.value)}} name="geoProvince" data-selector="geoProvinceP2" data-child="geoTownP2" className="form-select" disabled={taskData.geoRegion === ''? true : false}>
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
                                        setTaskData({...taskData, geoTowns : e.map((town) => town.value)})
                                        InputHandler(e.map((town) => town.value))
                                    }
                                    }
                                     />
                                </div>
                            </div>
                        </div>
                    </>}
                    <div className="col mb-3">
                            <div className="form-floating">
                              <div className="form-check form-switch">
                                <input
                                  name="platformValue[]"
                                  className="form-check-input"
                                  type="checkbox"
                                  value={isChecked}
                                  onChange={(e) => {setIsChecked(!isChecked)}}
                                />
                                <label className="form-check-label">
                                  Attiva Ricerca
                                </label>
                              </div>
                            </div>
                          </div>
                </form>

            </div>
        </div>
    

    </>
  )
}
