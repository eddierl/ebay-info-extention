function parseDate(dateString) {
	var datesArray =  dateString.match(/[^\d\s]+\s\d+/g);
	return datesArray.map(function(dateS) { return Date.parse(dateS) });
}

function ms2days(ms) {
	return ms/1000/60/60/24;
}
function generateCss(from_delivery) {
var css_result = "";
	function updateColorScheme(levels) {
		var count = 0
		var count2 = 0;
		for (l in levels) count++;
		scheme=['green','yellow','orange','red','brown'];
		
		if(count<5) {scheme.splice(scheme.indexOf("brown"),1)}
		if(count<4) {scheme.splice(scheme.indexOf("orange"),1)}
		if(count<3) {scheme.splice(scheme.indexOf("yellow"),1)}
		if(count<2) {scheme.splice(scheme.indexOf("red"),1)}
		
		for(l in levels) {levels[l] = scheme[count2]; count2++};
	}

	var unique = {};
	from_delivery.forEach(function(item) {unique[item]=item});
	updateColorScheme(unique);
	
	for (item in unique) css_result += '.my_dynclass' + item + ' { color: ' + unique[item] + '; }';

	return css_result;
}
function main() {

	var from_delivery = [];
	var results=document.getElementById("ResultSetItems").getElementsByTagName("table");
	
	var url;
	
	// array of all xhr ojects
	var xhr= [];
	
	// how much accual reuqests were initialized
	var requests_count=0;
	
	for (var i = 0; i < results.length; i++) {
	
	// url to the item page
	url = results[i].getElementsByClassName("vip")[0].href;
	
	// helps reduce number of requests if there is no shipping anyway
	shipping_details = results[i].getElementsByClassName("ship")[0];
	if((!(shipping_details)) ||shipping_details.innerText.indexOf("not") != -1) {continue;}
	
	
	requests_count++;
	xhr.push(new XMLHttpRequest());
	
	// async requests
	xhr[xhr.length-1].open("GET", url, true);
	
	// there is need to assign the onreadystatechange this way
	// otherwise the function is contact with index = 0
	xhr[xhr.length-1].onreadystatechange = function(index) {
	
		return function() {
			  if (xhr[index].readyState == 4 && xhr[index].status==200) {
				
				var parser=new DOMParser();
				var res=parser.parseFromString(xhr[index].responseText,"text/html");
				
				if (!(res)){return;};
				var seller_node = res.getElementsByClassName("mbg-nw")[0];
				var item_desc = res.getElementById("vi-lkhdr-itmTitl").innerText;

				// add estimated date for delivery to the item
				var estimated_date = res.getElementsByClassName("sh-del-frst")[0].childNodes[1];
				estimated_date.style.lineHeight ="1.25em";
				
				// attach a dynamic class to the estimate date
				var fd = ms2days((parseDate(estimated_date.innerText)[1] - parseDate(Date())[0]));
				from_delivery.push(fd);
				estimated_date.className += "my_dynclass" + fd;
				results[index].getElementsByClassName("dtl dtlsp")[0].appendChild(estimated_date);
				
				// add seller rank to the item
				var rank = res.getElementById("si-fb");
				rank.className = "logos";
				results[index].getElementsByClassName("dtl dtlsp")[0].appendChild(rank);
				
				// add external url for a feed about the seller to the item
				var feedback_url=document.createElement("a");
				feedback_url.href = "http://www.feedbackselector.com/feedsearch.php?seller=" + seller_node.innerText + "&itemName=" + item_desc;
				feedback_url.innerText = "feedbacks";
				feedback_url.target = "blank";
				results[index].getElementsByClassName("dtl dtlsp")[0].appendChild(feedback_url);
				
			}
		}
		}(xhr.length-1);
		
		xhr[xhr.length-1].send();
		
	}
	console.log("Number of requests initialized: " + xhr.length + "/" + results.length);		

	// add css configurations 
	var styleSheetElement = document.createElement("style");
	styleSheetElement.type = "text/css";
	document.getElementsByTagName("head")[0].appendChild(styleSheetElement);
	var check = setInterval(function(){
		if(xhr.length == from_delivery.length) {window.clearInterval(check);} 
		else {styleSheetElement.innerHTML = generateCss(from_delivery);}}, 1000);
	
}

main();