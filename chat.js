var twitchserver = new WebSocket('wss://irc-ws.chat.twitch.tv/:443/irc')
 
//-----------YOUR SETTINGS HERE-----------
var nick        ='name'          					 		 //nickname all lowercase (no clue what this is for)
var auth        ='oauth:abcd'							     //include oauth:xxxx
var channel 	='channel' 	                                 //channel name
var Fadetime	=3                                 			 //time for message to fade away (in seconds)
var Fadedelay	=30                               			 //time till message starts to fade (in seconds)
//----------------------------------------
 
twitchserver.onopen=function open() {
twitchserver.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership')
twitchserver.send('PASS ' + auth)
twitchserver.send('NICK ' + nick)
twitchserver.send('JOIN #' + channel)
//twitchserver.send('PRIVMSG #'+channel+' :'+message+') //to send a msg to the chat
 
}
 
twitchserver.onmessage=function(data){// message from server
        var info={'other':[]}
        var datas=data.data.split('user-type')//seprates chat message to stop bugs from things being typed in chat
        if (datas.length>1){
                var a=''
                for (var i=1;i<datas.length;i++){
                        a+=datas[i]
                }
                info['user-type']=a
        }
       
        var datas=datas[0].split(';')//format raw data
        if (datas.length){
                for (var i=0;i<datas.length;i++){
                        var a=datas[i].split('=')
                        if (a.length>1){
                                while (a.length>2){
                                        a[1]+=a[2]
                                }
                                info[a[0]]=a[1]
                                continue
                        }else{
                                a=datas[i].split('PING')
                                if (a.length>1){
                                        info.PING=1
                                        continue
                                }
                                a=datas[i].split('JOIN')
                                if (a.length>1){
                                        a[0].split('!')
                                        info.logedon=a[0].split(':')[1].split('!')[0]
                                        continue
                                }
                                a=datas[i].split('PART')
                                if (a.length>1){
                                        a[0].split('!')
                                        info.logedoff=a[0].split(':')[1].split('!')[0]
                                        continue
                                }
                        }
                        info.other.push(datas[i])
                }
               
                if (info['user-type']){
                        var a=info['user-type'].split('!')
                        if (a.length>2){
                                for (var i=2;i<a.length;i++){
                                        a[1]+='!'+a[i]
                                }
                        }
                        info.msgby=a[0].split(':')[1]
                        a=a[1].split('tmi.twitch.tv ')
                        if (a.length>2){
                                for (var i=2;i<a.length;i++){
                                        a[1]+=a[i]
                                }
                        }
                        a=a[1].split(' #')
                        if (a.length>2){
                                for (var i=2;i<a.length;i++){
                                        a[1]+=' #'+a[i]
                                }
                        }
                        info.msgtype=a[0]
                        a=a[1].split(' :')
                        if (a.length>2){
                                for (var i=2;i<a.length;i++){
                                        a[1]+=':'+a[i]
                                }
                        }
                        info.msgto=a[0]
                        info.msg=a[1]
                }
                if (info.PING){//if ping then pong or you will be sighned off
                        twitchserver.send('PONG :tmi.twitch.tv');
                        console.log('PONG Sentrn');
                }
                if (info[':'+channel+'.tmi.twitch.tv 353 '+channel+' ']){//get list of people on the stream.. cant work out how to get this message but i might show up sometimes (untested)
                        a=datas[i].split('End of /NAMES list')
                        if (a.length>1){
                                a=a[0].split('#'+channel+' :')
                                a=a[0].split('↵')
                                console.log(a)
                                SoundJoin.play()
                                SoundLeave.play()
                                SoundMessage.play()
                        }
                }
               
                if (info.msg){//if a message
                        console.log(info.msgby+':'+info.msg)
                        newMessage('message',info.msgby,info.msg,info.color)
                }/*else if (info.logedon){//if some one logedin
                        console.log(info.logedon+' Joined')
                        newMessage('joined',info.logedon,'Joined')
                }else if (info.logedoff){//if some one left
                        console.log(info.logedoff+' Left')
                        newMessage('lefted',info.logedoff,'Left')
                }*/
        }else{
                info=data
        }
        //console.log(info)
}
 
 
var Messages=[]//stores the message popups
var Inchat={}//list of people in chat
 
var SoundJoin = new Audio('http://www.chiptape.com/chiptape/sounds/medium/SOIF_blue5c.wav')
SoundJoin.volume=0.0
var Soundleave = new Audio('http://princezze.free.fr/sounds/bhump.wav')
SoundJoin.volume=0.0
var SoundMessage = new Audio('http://stephane.brechet.free.fr/Sons/MP3/BUBBLE.mp3')
 
function newdiv(stream){//new template background div
        var chat=document.getElementById('chat')//background box
        var div=document.createElement('div')
        document.body.appendChild(div)
        div.id='background'
        div.style.position='absolute'
        div.style.padding='7px'
        div.style.borderRadius='5px'
       
        var src=''
        if (stream=='twitch'){//stream icon
                src='https://blog.roblox.com/wp-content/uploads/2016/12/Twitch-Icon.png'
        }
       
        /*var sitediv=document.createElement('img')//stream icon div
        div.appendChild(sitediv)
        sitediv.id='sitediv'
        sitediv.src=src
        sitediv.style.height='18px'
        sitediv.style.width='18px'
        sitediv.style.float='left'
        sitediv.style.marginRight='3px'*/
       
        return div
}
 
