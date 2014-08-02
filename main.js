const MY_CLASS = "my_dynclass";
var re_MY_CLASS = new RegExp(MY_CLASS + '\\d+');

function parseDate(dateString) {
	var datesArray =  dateString.match(/[^\d\s]+\s\d+/g);
	if (datesArray) {
		return datesArray.map(function(dateS) { return Date.parse(dateS) });
	}
	else {
		return [99,99];
	}
}
function helpLink() {
	var className = (this.firstChild.className).match(re_MY_CLASS)[0];
	var items = document.getElementsByClassName(className);
	

	for (i in items) {
	
		if ( i == items.length - 1) {items[0].parentNode.scrollIntoView(); return false;}

		if (items[i].parentNode.getBoundingClientRect().bottom - items[i].parentNode.getBoundingClientRect().height  > 0) { 
		items[i].parentNode.scrollIntoView(); 
		return false;}

	};

}
function ms2days(ms) {
	return ms/1000/60/60/24;
}
function generateCss(from_delivery) {

	var css_result = "#tstid ul :hover {text-decoration: underline; cursor: pointer;}";
	
	function updateColorScheme(levels) {
		var count = 0
		var count2 = 0;
		for (l in levels) count++;
		scheme = {0 : '{color : limegreen}',
				  1 : '{color : gold}',
				  2 : '{color : orange}',
				  3 : '{color : red}',
				  4 : '{color : brown}'};

		if (count < 5) delete scheme[4]
		if (count < 4) delete scheme[2]
		if (count < 3) delete scheme[1]
		if (count < 2) delete scheme[3]
		
		scheme_list = [];
		for (color in scheme) scheme_list.push(scheme[color]);
		for (l in levels) {levels[l] = scheme_list[count2]; count2++};
	}

	var unique = {};
	from_delivery.forEach(function(item) {unique[item] = item});
	updateColorScheme(unique);
	
	for (item in unique) css_result += '.' + MY_CLASS  + item + ' ' + unique[item] + ' ';

	return css_result;
}
function main() {

	var from_delivery = [];
	var results=document.getElementById("ResultSetItems").getElementsByTagName("table");
	
	var url;
	
	// array of all xhr ojects
	var xhr = [];
	
	// how much accual reuqests were initialized
	var requests_count = 0;
	
	for (var i = 0; i < results.length; i++) {
	
	// url to the item page
	url = results[i].getElementsByClassName("vip")[0].href;
	
	// helps reduce number of requests if there is no shipping anyway
	shipping_details = results[i].getElementsByClassName("ship")[0];
	if((!(shipping_details)) ||shipping_details.innerText.indexOf("not") != -1) continue;
	
	
	requests_count++;
	xhr.push(new XMLHttpRequest());
	
	// async requests
	xhr[xhr.length-1].open("GET", url, true);
	
	// there is need to assign the onreadystatechange this way
	// otherwise the function is contact with index = 0
	var waitinf_for_text=document.createElement("div");
	waitinf_for_text.className="waitfor";
	waitinf_for_text.innerText="waiting for data..";
	results[xhr.length-1].getElementsByClassName("dtl dtlsp")[0].appendChild(waitinf_for_text);
	xhr[xhr.length-1].onreadystatechange = function(index) {
	
		return function() {
			  if (xhr[index].readyState == 4 && xhr[index].status == 200) {
				
				results[index].getElementsByClassName("dtl dtlsp")[0].removeChild(results[index].getElementsByClassName("dtl dtlsp")[0].lastChild);
				var parser=new DOMParser();
				var res=parser.parseFromString(xhr[index].responseText,"text/html");
				
				if (!(res)){return;};
				var seller_node = res.getElementsByClassName("mbg-nw")[0];
				var item_desc = res.getElementById("vi-lkhdr-itmTitl").innerText;

				// add estimated date for delivery to the item
				var estimated_date = res.getElementsByClassName("sh-del-frst")[0].childNodes[1];
				if(!(estimated_date)) {
					estimated_date = document.createElement("div");
					estimated_date.appendChild(document.createElement("span"));
					estimated_date.firstChild.className = "vi-acc-del-range";
					estimated_date.firstChild.textContent = "Unknown";
				}
				estimated_date.style.lineHeight ="1.25em";
				
				// attach a dynamic class to the estimate date
				var fd = ms2days((parseDate(estimated_date.innerText)[0] - parseDate(Date())[0]));
				var td = ms2days((parseDate(estimated_date.innerText)[1] - parseDate(Date())[0]));
				var delivery_date = parseDate(estimated_date.innerText);

				var val = Math.round(Math.sqrt(Math.pow(fd,2) + Math.pow(td,2)));
				from_delivery.push(val);
				estimated_date.className += " " + MY_CLASS + val;
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
	
	var divElement = document.createElement("div");
	document.getElementsByTagName("body")[0].appendChild(divElement);
	divElement.id = "tstid";
	divElement.style.position = "fixed";
	divElement.style.top = "0";
	divElement.style.width = "10%";
	divElement.style.paddingTop = "3%";
	
	divElement.innerHTML = "<ul></ul>";
	var check = setInterval(function(){
		if(updateContent(styleSheetElement, from_delivery) && 
		  (xhr.length == from_delivery.length) && 
		  (document.getElementsByClassName("waitfor").length == 0)) {
		
		window.clearInterval(check);
		updateContent(styleSheetElement, from_delivery);
		}
		}, 1000);
	
}

function  generateHelp(from_delivery) {
	var result = document.createElement("ul");
	result.style.fontWeight = "bold";
	var unique = {};
	from_delivery.forEach(function(item) {unique[item] = item});
	
	for (id in unique) {
		var items = document.getElementsByClassName(MY_CLASS + id);
		unique[id] = items[0].cloneNode(true);
		unique[id].style.display="block";
		unique[id].textContent = unique[id].textContent.replace("Estimated between","");
		unique[id].textContent = "(" + (items.length -1) + ") " +unique[id].textContent
		
	}
	
	for (id in unique) {
	var il = document.createElement("il");
	il.appendChild(unique[id]);
	il.addEventListener("click" ,helpLink);
	result.appendChild(il);
	};
	
	
	return result;
}

function updateContent(styleSheetElement, from_delivery) {
styleSheetElement.innerHTML = generateCss(from_delivery);

document.getElementById("tstid").replaceChild(generateHelp(from_delivery),document.getElementById("tstid").firstChild);

}

main();