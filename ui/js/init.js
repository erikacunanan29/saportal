(function($){
  $(function(){
	loadData();
	
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
				console.log("YAAY~");
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
						sb += '<li> <div class="collapsible-header row monthHeader">'
								+ '<h5 class="col s6" style="padding-top:10px;">' + day[1] + " " + day[0] + '</h5>' + 
									'<p class="col s6 right-align"> Total Time: 00:00:00 </p>'
								+ ' </div> <div class="collapsible-body"> ' +
								'<table class="centered striped responsive-table"> <thead> <tr>' +
									'<th> Date </th>' +
									'<th> In </th>' +
									'<th> Out </th>' +
									'<th> Duration </th>' +
								'</thead> </tr> <tbody>';
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

				$('.datetime-list').collapsible({
			      accordion: true,
			      onOpen: function(el) { console.log('open'); },
			      onClose: function(el) { console.log('closed'); } 
			    });

				$('#modal1').openModal();
			}
		});
	});


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
							var sb = '<div class="col m3"><check if=" ' +r.log_type+ ' == 0 "><true><div id=" '+r.log['sn']+' " class="card cardStudent blue-grey "></true><false><div id=" '+r.log['sn']+' " class="card cardStudent teal "></false></check><div class="card-content black-text"><span class="card-title">  '+r.log['sn']+'  </span><p>Total Time Reported:  '+r.log['datetime']+'  </p></div><div class="card-action center"><button href="" sn=" '+r.log['sn']+' " class="waves-effect waves-light btn openModal" data-="recordsModal" >Daily Time Record</button></div></div></div>';
							$('.card-list').append(sb);
						}
						else{
							var studentElement = document.getElementById(r.log['sn']);
							$(studentElement.classList.remove(r.log_type?'blue-grey': 'teal'));
							$(studentElement.classList.add(r.log_type? 'teal': 'blue-grey'));
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
			}, 
			error: function(error) {
				console.log(error);
			}		
		});
	}
	

  }); // end of document ready
})(jQuery); // end of jQuery name space