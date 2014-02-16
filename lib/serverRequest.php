<?php
/**
 * Description of serverRequest
 * @author Baagoe
 */
class serverRequest {
    
    public function __construct() {
        if(!isset($_GET['func'])) die('No function given!');
        if($r = call_user_func(array($this, $_GET['func']), $_GET)) {
            echo $r;
        } else {
            die("The function dosn't exist!");
        };
    }
    
    /**
     * Calls the GoogleAPI to get information about position!
     * 
     * @param array $args
     * @return string 
     */
    public function geocode($args) {
        if(!isset($args['latlng'])) {
            return false;
        }
        
        $latlng = $args['latlng'];
        $urlReg = "http://maps.googleapis.com/maps/api/geocode/json?latlng=". $latlng. "&sensor=false";
        $content = file_get_contents($urlReg);
        $uic = $this->geoCodeToUIC(json_decode($content));
        $content = json_decode($content);
        return json_encode(array('stationInfo' => $uic, 'locationInfo' => $content));
    }
    
    /**
     * Gets the nearest UIC from the position given by Google
     * 
     * @param Array $data
     * @return boolean 
     */
    private function geoCodeToUIC($data) {
        $stations = json_decode($this->getStationList());
        $stations = $stations->d;
        
        foreach($data->results as $location) {
            foreach ($location->address_components as $compenent) {
                $name = $compenent->long_name;
                foreach ($stations as $station) {
                    if(strstr($name, $station->Name)) {
                        return $station;
                    }
                }
            }
        }
        
        $this->logError($data->results[0]->formatted_address, "nopos");
        return false;
    }
    
    /**
     * Returns the specific station UIC
     * 
     * @param type $args
     * @return boolean 
     */
    public function getstation($args) {
        if(!isset($args['station'])) return false;
        $station = $args['station']; 
        $url = "http://traindata.dsb.dk/stationdeparture/opendataprotocol.svc/Station()?\$format=json&\$filter=Name%20eq%20'$station'";
        $content = file_get_contents($url);
        return $content; 
    }
    
    /**
     * Returns a list of all stations
     * @return string
     */
    public function getStationList() {
        $url = "http://traindata.dsb.dk/stationdeparture/opendataprotocol.svc/Station()?\$format=json";
        $content = file_get_contents($url);
        return $content;
    }
    
    /**
     * Returns all trains from a specific station
     * 
     * @param type $args
     * @return boolean 
     */
    public function gettrains($args) {
        if(!isset($args['uic'])) return false;
        $uic = $args['uic'];
        $url = "http://traindata.dsb.dk/stationdeparture/opendataprotocol.svc/Queue()?\$format=json&\$filter=StationUic%20eq%20'$uic'";
        $content = file_get_contents($url);
        return $content;
    }
    
    /**
     * Returns a list of stop stations, a specific train stops at
     * 
     * @param type $args
     * @return boolean 
     */
    public function getStopStaions($args) {
        if(!isset($args['trainNumber'])) return false;
        $trainNumber = $args['trainNumber'];
        $url = "http://traindata.dsb.dk/stationdeparture/opendataprotocol.svc/Queue()?\$format=json&\$filter=TrainNumber%20eq%20'$trainNumber'";
        $content = file_get_contents($url);
        return $content;
    }
    
    /***
     * Tests log function
     */
    public function testLog() {
        $this->logError("TEST", "nopos");
        return true;
    }
    
    public function logError($error, $file) {
        if(empty($error) || empty($file)) return false;
        
       $file = "log/". $file. ".txt";
       $errorLine = date("d/m/Y H:i:s"). ": ". $error. "\n"; 
       
       file_put_contents($file, $errorLine, FILE_APPEND);
       return true;
    }
}

?>
