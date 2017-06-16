<?php
class Controller {
	protected $f3;
	protected $db;
	public function __construct() {
		if ((float)PCRE_VERSION<7.9) trigger_error('PCRE version is out of date');
		$this->f3 = Base::instance();
		date_default_timezone_set($this->f3->get('TIMEZONE'));
		
		$this->f3->set('DB',new DB\SQL(
			'mysql:host='.$this->f3->get('DB_HOST').';port=3306;dbname='.$this->f3->get('DB_NAME'),
			$this->f3->get('DB_USER'),
			$this->f3->get('DB_PASS'), 
			array(\PDO::ATTR_PERSISTENT => TRUE))
		);
		
		$this->db = $this->f3->get('DB');
		new \DB\SQL\Session($this->db,'sessiondata',TRUE,function($session){
			return false; // destroy session
		});
	}

	function renderView($filename){
		echo Template::instance()->render($this->f3->get('VIEWS').$filename);
	}

	function beforeroute() {

	}

	function afterroute() {
		
	}
}
