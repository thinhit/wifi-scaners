var readline = require('readline');
var spawn = require('child_process').exec,
    ls    = spawn('sudo iwlist wlp12s0 scan'),
    color = require("colors"),
    fs = require('fs');

var rl = readline.createInterface({
	input: process.stdin,
	output:process.stdout
});
var stdoutData = "";
var listESSID = [];
var dataHandler = function (data, callback){

	listESSID = [];
	var z = 0;
	var dataSplit = data.split(/\r\n|\r|\n/);
	console.log('        List wifi : '.red);
	for (var i = 0; j = dataSplit.length, i < j; i++){
		if(dataSplit[i].match(/ESSID/i)){
			var essidNormal =  dataSplit[i].split("\"")[1];
			listESSID.push(essidNormal);
			console.log('                 [' + z++ + '] - '+ essidNormal.green);
		}
		if(i == j - 1){
			rl.question("Please choose a ESSID or index of wireless ! : ", function (answer){
				var ssidIndex = parseInt(answer);

				if(listESSID[ssidIndex]){
					spawn('sudo killall wpa_supplicant').on('close', function (code){
							console.log('Kill wpa_supplicant if exits', code);
					
						console.log("Connecting to " + listESSID[ssidIndex].green + '....');
							
						rl.question("Enter password : " , function (answer){
							console.log(answer);						
							fs.readFile(__dirname + '/lib/template.conf','utf8', function (err, resp){
								var data = resp.replace("$ssid", listESSID[ssidIndex]);
								data = data.replace("$psk", answer);

								fs.writeFile('/etc/wpa_supplicant.conf', data, 'utf8', function (err, success){
									if(err) throw new Error('Save error'.blue);
									setTimeout(function (){
											var con = spawn('sudo wpa_supplicant -Dwext -iwlp12s0 -c/etc/wpa_supplicant.conf -B');
											con.on('close', function (code){
												process.exit();
											});
											con.stderr.on('data', function (err){
												console.log(err);
											})
											con.stdout.on('data', function (data){
												console.log(data);
											})
										}
										, 1000);
									
								});
							})						
						})
					})
				}else {
					rl.write("Index invalid", listESSID[ssidIndex]);
				}
				
			})
		}
	}
}

ls.stdout.setEncoding('utf8');

ls.stdout.on('data', function (data){
	stdoutData += data;
})
ls.on('close', function (code){
	dataHandler(stdoutData);
})
ls.stderr.on('data', function (data){
	console.log('stdin', data);
	
	dataHandler(stdoutData);
})

