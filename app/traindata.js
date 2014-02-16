/* 
 * TRAINDATA
 * He is the trainmaster! 
 */

var traindata = {
    trains: {},
    UIC: 0,
    stationName: "",
    trainNumber: 0,
    
    //Returns the station UIC
    getStationUIC: function(staion, callback) {
        var url = appConf.serverRequst;
        $.getJSON(appConf.serverRequst, {func: 'getstation', station: staion}, function(d) {
            traindata.UIC = d.d[0].UIC;
            
            if(callback) {
                callback(d);
            }
        });
    },
    
    //Reurns an array of trains
    getTrainsFromStationUIC: function(uic, callback) {
      $.getJSON(appConf.serverRequst, {func: 'gettrains', uic: uic}, function(d) {
          d.d.sort(traindata.sortTimes);
          
          traindata.setTrainData(d.d);
          traindata.UIC = uic;
          if(callback) {
              callback(d);
          }
      });  
    },
    
    //Returns a list of stations
    getStationList: function(callback) {
        $.getJSON(appConf.serverRequst, {func: 'getStationList'}, function(d) {
            d.d.sort();
            traindata.setStationData(d.d);
            if(callback) {
                callback(d.d);
            }
        })
    },
    
    //Returns a list of stop staions
    getStopStaions: function(trainNumber, callback) {
        if(!trainNumber) {
            trainNumber = traindata.trainNumber;
            if(!trainNumber) return false;
        }
        
        $.getJSON(appConf.serverRequst, {func: 'getStopStaions', trainNumber: trainNumber}, function(d) {
            d.d.sort(traindata.sortTimes);
            if(callback) {
                callback(d.d);
            }
        })
        return false;
    },
    
    //Sets traininformation
    setTrainData: function(data) {
        if(!data) return false;
        
        for(i in data) {
            var trainNumber = data[i].TrainNumber;
            this.trains[trainNumber] = data[i];
        }
        
        return true;
    },
    
    //Sets stationdata
    setStationData: function(data) {
      if(!data) return false;
      
      for(i in data) {
          var uic = parseInt(data[i].UIC);
          main.stationList[uic] = data[i];
      }
      
      return true;
    },
    
    setTrainNumber: function(trainNumber) {
        if(!trainNumber) return false;
        this.trainNumber = trainNumber;
        return true
    },
    
    //Calculates departure time
    calcTime: function(departureTime, delay) {
        var time = new Date(Date());
        time = time.getTime() + 7200000;
        delay = parseInt(delay);
        
        departureTime = departureTime.replace("/Date(", "");
        departureTime = parseInt(departureTime.replace(")/", ""));
        var depCalc = departureTime - time;
        
        //DST Calculation
        Date.prototype.stdTimezoneOffset = function() {
            var jan = new Date(this.getFullYear(), 0, 1);
            var jul = new Date(this.getFullYear(), 6, 1);
            return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
        }
        
        Date.prototype.dst = function() {
            return this.getTimezoneOffset() < this.stdTimezoneOffset();
        }
        
        
        departureTime = new Date(depCalc); 
        departureTime.setSeconds(departureTime.getSeconds() + delay);
        if(departureTime.dst() == false) {
            //departureTime.setHours(departureTime.getHours() - 1);
        }
        
        
        if(departureTime.getFullYear() <= 1969) {
            var t = new Date(0);
            t.setHours(0, 0, 0, 0)
            return t;
        }
        
        return departureTime;
    },
    
    sortTimes: function(a,b) {
        var t1;
        if(a.ScheduledDeparture) {
            t1 = traindata.calcTime(a.ScheduledDeparture, a.DepartureDelay);
        } else {
            t1 = new Date(0);
            t1.setHours(0, a.MinutesToDeparture, 0,0);
            if(isNaN(t1.getMinutes())) return 0;
        }
        
        var t2;
        if(b.ScheduledDeparture) {
            t2 = traindata.calcTime(b.ScheduledDeparture, b.DepartureDelay);
        } else {
            t2 = new Date(0);
            t2.setHours(0, b.MinutesToDeparture, 0,0);
            if(isNaN(t2.getMinutes())) return 0;
        }
        
        var calc = t1.getTime() - t2.getTime();
        
        return calc;
    }
}
