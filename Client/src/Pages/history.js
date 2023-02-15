import React from 'react'
import { useEffect, useState } from 'react';
import useAxiosPrivate from '../hooks/useAxiosPrivate'
import moment from 'moment'
import Platform from '../Classes/platform';
import download from 'downloadjs'
import { useParams } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner'
import ErrorModal from '../Views/errorModal';
import Pagination from 'react-bootstrap/Pagination';
import Math from 'math'

const platforms = [new Platform("Autoscout", "#f5f200", "platform-01"), 
new Platform("Subito", "#f9423a", "platform-02"),
new Platform("Facebook", "white", "platform-03")];

function History() {
    const { id : user_id } = useParams()
    const [searches, setSearches] = useState([])
    const axiosPrivate = useAxiosPrivate()
    const currentDate = new moment()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState({erro: false, message: ""})
    const [currentPage, setCurrentPage] = useState(1)
    let maxItemPerPage = 7
    const lastPostIndex = currentPage * maxItemPerPage
    const firstPostIndex = lastPostIndex - maxItemPerPage
    const currentSearches = searches.slice(firstPostIndex, lastPostIndex)
    let pages = []
    for (let number = 1; number <= Math.floor(searches.length / maxItemPerPage); number++) {
        pages.push(
          <Pagination.Item onClick={() => setCurrentPage(number)} key={number} active={number === currentPage}>
            {number}
          </Pagination.Item>,
        );
      }
    useEffect(() => {
        const fetchAllUsers = async () => {
            try {
                setIsLoading(true)
                const res = await axiosPrivate.get('/searches/' + user_id);
                setSearches(res.data)
                setIsLoading(false)
            } catch (err) {
                console.log(err.message);
                setError({error: true, message : err.message})
                setIsLoading(false)
            }
        };
        fetchAllUsers();
    }, [user_id]);
    
    
    
    const downloadFile = async (file_path, file_name) =>{
        try {
            setIsLoading(true)
            const res = await fetch('/webfiles/exports/', {
                file_path : file_path
            });
            const blob = res.blob()
            setIsLoading(false)
            download(blob, file_name + ".csv")
            
        } catch (err) {
            setIsLoading(false)
            setError({error: true, message : err.message})
            console.log(err.message);
        }
    }

    
    return (
        <div style={{display : "flex", flexDirection : "column", justifyContent : "center"}} className="container mt-5">
        <h2 className="text-center mb-5">Storico ricerche effettuate</h2>
        <ErrorModal title="Errore" message={error.message} show={error.error}/>
        {isLoading && 
                        (       
                            <div style={{ top: "0%",  left : "0%", background: "rgba(0, 0, 0, .5)", position: "absolute", width : "100%", height: "100%", zIndex: 90}}>     
                                <Spinner style={{position: "absolute",top: "50%",  left : "50%", zIndex: 100}} variant='warning' animation='grow'/>
                            </div>
                            )            
                            }
        <table className="table table-bordered mb-5">
            <thead>
                <tr className="table-success">
                    <th scope="col" className="text-responsive">Data</th>
                    <th scope="col" className="text-responsive">File</th>
                    <th scope="col" className="text-responsive">Risultati</th>
                    <th scope="col" className="text-responsive">Parametri</th>
                </tr>
            </thead>
            <tbody>
                {
                currentSearches.map((search) =>{
                    var parsedData = JSON.parse(search.search_options)
                    return (
                        <tr key={search.search_id}>
                        <td className="text-responsive">
                            {/* {search.search_date << momen} {moment(search.search_date, 'YYYYMMDD').calendar()} */}
                            {moment.duration(currentDate.diff((moment(search.search_date)))).asDays() < 15
                            ? moment(search.search_date, "YYYYMMDD").fromNow()
                            : moment(search.search_date, "YYYYMMDD").calendar()}
                            </td>
                        <td><button onClick={() => downloadFile(user_id + "/" + search.search_filename, search.search_filename)}><i className="fa-solid fa-file-csv fa-lg text-success"></i></button></td>
                        <td className="text-responsive">{search.search_results}</td>
                        <td className="text-responsive">{Object.keys(parsedData).map((platform_id) =>{
                            return (
                                <>
                                <b>{platforms.find(platform => platform.id === platform_id)?.name}:</b> towns <br/> 
                                <b>Parametri :</b> anno da {parsedData[platform_id].yearFrom} a {parsedData[platform_id].yearTo}; km da {parsedData[platform_id].mileageFrom} a {parsedData[platform_id].mileageTo} <br/> 
                                </>)
                        })}</td>
                    </tr>
                    )
                })}
            </tbody>
        </table>
        <div style = {{display : "flex", justifyContent : "center"}}>
            <Pagination>{pages}</Pagination>
        </div>
    </div>
  )
}

export default History