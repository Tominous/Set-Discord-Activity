var discordPort,youtubePort,soundcloudPort,plexPort,source="custom",
resetActivity=()=>{
	if(discordPort!==undefined)
		discordPort.postMessage({
			type:0,
			name:"",
			streamurl:"",
			details:"",
			state:"",
			partycur:"",
			partymax:""
		})
}
chrome.storage.local.get(["source"],result=>source=result.source)
chrome.runtime.onConnect.addListener(port=>{
	if(port.name=="discord")
	{
		if(discordPort!==undefined)
		{
			discordPort.postMessage({action:"close"})
			discordPort.disconnect()
		}
		discordPort=port
		console.info("Discord port opened")
		port.onDisconnect.addListener(()=>{
			console.info("Discord port closed")
			discordPort=undefined
			if(source=="youtube"&&youtubePort!==undefined)
				youtubePort.postMessage({listen:false})
		})
		if(source=="custom")
			chrome.storage.local.get(["type","name","streamurl","details","state","partycur","partymax"],result=>discordPort.postMessage(result))
		else if(source=="youtube"&&youtubePort!==undefined)
			youtubePort.postMessage({listen:true})
		else if(source=="soundcloud"&&soundcloudPort!==undefined)
			soundcloudPort.postMessage({listen:true})
		else
			resetActivity()
	}
	else if(port.name=="youtube")
	{
		if(youtubePort!==undefined)
		{
			youtubePort.postMessage({action:"close"})
			youtubePort.disconnect()
		}
		youtubePort=port
		console.info("YouTube port opened")
		port.onDisconnect.addListener(()=>{
			console.info("YouTube port closed")
			youtubePort=undefined
			if(source=="youtube")
				resetActivity()
		})
		if(source=="youtube"&&discordPort!==undefined)
			youtubePort.postMessage({listen:true})
	}
	else if(port.name=="soundcloud")
	{
		if(soundcloudPort!==undefined)
		{
			soundcloudPort.postMessage({action:"close"})
			soundcloudPort.disconnect()
		}
		soundcloudPort=port
		console.info("SoundCloud port opened")
		port.onDisconnect.addListener(()=>{
			console.info("SoundCloud port closed")
			soundcloudPort=undefined
			if(source=="soundcloud")
				resetActivity()
		})
		if(source=="soundcloud"&&discordPort!==undefined)
			soundcloudPort.postMessage({listen:true})
	}
	else if(port.name=="plex")
	{
		if(plexPort!==undefined)
		{
			plexPort.postMessage({action:"close"})
			plexPort.disconnect()
		}
		plexPort=port
		console.info("Plex port opened")
		port.onDisconnect.addListener(()=>{
			console.info("Plex port closed")
			plexPort=undefined
			if(source=="plex")
				resetActivity()
		})
		if(source=="plex"&&discordPort!==undefined)
			plexPort.postMessage({listen:true})
	}
	else
	{
		console.warn("Denied connection with unexpected name:",port.name)
		port.disconnect()
	}
})
chrome.runtime.onMessage.addListener((request,sender,sendResponse)=>{
	console.info(request)
	if(request.action!==undefined)
	{
		switch(request.action)
		{
			case"ports":
			sendResponse({
				discord:discordPort!==undefined,
				youtube:youtubePort!==undefined,
				soundcloud:soundcloudPort!==undefined,
				plex:plexPort!==undefined
			})
			break
			case"source":
			console.assert(request.source!==undefined)
			source=request.source
			chrome.storage.local.set({"source":source})
			if(source=="youtube")
			{
				if(youtubePort!==undefined)
					youtubePort.postMessage({listen:true})
				else
					resetActivity()
			}
			else if(youtubePort!==undefined)
				youtubePort.postMessage({listen:false})
			if(source=="soundcloud")
			{
				if(soundcloudPort!==undefined)
					soundcloudPort.postMessage({listen:true})
				else
					resetActivity()
			}
			else if(soundcloudPort!==undefined)
				soundcloudPort.postMessage({listen:false})
			if(source=="plex")
			{
				if(plexPort!==undefined)
					plexPort.postMessage({listen:true})
				else
					resetActivity()
			}
			else if(plexPort!==undefined)
				plexPort.postMessage({listen:false})
			break
			case"reset":
			resetActivity()
			break
			default:
			console.warn("Unknown action",request.action)
		}
	}
	else
	{
		if(request.dontSave!==true)
			chrome.storage.local.set(request)
		if(discordPort!==undefined)
			discordPort.postMessage(request)
	}
})
