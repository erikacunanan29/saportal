<?php

class PageController extends Controller{

	function home(){
		$lm = new LogMapper($this->db);
		$lm->load(array(),array('order'=>'id'));
		
		$snArray = [];
		while(!$lm->dry()) {
			$snArray[$lm->sn] = $lm->cast();

			/*for ($i = 0; $i < count($snArray); $i++) {
				if ($lm['sn'] == $snArray[$i]['sn']) {
					$uniqueChecker  = false;
					$snArray[$i] = $lm->cast();
				}
			}
			
			if ($uniqueChecker == true) {
				$snArray[] = $lm->cast();
			} */
			$lm->next();
		}
		
		$this->f3->set('snArray', $snArray);
		
		$this->renderView('index.htm');
	}

	function inout(){
		$lm = new LogMapper($this->db);
		$lm->load(
			array('sn = ?', $_POST['sn']),
			array('order'=>'datetime DESC')
		);

		$new = false;
		
		if($lm->dry()){
			$new = true;
			$lm->sn = $_POST['sn'];
			$lm->datetime = date('Y-m-d H:i:s');
			$lm->type = 1;
		}
		else{
			$type = $lm->type;
			$lm->reset();
			$lm->sn = $_POST['sn'];
			$lm->datetime = date('Y-m-d H:i:s');
			$lm->type = ($type == 0)? 1: 0;
		}
		$lm->save();
		
		echo json_encode(array(
			"response"=>"Log Saved.", 
			"log_type"=>$lm->type, 
			'new'=>$new, 
			'log'=>$lm->cast()
		));
	
	}
	
	function getLogs(){
		$lm = new LogMapper($this->db);
		
		$lm->load(
			array('sn = ?', $_GET['student_number'])
		);
		
		$arr = [];
		while(!$lm->dry()){
			$arr[] = $lm->cast();
			$lm->next();
		}
		
		for($i = 0; $i < count($arr); $i++) {
			//$tempDate = $arr[$i]['datetime'];
			$date = date_create_from_format('Y-m-d H:i:s', $arr[$i]['datetime']);
			$tempDate1 = date_format($date, "Y-F-d H:i:s");
			$arr[$i]['datetime'] = $tempDate1;
		}

		/*$duration = [];
		$i = 0;
		while ($i < count($arr)) {
			$dateStart = new DateTime($arr[$i]['datetime']);
			$dateEnd = new DateTime($arr[$i+1]['datetime']);
			$dateDiff = $dateStart->diff($dateEnd);
			array_push($duration, $dateDiff->format("%H:%i:%s"));
			$i = $i+1;

			if ((count($arr) - $i) < 2) {
				break;
			}
		}*/

		echo json_encode($arr);
	}
	
	function getSN() {
		$lm = new LogMapper($this->db);
		$lm->load();
		
		$snArray = [];
		while(!$lm->dry()) {
			$uniqueChecker = true;
			for ($i = 0; $i < count($snArray); $i++) {
				if ($lm['sn'] == $snArray[$i]['sn']) {
					$uniqueChecker  = false;
					$snArray[$i] = $lm->cast();
				}
			}
			
			if ($uniqueChecker == true) {
				$snArray[] = $lm->cast();
			} 
			$lm->next();
		}

		echo json_encode($snArray);
	}
}