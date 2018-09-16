<?php 
    $name = $_GET["name"];
    if (!isset($name)) {
        $name = gen_uuid();
    } 
    $filename = "uploads/".$name.".txt";

    
    echo  "<html><head><style>* {margin: 0;padding: 0;}</style><script src='ne.js'></script></head><body><script>function start() {" .file_get_contents($filename)."}</script></body></html>";
?>