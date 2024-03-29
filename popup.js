//Load & show translations
let elms=document.querySelectorAll("[data-message]")
for(let i in elms)
{
	let elm=elms[i]
	if(elm instanceof HTMLElement)
		elm.textContent=chrome.i18n.getMessage(elm.getAttribute("data-message"))
}
elms=document.querySelectorAll("[data-placeholder]")
for(let i in elms)
{
	let elm=elms[i]
	if(elm instanceof HTMLElement)
		elm.setAttribute("placeholder",chrome.i18n.getMessage(elm.getAttribute("data-placeholder")))
}
//Register change handlers to modify DOM according to selections
document.getElementById("source").onchange=()=>{
	let source=document.getElementById("source").value
	if(source=="custom")
		document.getElementById("content-source-custom").className=""
	else
		document.getElementById("content-source-custom").className="hidden"
	if(source=="youtube")
		document.getElementById("content-source-youtube").className=""
	else
		document.getElementById("content-source-youtube").className="hidden"
	if(source=="soundcloud")
		document.getElementById("content-source-soundcloud").className=""
	else
		document.getElementById("content-source-soundcloud").className="hidden"
	if(source=="plex")
		document.getElementById("content-source-plex").className=""
	else
		document.getElementById("content-source-plex").className="hidden"
}
document.getElementById("type").onchange=()=>{
	let type=document.getElementById("type").value
	if(type==1)
	{
		document.getElementById("streamurl").style.display="block"
		document.getElementById("streamnote").style.display="list-item"
	}
	else
	{
		document.getElementById("streamurl").style.display="none"
		document.getElementById("streamnote").style.display="none"
	}
	if(type>1)
	{
		document.getElementById("state").className=""
		document.getElementById("party").style.display="none"
	}
	else
	{
		document.getElementById("state").className="withparty"
		document.getElementById("party").style.display="inline-block"
	}
}

//Query and display current settings
chrome.storage.local.get(["source","type","name","streamurl","details","state","partycur","partymax"],result=>{
	if(result.source)
		document.querySelector("#source [value='"+result.source+"']").setAttribute("selected","selected")
	document.getElementById("source").onchange();
	if(result.type)
		document.querySelector("#type [value='"+result.type+"']").setAttribute("selected","selected")
	document.getElementById("type").onchange();
	if(result.name)
		document.getElementById("name").value=result.name
	if(result.streamurl)
		document.getElementById("streamurl").value=result.streamurl
	if(result.details)
		document.getElementById("details").value=result.details
	if(result.state)
		document.getElementById("state").value=result.state
	if(result.partycur)
		document.getElementById("partycur").value=result.partycur
	if(result.partymax)
		document.getElementById("partymax").value=result.partymax
})
document.getElementById("streamurl").onchange=()=>{//Fix stream url to fix common mistakes
	document.getElementById("streamurl").value=document.getElementById("streamurl").value.replace("www.twitch.tv","twitch.tv")
}
document.getElementById("updatebtn").onclick=()=>{//Announce update
	document.getElementById("updatebtn").setAttribute("disabled","disabled")
	let source=document.getElementById("source").value
	chrome.runtime.sendMessage({
		action:"source",
		source:source
	},()=>{
		if(source=="custom")
			chrome.runtime.sendMessage({
				type:document.getElementById("type").value,
				name:document.getElementById("name").value,
				streamurl:document.getElementById("streamurl").value,
				details:document.getElementById("details").value,
				state:document.getElementById("state").value,
				partycur:document.getElementById("partycur").value,
				partymax:document.getElementById("partymax").value
			},()=>document.getElementById("updatebtn").removeAttribute("disabled"))
		else
			document.getElementById("updatebtn").removeAttribute("disabled")
	})
}
//Query open tab status and show content according to response
chrome.runtime.sendMessage({action:"ports"},response=>{
	if(response.discord)
		document.getElementById("content-ok").className=""
	else
		document.getElementById("content-notab").className=""
	if(response.youtube)
		document.getElementById("content-source-youtube-ok").className=""
	else
		document.getElementById("content-source-youtube-notab").className=""
	if(response.soundcloud)
		document.getElementById("content-source-soundcloud-ok").className=""
	else
		document.getElementById("content-source-soundcloud-notab").className=""
	if(response.plex)
		document.getElementById("content-source-plex-ok").className=""
	else
		document.getElementById("content-source-plex-notab").className=""
	document.getElementById("content-loading").className="hidden"
})
