/*
 *  MAIN
 * Entry point for the app.. shh I say he is the master!
 */

var main = {
    showErrors: true,
    loadedScripts: {},
    stationList: {},
    
    //Main entry function
    run: function() {
        main.setSearchFilter();
        this.loadConf(function() {
            if(appConf) {
                main.showLoading("Finder din position...");
                main.getUserLocation();
                main.makeStationList();
                
                window.setInterval("main.update()", 60000);
                $(window).bind('focus', function() {
                    main.update();
                })
            }
        });
    },
    
    //Changes the header
    writeHeader: function(txt) {
        if(txt) {
            txt = " - " + txt + " - ";
        } else {
            txt = " - ";
        }
        
        $('#trains h2').html('Infotavle' + txt + '<span style="color:red">BETA</span>');
    },
    
    //Changes the header
    writeInfoHeader: function(txt) {
        if(txt) {
            txt = " - " + txt + " - ";
        } else {
            txt = " - ";
        }
        
        $('#trainInfo h2').html('Infotavle' + txt + '<span style="color:red">BETA</span>');
    },
    
    
    //Loads the configuration
    loadConf: function(callback) {
        $.getScript('conf.js', callback).fail(function()  {main.error('Configuration could not be loaded!')});
    },
    
    //Loads a specific application object
    loadObject: function(object, func) {
        if(!object) {
            return false;
        }
        
        if(this.loadedScripts[object] != true) {
            var p = appConf.folders.app + object + ".js";
            $.getScript(p, function() {
                main.loadedScripts[object] = true;
                if(func) {
                    func();
                }
            }).fail(function() {main.error(p + 'object could not be loaded!')});
        } else {
            if(func) {
                func();
            }
        }
        
        return true;
    },
    
    makeStationList: function() {
      main.loadObject('traindata', function() {
        traindata.getStationList(function(list) {
            main.loadObject('page', function() {
                page.stationList(list);
            })
        });
      });
    },
    
    //Asks for the user location, using the browser
    getUserLocation: function() {
        main.loadObject('geoPosition', function() {
            geoPosition.getLocation(main.getTrainStationData);
        })
    },
    
    //Loads the train station data
    getTrainStationData: function() {
        main.loadObject('traindata', function() {
            if(traindata.UIC > 0) {
                main.showLoading("Henter tog data for " + traindata.stationName + "...");
                main.writeHeader(traindata.stationName);
            
                traindata.getTrainsFromStationUIC(traindata.UIC , function(d) {
                    main.showData(d);
                });
            
            } else {
                main.showLoading("Kunne ikke finde din position, v&aelig;lg venligst en station p&aring; listen");
                window.setTimeout("main.hideLoading()", 3000);
            }
        });
        
        return true;
    },
    
    showTrainStationDataFromUIC: function(uic, town) {
        if(!uic) return false;
        main.showLoading("Henter tog data for " + town + "...");
        main.loadObject('traindata', function() {
            traindata.getTrainsFromStationUIC(uic, function(d) {
                main.update();
                main.writeHeader(town);
            });
        })
        
        return true;
    },
    
    //Shows train data
    showTrainData: function(trainNumber) {
      main.loadObject('traindata', function() {
          main.showLoading('Loaidng stops...');
          page.showTrainInfo(trainNumber);
          traindata.setTrainNumber(trainNumber);
          traindata.getStopStaions(trainNumber, function(stops) {
              main.hideLoading();
              page.showStops(stops);
          })
      })  
    },
    
    //Updates function that automaticly updates data
    update: function() {
        if(typeof traindata === 'undefined') return false;
        
        if($('#trains').hasClass('ui-page-active')) { //If trainlist is active
            if(!traindata.UIC) return false;
            main.showLoading("Opdatere data...");
            traindata.getTrainsFromStationUIC(traindata.UIC, function(d) {
                page.updateData(d, function() {
                    main.hideLoading();
                });
            })
        }
        
        if($('#trainInfo').hasClass('ui-page-active')) { //Stops is active
            if(!traindata.trainNumber) return false;
            main.showLoading("Opdatere data...");
            traindata.getStopStaions(traindata.trainNumber, function(stops) {
                main.hideLoading();
                page.showStops(stops);
            })
        }
        
        return true;
    },
    
    //Displays data for the given station
    showData: function(d) {
        if(!d) this.error("No data was recieved in ShowData!");
        this.loadObject('page', function() {
            page.putData(d, function() {
                $.mobile.changePage("#trains");
            });
            main.hideLoading();
        });
    },
    
    //Shows loading
    showLoading: function(msg) {
        $.mobile.showPageLoadingMsg();
        if(msg) {
            $('.ui-loader h1').html(msg);
        }
    },
    
    //Hides the loading screen
    hideLoading: function() {
         $.mobile.hidePageLoadingMsg();
    },
    
    //Changes the defualt charecters there should be submitted before filtering begins
    setSearchFilter: function() {
        $.mobile.listview.prototype.options.filterCallback = function( text, searchValue ){
            if(searchValue.length > 3) {
                return text.toLowerCase().indexOf( searchValue ) === -1;
            }
                   
             return false;
        };
    },
    
    //Displays errors to the user
    error: function(msg) {
        if(msg && this.showErrors) {
            alert(msg);
        }
    }
}