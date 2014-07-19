function main() {

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
}

main();