<?php

class DeltaEncrypt {
	public function route($s) {
		$u = $s["REQUEST_URI"];
		$s = $s["QUERY_STRING"];

		switch($s) {
			case "getchallenge":
				echo $this->encode(array(
					"challengeResponse",
					rand(-1000000,1000000)
				));
			break;
			case "delta":
				$d = $this->decode($_POST);

				$_POST = array();
				$_GET = array();
				$this->parseStuff($_POST, $d["data"]);
				$this->parseStuff($_GET, $d["params"]);

				//Handle if you want to do something with this $d["url"]

				echo json_encode($_POST);
			break;
		}
	}

	private function parseStuff(&$to, $stuff) {
		if( substr($stuff,0,1) == "?" ) {
			$stuff = substr($stuff, 1);
		}

		$stuff = explode("&", $stuff);
		$c = count($stuff);
		for($i=0;$i<$c;$i++) {
			$t = $stuff[$i];
			$t = explode("=", $t);
			if( count($t) > 1 ) {
				$to[$t[0]] = $t[1];
			}
			else {
				$to[$t[0]] = "";
			}
		}
	}

	private function decode($d) {
		$params = $url = $data = "";
		if( isset($d["p"]) ) {
			$params = $d["p"];
		}
		if( isset($d["d"]) ) {
			$url = $d["d"];
		}
		if( isset($d["o"]) ) {
			$data = $d["o"];
		}

		$lastreliable = $d["lastreliable"];
		$q = 0;
		$lastlen = strlen($lastreliable);

		for($i=0;$i<strlen($params);$i++) {
			$q ++;
			if( $q >= $lastlen )
				$q = 0;

			$params[$i] = $params[$i] ^ $lastreliable[$q];
		}

		$q = 0;
		for($i=0;$i<strlen($url);$i++) {
			$q ++;
			if( $q >= $lastlen )
				$q = 0;
			$url[$i] = $url[$i] ^ $lastreliable[$q];
		}

		$q = 0;
		for($i=0;$i<strlen($data);$i++) {
			$q ++;
			if( $q >= $lastlen )
				$q = 0;
			$data[$i] = $data[$i] ^ $lastreliable[$q];
		}

		return array(
			"url" => $url,
			"params" => $params,
			"data" => $data
		);
	}

	public function encode($array) {
		return "/".implode("/", $array);
	}
}

?>