<?php

// get locations from database

class Location {
    
    var $db;
    
    function __construct($db){
        $this->db = $db;
    }
    
    public function fromCap($cap){
        
        $result = array();
        $q = $this->db->query("select c.*, p.provincia as nome_provincia from italy_cities c, italy_provincies p where c.cap = '$cap' and c.provincia = p.sigla");
        $rc = $q->fetchAll();
        
        if (!$rc){
            $limcap = substr($cap, 0, 3);
            $q = $this->db->query("select c.*, p.provincia as nome_provincia from italy_cities c, italy_provincies p where c.cap like '$limcap%' and c.provincia = p.sigla");
            while($r = $q->fetch()) {
                $result[] = array('cap' => $cap, 'comune' => $r['comune'], 'provincia' => $r['provincia'], 'nome_provincia' => $r['nome_provincia'], 'regione' => $r['regione'], 'prefisso' => $r['prefisso']);
            }
        } else {
            foreach($rc as $r){
                $result[] = array('cap' => $r['cap'], 'comune' => $r['comune'], 'provincia' => $r['provincia'], 'nome_provincia' => $r['nome_provincia'], 'regione' => $r['regione'], 'prefisso' => $r['prefisso']);
            }
            
        }
        
        /* if ($q->fetchColumn() > 0){
            while($r = $q->fetch()) {
                $result[] = array('cap' => $r['cap'], 'comune' => $r['comune'], 'provincia' => $r['provincia'], 'nome_provincia' => $r['nome_provincia'], 'regione' => $r['regione'], 'prefisso' => $r['prefisso']);
            }
        } else {
            $limcap = substr($cap, 0, 3);
            $q = $this->db->query("select c.*, p.provincia as nome_provincia from italy_cities c, italy_provincies p where c.cap like '$limcap%' and c.provincia = p.sigla");
            while($r = $q->fetch()) {
                $result[] = array('cap' => $cap, 'comune' => $r['comune'], 'provincia' => $r['provincia'], 'nome_provincia' => $r['nome_provincia'], 'regione' => $r['regione'], 'prefisso' => $r['prefisso']);
            }
        } */

        return $result;
    }
    
    public function getRegioni($type='array'){
        $q = $this->db->query("select r.id_regione, r.regione from italy_regions r order by r.regione asc");
        $result_array=array();
        while($r = $q->fetch()){
            $result_array[] = $r;
        }

        if ($type=="array"){
            return $result_array;
        }
        return implode(', ',$result_array);
    }
    
    public function getProvincesByRegion($idRegione, $type='array'){
        $q = $this->db->query("select p.sigla, p.provincia as nome_provincia, p.id_regione, r.regione from italy_provincies p, italy_regions r where r.id_regione = '$idRegione' and r.id_regione=p.id_regione");
        $result_array=array();
        while($r = $q->fetch()){
            $result_array[] = $r;
        }

        if ($type=="array"){
            return $result_array;
        }
        return implode(', ',$result_array);
    }
    
    public function getTownsByProvince($siglaProvincia, $type='array'){
        $result_array = array();
        $q = $this->db->query("select c.*, p.provincia as nome_provincia from italy_cities c, italy_provincies p where c.provincia = '$siglaProvincia' and c.provincia = p.sigla order by c.comune asc");
        if ($q->fetchColumn() > 0){
            while($r = $q->fetch()){
                $result_array[] = array('cap' => $r['cap'], 'comune' => $r['comune'], 'provincia' => $r['provincia'], 'nome_provincia' => $r['nome_provincia'], 'regione' => $r['regione'], 'prefisso' => $r['prefisso']);
            }
        }
    
        if ($type=="array"){
            return $result_array;
        }
        return implode(', ',$result_array);
    }
}