function newMessage(type,name,msg,namecolor){
        var color=[30,30,30,1]
        /*if (type=='message'){
                if (!Inchat[name]){//if a message was sent by some on who is not in Inchat list than add them
                        newMessage('joined',name,'Joined',namecolor)
                }
                color=[0,0,0,.1]
                SoundMessage.play()
        }else if (type=='joined'){
                color=[0,255,0,.1]
                SoundJoin.play()
                Inchat[name]=1
        }else if (type=='lefted'){
                color=[255,0,0,.1]
                Soundleave.play()
                delete Inchat[name]
        }*/
       
        var div=newdiv('twitch')//make background template
        div.style.backgroundColor='rgba('+color[0]+','+color[1]+','+color[2]+','+color[3]+')'
		div.style.color='rgba(255,255,255,1)'
        div.style.bottom='5px'
        div.style.right='10px'
		
		var icondiv=document.createElement('div')//icon div
		div.appendChild(icondiv)
		icondiv.id='icondiv'
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var myObj = JSON.parse(this.responseText);
				icondiv.innerHTML = '<img src="'+myObj.logo+'" width="50px" height="50px"/>';
			}
		};
		xmlhttp.open("GET", "https://api.twitch.tv/kraken/users/"+name+"?client_id=s85u50usod18fb7e823gb0n50qd3zx", true);
		xmlhttp.send();
        icondiv.style.float='left'
		icondiv.style.marginRight='5px'
		icondiv.style.width='50px'
               
        var namediv=document.createElement('div')//username div
        div.appendChild(namediv)
        namediv.id='namediv'
        namediv.innerHTML='<b>'+name+'</b><br/>'
		namediv.innerHTML+='<br/><font color="#fff">'+msg+'</font>'
		namediv.style.display='inline-block'
        namediv.style.color=(namecolor)?namecolor:''
        namediv.style.float='top'
        namediv.style.marginRight='5px'
        namediv.style.fontFamily="'Quicksand',sans-serif"
		namediv.style.width='300px'
       
        /*var msgdiv=document.createElement('div')//message div
        div.appendChild(msgdiv)
        msgdiv.id='msgdiv'
        msgdiv.innerHTML=msg
        msgdiv.style.float='top'
		msgdiv.style.display='inline-block'
        msgdiv.style.maxWidth='300px'
        //msgdiv.style.height='height:auto'
        msgdiv.style.wrap='break-word'
        //msgdiv.style.overflow=
        msgdiv.style.fontFamily="'Quicksand',sans-serif"
		msgdiv.style.width='300px'*/
		
		/*var linebreak = document.createElement("BR")
		div.appendChild(linebreak)*/
       
        for (var i in Messages){//offset old messages so the new one is on the bottom of the pile
                var message=Messages[i][0]
                message.style.bottom=(((document.body.scrollHeight-message.offsetTop)+div.offsetHeight)-(message.offsetHeight))+'px'
        }
        Messages.push([div])
}
 
/*var fps=30
Fadetime=(Fadetime*fps)
Fadedelay=(fps*Fadedelay)+Fadetime
 
function fadeing(){
        setTimeout(function(){
                for (var i in Messages){
                        var message=Messages[i][0]
                        Messages[i][1]-- //timer count down
                        if (Messages[i][1]<Fadetime){// if arfter fade delay
                                var divs=[message]
                                for (var d=0;d<divs.length;d++){//get all elements with in elements
                                        for (var n in divs[d].childNodes){
                                                if (divs[d].childNodes[n].id!=undefined){
                                                        divs.push(divs[d].childNodes[n])
                                                }
                                        }
                                }
                                for (var div in divs){//fade everything
                                        divs[div].style.opacity=Messages[i][1]/Fadetime
                                }
                        }
                        if (Messages[i][1]<0){//remove if fade compleat
                                Messages[i][0].remove()
                                Messages.splice(i,1)
                        }
                }
               
                var len=0
                for (var i in Inchat){//count number of people in chat
                        len++
                }
                document.getElementById('twitchinchat').innerHTML='<b>'+len+'</b>'//update chat number
               
                fadeing()
        },1000/fps)
}*/
 
/*var div=newdiv('twitch')//div people in chat counter
var namediv=document.createElement('div')
div.appendChild(namediv)
div.style.left='0px'
div.style.top='0px'
div.style.backgroundColor='rgba(0,0,0,1)'
div.style.color='rgba(255,255,255,1)'
namediv.id='twitchinchat'
namediv.innerHTML='<b>'+0+'</b>'
namediv.style.float='left'
namediv.style.marginRight='5px'
namediv.style.fontFamily="'Quicksand',sans-serif"*/
 
 
 
//fadeing()
