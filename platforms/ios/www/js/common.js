var googleSearchBox = null;


function getReadableDate(dt)
{
		var endDate = String(dt).split("-");
		var month = new Array();
		month[0] = "Jan";
		month[1] = "Feb";
		month[2] = "Mar";
		month[3] = "Apr";
		month[4] = "May";
		month[5] = "Jun";
		month[6] = "Jul";
		month[7] = "Aug";
		month[8] = "Sep";
		month[9] = "Oct";
		month[10] = "Nov";
		month[11] = "Dec";
		var monthname = month[endDate[1]-1];
		return endDate[2] + " " + monthname +" "+endDate[0];
}

function returnDisplayText(advtype, advval1, advval2, advval3, country, symbol)
{
	var countrysymbol='';
	if(country=='IN')
	{
		countrysymbol='<span class="WebRupee">&#x20B9;</span>';
	}
	else
	{
		countrysymbol=symbol;
	}
	
	if(advtype==1)
	{
		displaytext = countrysymbol + '<span class="strikeThrough">' + advval2.toString() + '</span>' + ' <span class="calm">' + countrysymbol + advval3.toString() + '</span>'; 
	}
	else if(advtype==2)
	{
		displaytext = "Buy 1 Get 1 FREE";
	}
	else if(advtype==3)
	{
		displaytext = "Buy 1 GET Second 50% OFF";
	}
	else if(advtype==4)
	{
		displaytext = advval1.toString() + "% OFF"; 
	}
	else if(advtype==5)
	{
		displaytext = advval1.toString() +"% OFF UPTO "+ countrysymbol + advval2.toString();			
	}
	else if(advtype==6)
	{
		displaytext = countrysymbol + advval2.toString() +" OFF min spend "+ countrysymbol + advval3.toString();
	}
	else if(advtype==7)
	{
		displaytext = "ONLY " +  countrysymbol + advval2.toString();
	}
	return displaytext;
}
function sendInitRecs(lat,lng,ccode,cntry,devid,devmodel,devplatform,devversion,ajaxURL)
{
	$.ajaxSetup({async:false});
	$.get(ajaxURL,
	{
		dev_id:devid,
		dev_model:devmodel,
		dev_platform:devplatform,
		dev_version:devversion,
		ulat:lat,
		ulng:lng,
		cntrycode:ccode,
		cuntry:cntry
	},
	function(data) {});
}