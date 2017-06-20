(function($){
  $(function(){
	loadData();
	poll();
	
	$('.openModal').click(function(){
		//var student_number = $('.modal-content').html($(this).attr('sn'));
		var student_number = $(this).attr('sn');
		var dateElement = document.getElementById("datetimeList");
		$.ajax({
			type: 'get',
			url: 'studentLogs',
			dataType: 'json', 
			data: {
				student_number: student_number
			},
			success: function(data) {
				var sb = '';
				var totalTime = "00:00:00";
				for(var i=0; i < data.length; i=i+2) {
					var getTime = data[i].datetime.split(" ");
					var day = getTime[0].split("-");

					var remainingData = data.length - i;
					var computedTime = 0;
					if (remainingData >= 2) {
						var getTime2 = data[i+1].datetime.split(" ");
						computedTime = computeTimeDiff(getTime[1], getTime2[1]);
						totalTime = addTime(totalTime, computedTime);
					}

					var nextTime;
					var nextDay = day;
					if (i < (data.length-2)) {
						nextTime = data[i+2].datetime.split(" ");
						nextDay = nextTime[0].split("-");
					}

					var prevTime;
					var prevDay;
					if (i != 0) {
						prevTime = data[i-2].datetime.split(" ");
						prevDay = prevTime[0].split("-");
					}

					if(dateElement.classList.contains(day[1]) && dateElement.classList.contains(day[0])) {
						sb +=  '<tr>' +
							'<td>' + (nextDay[2] != day[2] && prevDay[2] != day[2]? (day[1] + " " + day[2]) : (" ") ) + '</td>' +
							'<td>' + normalTime(getTime[1]) + '</td>' +
							'<td>' + (remainingData < 2? ' ' : normalTime(getTime2[1])) + '</td>' +
							'<td>' + (remainingData < 2? ' ' : computedTime) + '</td>' +
						'</tr>';

						if (remainingData >= 2) {
							monthlyTotal = addTime(monthlyTotal, computedTime);
						}
					} else {
						var monthlyTotal = computedTime;
						dateElement.classList.add(day[1]);
						dateElement.classList.add(day[0]);

						var today = new Date();
						var year = today.getFullYear();
						today = today.toString();
						var month = today.split(" ");

						if (day[1].search(month[1]) == 0 && day[0] == year) {
							sb += '<li> <div class="collapsible-header active row teal lighten-2">';	
						} else {
							sb += '<li> <div class="collapsible-header row">';
						}

						sb += '<h5 class="col s6" style="padding-top:10px;">' + day[1] + " " + day[0] + '</h5>' + 
									'<p class="col s6 right-align"> Total Time: 00:00:00 </p>'
								+ ' </div> <div class="collapsible-body"> ' +
								'<table class="centered striped responsive-table highlight bordered"> <thead> <tr>' +
									'<th> Date </th>' +
									'<th> In </th>' +
									'<th> Out </th>' +
									'<th> Duration </th>' +
								'</tr> </thead> <tbody>';
						sb +=  '<tr>' +
									'<td>' + day[1] + " " + day[2] + '</td>' +
									'<td>' + normalTime(getTime[1]) + '</td>' +
									'<td>' + (remainingData < 2 ? ' ' : normalTime(getTime2[1])) + '</td>' +
									'<td>' + (remainingData < 2 ? ' ' : computedTime) + '</td>' +
								'</tr>';

					}

					if (day[1] != nextDay[1] || i == data.length-1 || i == data.length - 2) {
						var monthString = "Total Time: " + (data.length == 1? "00:00:00" : monthlyTotal);
						sb = sb.replace(" Total Time: 00:00:00 ", monthString);

						monthlyTotal = "00:00:00";	
						sb += '</tbody> </table></div> </li>';	
						dateElement.classList.remove(day[1]);
						dateElement.classList.remove(day[0]);
					}
				}

				var timeComputed = '<p>TOTAL TIME REPORTED: ' + totalTime + '</p>';
				$('#totalTime').html(timeComputed);
				$('.datetime-list').html(sb);

				makeCollapsible();

				$('.collapsible-header').on('click', function(e) {
					$('.collapsible-header').removeClass('teal lighten-2');			
					$(this).addClass('teal lighten-2');
				});

				$('#modal1').openModal();				
			}
		});
	});	


	function makeCollapsible (){
	    $('.collapsible').collapsible();
	}

	function normalTime(date) {
		var newTime = "";
		var time = date.split(":");
		if (time[0] > 12) {
			var hours = time[0] - 12;
			newTime = (hours < 10? '0'+hours: hours) + ":" + time[1] + ":" + time[2] + " PM";
		} else {
			newTime = time[0] + ":" + time[1] + ":" + time[2] + " AM";
		}
		return newTime;	
	}

	function addTime(time1, time2) {
		var splitTime1 = time1.split(":");
		var splitTime2 = time2.split(":");
		var addedTime = [0,0,0];

		for(i=splitTime2.length-1; i >= 0; i--) {
			splitTime1[i] = parseInt(splitTime1[i]);
			splitTime2[i] = parseInt(splitTime2[i]);
			tempTotal = splitTime1[i] + splitTime2[i];
			if (tempTotal > 59 && i > 0) {
				tempTotal = tempTotal - 60;
				splitTime1[i-1]++;
			} 
			addedTime[i] = (tempTotal < 10? '0'+tempTotal: tempTotal);
		}

		return (addedTime[0] + ":" + addedTime[1] + ":" + addedTime[2]);
	}

	function computeTimeDiff(time1, time2) {
		var splitTime1 = time2.split(":");
		var splitTime2 = time1.split(":");
		var timeDifference = ["0", "0", "0"];

		for(i=splitTime1.length-1; i >= 0; i--) {
			splitTime1[i] = parseInt(splitTime1[i]);
			splitTime2[i] = parseInt(splitTime2[i]);

			if (i != 0) {
				if (splitTime1[i] < splitTime2[i]) {
					splitTime1[i-1]--;
					splitTime1[i]+=60;
				}
			} 
			tempDiff = Math.abs(splitTime1[i] - splitTime2[i])
			timeDifference[i] = (tempDiff < 10? '0'+tempDiff: tempDiff);
		}

		return(timeDifference[0] + ":" + timeDifference[1] + ":" + timeDifference[2]);
 	}
	
	$('#student_number').keyup(function() {
		var student_number = $('#student_number').val();
		if (student_number.length == 10) {
			var regex = new RegExp("[0-9]{4}-[0-9]{5}");
			$('#student_number').val('');
			
			if (regex.test(student_number) == false) {
				Materialize.toast('Invalid student number!', 2000);
			} else {
				
				$.ajax({
					type: 'post',
					url: 'inout',
					dataType: 'json',
					data: {
						sn: student_number
					},
					success: function(r){
						//window.location.reload();
						if(r.new){
							var sb = '<div class="col m3"><check if=" ' +r.log_type+ ' == 0 "><true><div id=" '+r.log['sn']+' " class="card cardStudent grey lighten-2 "></true><false><div id=" '+r.log['sn']+' " class="card cardStudent teal "></false></check><div class="card-content black-text"><span class="card-title">  '+r.log['sn']+'  </span><p>Total Time Reported:  '+r.log['datetime']+'  </p></div><div class="card-action center"><button href="" sn=" '+r.log['sn']+' " class="waves-effect waves-light btn openModal" data-="recordsModal" >Daily Time Record</button></div></div></div>';
							$('.card-list').append(sb);
						}
						else{
						  	if(r.log_type == '0'){
						  		console.log("YAY");
						  		$('#'+r.log['sn']).removeClass('teal');
						  		$('#'+r.log['sn']).addClass('grey lighten-2');
						  	}
						  	else{
						  		console.log("Nay!");
						  		$('#'+r.log['sn']).removeClass('grey lighten-2');
						  		$('#'+r.log['sn']).addClass('teal');
						  	}
						}

						Materialize.toast("Successfully logged "+ ((r.log_type == 0)? 'out.': 'in.'), 5000);
					},
					error: function(e){
						console.log(e);
					}
				});
			} 
		} else if (student_number.length > 10) {
			$('#student_number').val("");
		}
	});
	
	function loadData() {
		$.ajax({
			type: 'get',
			url: 'studentNumbers',
			dataType: 'json',
			success: function(data) {
				var studentName = {
					'2013-23032': "William",
					'2011-05336': "CJ",
					'2013-60644': "Tessa",
					'2013-05450': "Hannah",
					'2013-28670': "Nicole",
					'2013-30409': "Coleen",
					'2009-17752': "Patricia",
					'2013-51774': "Alex",
					'2013-07304': "Cid",
					'2012-76554': "Arvin",
					'2012-07025': "Michael",
					'2015-05444': "Miguel",
					'2009-04386': "Paolo",
					'2015-02574': "Michelle",
					'2011-59046': "Henry",
					'2011-50539': "Charlotte",
					'2010-01251': "Justin",
					'2014-62691': "Christine",
					'2015-62691': "Grace",
					'2016-58942': "Clary",
					'2014-62692': "Janine",
					'2014-89526': "Peter",
					'2013-56564': "Vanessa",
					'2013-56894': "Bill",
					'2013-58942': "Erika",
					'2013-12154': "Jane",
					'2013-78945': "Jade",
					"2014-78945": 'Daiki',
					"2013-78412": "Jennifer"
				};

				i=0;
				$(document).ready(function() {
					$(".card-list").children().each(function() {
						console.log(studentName[data[i].sn]);
						$(this).find(".cardName").html(studentName[data[i].sn]);
						$(this).find(".cardImage").attr("src", "ui/img/" + data[i].sn + ".jpg");
						i++;
					});
				});
				
			}, 
			error: function(error) {
				console.log(error);
			}		
		});
	}

	function poll() {
		$.ajax({
	  		type : 'get',
	  		url : 'update',
	  		dataType : 'json',
	  		success : function(response){
  				for (var sn in response) {
				  if (response.hasOwnProperty(sn)) {
				  	if(response[sn].type == '0'){
				  		$('#'+sn).removeClass('teal');
				  		$('#'+sn).addClass('grey lighten-2');
				  	}
				  	else{
				  		$('#'+sn).removeClass('grey lighten-2');
				  		$('#'+sn).addClass('teal');
				  	}
				  }
				}

  				setTimeout(function(){
						poll();
  				},3000);
	  		}
	  	});
	}

  }); // end of document ready
})(jQuery); // end of jQuery name space