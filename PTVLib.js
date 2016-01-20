//ptv lib
//
//


var PTVAPI = function() {
	this.devKey, this.securityKey = "";
	this.apiUrl = "http://timetableapi.ptv.vic.gov.au";
	this.currentReturnedRoutesForLocation = null;
	this.init = function(devKey,securityKey) {
		this.devKey = devKey;
		this.securityKey = securityKey;
		this.routesForLocation_event  = document.createEvent("Event");
		this.routesForLocation_event.initEvent("routesForLocationReturned",true,true);
		this.routesForLocation_event.result = null;
	};
	this.performHealthCheck = function() {
		var healthCheckUrl = "/v2/healthcheck?devid="+this.devKey;
		var signature = new jsSHA("SHA-1","TEXT");
		signature.setHMACKey(this.securityKey,"TEXT");
		signature.update(healthCheckUrl);

		var ajaxRequest = new XMLHttpRequest();
		var result = "";
		var resultJson = null;
		var isOkToContinue = false;
		ajaxRequest.onreadystatechange = function() {
			if(ajaxRequest.readyState==4) {
				if(ajaxRequest.status==200) {
					result = ajaxRequest.responseText;
					//console.log(result);
					//resultJson = JSON.stringify(eval("(" + result + ")"));
					resultJson = JSON.parse(result);
					if(resultJson.securityTokenOK == true) {
						console.log("HEALTH CHECK IS OK");
						isOkToContinue = true;

					}
				}
			}
		};
		ajaxRequest.open("GET",this.apiUrl + healthCheckUrl + "&signature="+signature.getHMAC("HEX"),true);
		ajaxRequest.send();
	};
	this.getRoutesForLocation = function(lat,lon,callback) {
		var url = "/v2/nearme/latitude/"+lat+"/longitude/"+lon+"?devid="+this.devKey;
		var signature = new jsSHA("SHA-1","TEXT");
		signature.setHMACKey(this.securityKey,"TEXT");
		signature.update(url);
		
		var ajaxRequest = new XMLHttpRequest();
		var result = "";
		var resultJson = null;
		var returnedRoutes = null;
		var evt = this.routesForLocation_event;
		window.addEventListener("routesForLocationReturned",callback);
		ajaxRequest.onreadystatechange = function() {
			if(ajaxRequest.readyState==4) {
				if(ajaxRequest.status==200) {
					result = ajaxRequest.responseText;
					//console.log(result);
					resultJson = JSON.parse(result);
					//console.log(resultJson);
					returnedRoutes = resultJson;
					//this.currentReturnedRoutesForLocation.bind(this) = returnedRoutes;
					evt.result = returnedRoutes;
					window.dispatchEvent(evt);
				}
			}
		};
		
		ajaxRequest.open("GET",this.apiUrl + url + "&signature="+signature.getHMAC("HEX"),true);
		ajaxRequest.send();

	};
	this.getStopAtIndexFromRoutes = function(arrayOfResults, index) {
		var result = arrayOfResults[index];
		result = result.result;
		return result;	
	};
	this.stopType = {
		Bus: "bus",
		Rail: "vline"
	};
	this.getStopsOfTypeFromRoutes = function(arrayOfResults,type) {
		var results = new Array();
		var resultCounter = 0;
		for(var i = 0;i<arrayOfResults.length;i++) {
			var a = arrayOfResults[i].result;
			if(a.transport_type == type) {
				results[resultCounter] = a;
				resultCounter++;
			}
		}
		return results;
	};
	this.getStopRouteNumbersFromStop = function() {
		
	};
};

