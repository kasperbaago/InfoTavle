/*
 * LOACTION
 * Gathers user location data using the google api
 */

var geoPosition = {
    
    //Gets the location of the browser
    getLocation: function(callback) {
        this.getBrowserData();
        this.callBack = callback;
    },
    
    getBrowserData: function() {
        navigator.geolocation.getCurrentPosition(function(location) {
            geoPosition.getTownLocation(location);
        }, function() {
            main.hideLoading();
            main.error("Kan ikke hente din lokation, vælg station på listen");
        }, {enableHighAccuracy: true});
    },
    
    getTownLocation: function(location) {
        var latlng = location.coords.latitude + "," + location.coords.longitude;
        $.ajax({
            url: appConf.serverRequst,
            data: {
                latlng: latlng,
                func: 'geocode'
            },
            datatype: 'json',
            success: function(d) {
                 main.loadObject('traindata', function() {
                    if(!d == false) {
                        traindata.UIC = d.stationInfo.UIC;
                        traindata.stationName = d.stationInfo.Name;
                    }
                
                    geoPosition.callBack();
                })
            }
        })
    },
}


