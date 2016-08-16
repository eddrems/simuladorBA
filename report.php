<?php

require_once('libs/dompdf/dompdf/dompdf_config.inc.php');
require_once('libs/dompdf/dompdf/include/autoload.inc.php');

$dompdf = new DOMPDF();

    $html = <<<ENDHTML
        <body marginwidth="0" marginheight="0" class="body">


            <style type="text/css">

                @page {
                    margin-top: 2em;
                    margin-left: 0em;
                }

                .body {
                  background-color: transparent;
                  color: black;
                  font-family: "verdana", "sans-serif";
                  margin: 0px;
                  padding-top: 0px;
                  font-size: 1em;
                }

                .content_fecha{
                    padding-top: 0.5cm;
                    padding-right: 0cm;
                    text-align: right;
                    font-size: 12px;
                }

                .content{
                    padding-left: 1cm;
                    padding-right: 1cm;
                    font-size: 12px;
                }

                table.sample {
                    border-width: 1px;
                    border-style: none;
                    border-color: blue;
                    border-collapse: collapse;
                    background-color: white;
                }

                table.sample th {
                    border-width: 1px;
                    padding: 2px;
                    border-style: solid;
                    border-color: black;
                    background-color: white;
                }

                table.sample td {
                    border-width: 1px;
                    padding: 2px;
                    border-style: solid;
                    border-color: black;
                    background-color: white;
                }

                table.sample tr {
                    height: 0.7cm;
                }

            </style>
         <div>
        <img src="ui/assets/images/banner_01.jpg" style="width: 22cm; margin-top:-31px;">
ENDHTML;


    $html = $html . $_POST['reporte_contenido'];
    //$f3->get('POST.reporte_contenido');

    $html = $html  . ' </div></div>'
                   . '</div>'
                   . '</body>';


    $dompdf->load_html($html);
    $dompdf->render();

    $dompdf->stream('my.pdf',array('Attachment'=>0));
