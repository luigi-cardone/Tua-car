import React from "react";
import PlatformTabs from "../Views/platformTabs";
import { useEffect, useState } from "react";
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import Platform from "../Classes/platform";
import useAuth from "../hooks/useAuth";
import ErrorModal from '../Views/errorModal';
import SuccessModal from '../Views/successModal'
import Spinner from "react-bootstrap/esm/Spinner";

export const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({error: false, message: ""})
  const [success, setSuccess] = useState({success: false, message: ""})
  const axiosPrivate = useAxiosPrivate()
  const [assignedTowns, setAssignedTowns] = useState([]);
  const [regions, setRegions] = useState([]);
  const [currentTask, setCurrentTask] = useState({});
  const [currentTaskContent, setCurrentTaskContent] = useState([]);
  const [platformCheck, setPlatformCheck] = useState([])
  const [taskData, setTaskData] = useState({})
  const { auth } = useAuth()
  const [newTask, setNewTask] = useState({
    user_id: auth.id,
    setSpokiActive: 1,
    schedule_active: 1,
    schedule_start: "",
    schedule_repeat_h: "",
    schedule_cc: "",
    schedule_content: {},
    created_at: "",
    last_run: "",
    next_run: ""
  })

  useEffect(() => {
    const fetchTowns = async (towns) => {
      try {
        const res = await axiosPrivate.post("/towns", towns);
        setAssignedTowns(res.data)
      } catch (err) {
        console.log(err);
      }
    };
    const fetchAllTowns = async () => {
      try {
        const res = await axiosPrivate.get("/user/userCity"+auth.id);
        await fetchTowns(JSON.parse(res.data[0].user_config));
      } catch (err) {
        console.log(err);
      }
    };
    const fetchAllRegions = async () => {
      try {
        const res = await axiosPrivate.get("geoData/regions");
        setRegions(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    const fetchCurrentTask = async () => {
      try {
        const res = await axiosPrivate.get("user/scheduledTaskUser"+auth.id);
        var data = res.data[0];
        if(data !== undefined){
          setCurrentTask(data);
          var schedule_content = JSON.parse(data.schedule_content)
          schedule_content = Object.values(schedule_content)
          setCurrentTaskContent(schedule_content)
        }
      } catch (err) {
        console.log(err);
      }
    };
    fetchAllTowns();
    fetchAllRegions();
    fetchCurrentTask();
  }, [auth]);

  const platforms = [new Platform("Autoscout", "#f5f200", "platform-01"), 
                   new Platform("Subito", "#f9423a", "platform-02")];



  const sendTask = async (action) =>{
    try {
      setIsLoading(true)
      var responseMessage = ""
      if(action === "send_scheduling_data"){
        const res = await axiosPrivate.post("/scheduledSearch", newTask);
        responseMessage = res.data
        console.log(res)
      }
      else{
        const res = await axiosPrivate.post("/search", newTask);   
        responseMessage = res.data
        console.log(res)
      }
      const msg = `E' stato creato il file${responseMessage?.fileName} ${responseMessage?.searchCnt > 0 ? ` con un totale di ${responseMessage?.searchCnt}` : ". Non è stato trovato nessun nuovo risultato, prova a cambiare i parametri di ricerca"}`
      console.log(msg)
      setSuccess({success: true, message: msg})
    } catch (err) {
      console.log(err);
    }
    setIsLoading(false)
  }

  const taskDataHandler = (data) =>{
    setTaskData({...taskData, [data.platform] : data})
  }

  const ScheduleTaskSubmit = (e) =>{
    e.preventDefault()
    setNewTask({...newTask, created_at: new Date().toJSON().replace("T", " ").slice(0,19)})
    newTask.schedule_content = {}
    const toDo = platforms.map((platform) =>{
      if(platformCheck[platform.id]) return platform.id
      else return 1
    })
    toDo.map((element) =>{
      
      if(element !== 1) {
        var newData = newTask.schedule_content
        newData[element] = taskData[element]
        setNewTask({...newTask, schedule_content: newData})
      }
      return 0
    })

    sendTask(e.target.id)
  }

  const checkPlatformHandler = (checkedPlatform) =>{
    var platform_id = Object.keys(checkedPlatform)[0]
    var prevPlatformCheck = platformCheck
    prevPlatformCheck[platform_id] = checkedPlatform[platform_id]
    setPlatformCheck(prevPlatformCheck)
  }

  const deleteTaskHandler = async () =>{
    try {
      const res = await axiosPrivate.post("/deleteSchedule/", {user_id:auth.id});
      console.log(res)
    } catch (err) {
      console.log(err);
    }
  }

  const closeModal = () =>{
    setSuccess(false)
    setError(false)
  }

  return (
    <>
    {isLoading && 
                        (       
                            <div style={{ top: "0%",  left : "0%", background: "rgba(0, 0, 0, .5)", position: "absolute", width : "100%", height: "100%", zIndex: 90}}>     
                                <Spinner style={{position: "absolute",top: "50%",  left : "50%", zIndex: 100}} variant='warning' animation='grow'/>
                            </div>
                            )            
                            }
      <ErrorModal closeModal={closeModal} title="Errore" message={error.message} show={error.error}/>
      <SuccessModal closeModal={closeModal} title="Operazione eseguita" message={success.message} show={success.success}/>
      <div className="row">
        <div className="col py-3">
          <h5 className="text-center">
            Ricerca veicoli usati, messi in vendita da parte dei venditori
            privati
          </h5>
        </div>
      </div>
      <div className="row">
        <div className="col mt-3">
          <p>
            <b>
              1. Indica i critteri di ricerca per ogni piattaforma desiderata
            </b>
          </p>
        </div>
      </div>
      <div className="row">
        <PlatformTabs checkPlatformHandler={checkPlatformHandler} regions={regions} assignedTowns={assignedTowns} platforms={platforms} taskDataHandler={taskDataHandler} />
      </div>

      <div className="row">
        <div className="col-sm-6">
          <div className="row">
            <div className="col mt-3">
              <p>
                <b>
                  2. Ricerca immediata: seleziona le piattaforme sulle quali
                  eseguire la ricerca
                </b>
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col py-2">
              <div className="card">
                <div className="card-header text-center">
                  <h5>Ricerca immediata</h5>
                </div>
                <div className="card-body">
                  <form onSubmit={ScheduleTaskSubmit} id="send_search_data" method="post">
                    <input type="hidden" name="foo" value="bar" />
                    <div className="row  align-items-center">
                      <div className="col mb-2">
                        <button
                          id="mainSearch"
                          className="w-100 btn btn-lg btn-success"
                          type="submit">
                          <i className="fa-solid fa-magnifying-glass"></i> Cerca
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-6">
          <div className="row">
            <div className="col mt-3">
              <p>
                <b>
                  3. Ricerca programmata: per impostare una ricerca ripetuta su
                  base giornaliera
                </b>
              </p>
            </div>
          </div>

          <div className="row">
            <div className="col py-2">
              <div className="card">
                <div className="card-header text-center">
                  <h5>Ricerca programmata</h5>
                </div>
                <div className="card-body">
                  {
                    <div className="row">
                      <div className="col mb-2">
                        {currentTaskContent.length > 0 ? (
                          <div className="alert alert-success" role="alert">
                            <div className="row align-items-center">
                              <div className="col-1">
                                <button
                                  onClick={deleteTaskHandler}
                                  data-bs-toggle="tooltip"
                                  data-bs-placement="top"
                                  title="Rimuovi Task"
                                >
                                  <i className="fa-solid fa-trash-can fa-lg"></i>
                                </button>
                              </div>

                              <div className="col-11">
                                <div>
                                  Hai una ricerca programmata ogni{" "}
                                  <strong>
                                    {currentTask.schedule_repeat_h} ore
                                  </strong>{" "}
                                  a partire dalle{" "}
                                  <strong>{currentTask.schedule_start}</strong>
                                  <br />
                                </div>
                                {currentTaskContent.map((options, key) =>{
                                    return (
                                        <div key={key}><strong> Parametri di {platforms.find(platform => platform.id === options.platform).name}</strong>: anno da {options.yearFrom !== ""? options.yearFrom : "Qualsiasi"} a {options.yearTo !== ""? options.yearTo : "Qualsiasi"}, km da {options.mileageFrom !== ""? options.mileageFrom : "Qualsiasi"} a {options.mileageTo !== ""? options.mileageTo : "Qualsiasi"}</div>
                                    )
                                })}
                              </div>
                            </div>
                          </div>
                        ) : (
                            <form onSubmit={ScheduleTaskSubmit} id="send_scheduling_data" method="post">
                            <div className="row">
                                <div className="col mb-2">
                                    <div className="form-floating">
                                        <input required onChange={(e) => setNewTask({...newTask, schedule_start : e.target.value})} id="scheduleStart" name="scheduleStart" className="form-control" />
                                        <label htmlFor="scheduleStart"><i className="fa-solid fa-clock"></i> Orario inizio</label>
                                    </div>
                                </div>
                                <div className="col mb-2">
                                    <div className="form-floating">
                                        <select required value={newTask.schedule_repeat_h} onChange={(e) => setNewTask({...newTask, schedule_repeat_h : e.target.value})} id="scheduleEvery" name="scheduleEvery" className="form-select">
                                            <option value="">-- Seleziona --</option>
                                            <option value="1">1 ora</option>
                                            <option value="2">2 ore</option>
                                            <option value="4">4 ore</option>
                                            <option value="6">6 ore</option>
                                            <option value="8">8 ore</option>
                                            <option value="12">12 ore</option>
                                            <option value="24">24 ore</option>
                                        </select>
                                        <label><i className="fa-solid fa-repeat"></i> Ripeti ogni</label>
                                    </div>
                                </div>
                            </div>
                            <div className="row">
                                <div className="col mb-2">
                                    <div className="form-floating">
                                        <input onChange={(e) => setNewTask({...newTask, schedule_cc : e.target.value})} id="scheduleCc" name="scheduleCc" className="form-control" placeholder="mail1@example.com,mail2@example.com"/>
                                        <label htmlFor="scheduleCc"><i className="fa-solid fa-envelopes-bulk"></i> E-mail aggiuntivi per invio CSV</label>
                                        <small><em>Separa gli indirizzi con , (virgola)</em></small>
                                    </div>
                                </div>
                            </div>
                            <div className="row align-items-center justify-content-between d-flex">
                            <div className="col mb-2">
                                <button className="w-100 btn btn-lg btn-primary" type="submit"><i className="fa-solid fa-calendar-check"></i> Esegui</button>
                            </div>
                            <div className="form-check form-switch col mb-2 d-flex justify-content-end">
                              <input
                                name="platformValue[]"
                                className="form-check-input"
                                type="checkbox"
                                value={newTask.setSpokiActive}
                                checked={newTask.setSpokiActive}
                                onChange={(e) => {setNewTask({...newTask, setSpokiActive : !newTask.setSpokiActive})}}
                              />
                              <label className="form-check-label">
                              &nbsp;Attiva Spoki
                              </label>
                            </div>
                            </div>
                        </form>
                        )}
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5">&nbsp;</div>
    </>
  );
};
