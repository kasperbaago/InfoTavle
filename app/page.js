/* 
 * PAGE  Method
 * Masters the defficult job to put in HTML on the page!
 */

var page = {
    
    //Puts data to display
    putData: function(data, callback) {
        $('#mainContent ul').html("");
        for(i in data.d) {
            this.makeTrainEntry(data.d[i], '#mainContent');
        }
        
        this.addClickListener();
        if(callback) {
            callback();
        }
    },
    
    updateData: function(data, callback) {
        $('#mainContent ul').html("");
        
        for(i in data.d) {
            this.makeTrainEntry(data.d[i], '#mainContent');
        }
        
        this.addClickListener();
        $('#mainContent ul').listview("refresh");
   
        if(callback) {
            callback();
        }
    },
    
    addClickListener: function() {
        $('#mainContent li a').click(function() {
            var tn = $(this).data('trainnumber');
            main.showTrainData(tn);
        })
    },
    
    makeTrainEntry: function(train, container, station) {
        var t;
        var strain = false;
        if(train.ScheduledDeparture) {
            t = traindata.calcTime(train.ScheduledDeparture, train.DepartureDelay);
        } else { //If is s-train
            t = new Date();
            t.setHours(0, train.MinutesToDeparture, 0,0);
            strain = true;
            if(isNaN(t.getMinutes())) return false;
        }
        
        var entry = $("<li><h3></h3><p><span id='text'>Afgår om </span><span id='hour'></span> <span id='min'></span> minut(ter) <span id='late'></span><span id='track'></span></p></li>");
        
        if(t.getHours() == 0 && t.getMinutes() <= 3) {
            $(entry).attr('data-theme', 'e');
        }
        
        if(t.getHours() == 0 && t.getMinutes() <= 1) {
             $(entry).attr('data-theme', 'a');
             $(entry).children('p').html("AFGÅR NU! <span id='track'></span>");
        }
        
         if(parseInt(train.DepartureDelay) > 0) {
            $(entry).children('p').css({color: 'red'});
            $(entry).children('h3').css({color: 'red'});
            $(entry).children('p').children('#late').html("- FOSINKET");
            $(entry).children('p').children('#text').html("Afgår først om ");
        }
        
         if(t.getHours() > 0) {
            $(entry).children('p').children('#hour').html(t.getHours() + " time(r) og ");
        }
        
        if(train.Track.length > 0) {
             $(entry).children('p').children('#track').html("fra spor " + train.Track);
        }
        
        $(entry).children('p').children('#min').html(t.getMinutes());
        
        if(station) {
            $(entry).children('h3').html(station);
        } else {
            var trainNumber = train.TrainNumber;
            
            if(strain) {
                trainNumber = " - Linje " +train.Line;
            }
            
            $(entry).children('h3').html(train.TrainType + " " + trainNumber + " mod " + train.DestinationName); 
            var link = $("<a href='#trainInfo'></a>");
            $(link).attr('data-trainnumber', train.TrainNumber);
            $(link).html($(entry).html());
            $(entry).html(link);
        }

        $(container + ' ul').append(entry);
        return true;
    },
    
    //Outputs a list of all stations
    stationList: function(stationData) {
        for(i in stationData) {
            var name = stationData[i].Name;
            var uic = stationData[i].UIC;
            var entry = $("<li><a href='#trains'><h2>" + name +"</h2></a></li>");
            $(entry).children('a').attr('data-uic', uic);
            $('#stationListContainer ul').append(entry);
        }
         
         $("#stationListContainer a").click(function() {
             var uic = $(this).data('uic');
             var town = $(this).children('h2').html();
             main.showTrainStationDataFromUIC(uic, town);
         })
         
         $('#stationListContainer ul').listview("refresh");
    },
    
    //Shows train info for specific train
    showTrainInfo: function(trainNumber) {
        if(!trainNumber) return false;
        
        var train = traindata.trains[trainNumber];
        //Sets the header
        var h = train.TrainType + " " + train.TrainNumber + " mod " + train.DestinationName;
        main.writeInfoHeader(h);
        
        
        return true;
    },
    
    showStops: function(stops) {
        if(!stops) return false;
        $('#infoList ul').html("");
        
        //Making list
        for(i in stops) {
            var stop = stops[i];
            var station = main.stationList[stop.StationUic];
            this.makeTrainEntry(stop, '#infoList', station.Name);
            
        }
        
        $('#infoList ul').listview("refresh");
        
        return true;
    }
}