let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let path=require("path");
url=url+"/match-results";
let request=require("request");
let cheerio=require("cheerio");
let fs = require("fs");
request(url,cb);

function cb(err,response,html)
{
    if(err)
    {
        console.log(err);
    }
    else
    {
        let selectTool=cheerio.load(html);
        let matchArr=selectTool(".match-info-link-FIXTURES");
        let scorecardArr=[];

        for(let i=0;i<matchArr.length;i++)
        {
            let scorecardLink=selectTool(matchArr[i]).attr("href");
            scorecardArr.push("https://www.espncricinfo.com"+scorecardLink);
        }

        let dir="C:\\Users\\pc\\Desktop\\Web Dev\\web scrapping\\Activity";
        let fldDir=path.join(dir,"IPL2020");
        if (!fs.existsSync(fldDir)){
            fs.mkdirSync(fldDir);
        }
        allMatch(scorecardArr,fldDir); 
    }
}

function allMatch(scorecardArr,fldDir)
{
    for(let i=0;i<scorecardArr.length;i++)
    {
        request(scorecardArr[i],cb);
        function cb(err,response,html)
        {
            if(err)
            {
                console.log(err);
            }
            else
            {
                let selEl=cheerio.load(html);
                let venueAndDate=selEl(".match-info.match-info-MATCH .description").text();
                venueAndDate=venueAndDate.split(",");
                let venue=venueAndDate[1];
                venue=venue.trim();
                let date=venueAndDate[2];
                date=date.trim();
                let result=selEl(".match-info.match-info-MATCH .status-text>span").text();
               
                let batsmanTable= selEl(".table.batsman");
                let teams=selEl(".header-title.label ")
                let teamArr=[];
                for(let i=0;i<2;i++)
                {
                    let teamName=selEl(teams[i]).text();
                    let teamNameSplit=teamName.split(" ");
                    let s="";
                    for(let j=0;j<teamNameSplit.length;j++)
                    {
                        if(teamNameSplit[j]=="INNINGS")
                        break;

                        else
                        {
                            s=s+teamNameSplit[j]+" ";
                        }
                    }
                    s=s.trim();
                    teamArr.push(s);
                }
                
                
                
                for(let i=0;i<batsmanTable.length;i++)
                {
                    let opponentName;
                    if(i==0)
                    {
                        opponentName=teamArr[i+1];
                    }
                    else
                    {
                        opponentName=teamArr[i-1];
                    }
                    let playerTable= selEl(batsmanTable[i]).find("tbody tr");       // diff rows for same team batsman
                    for(let j=0;j<playerTable.length;j=j+2)
                    {
                        let playerData= selEl(playerTable[j]).find("td");           // data for each batsman
                        let name=selEl(playerData[0]).text();
                        let runs=selEl(playerData[2]).text();
                        let balls=selEl(playerData[3]).text();
                        let fours=selEl(playerData[5]).text();
                        let sixes=selEl(playerData[6]).text();
                        let sr=selEl(playerData[7]).text();
                        if(name=="Extras")
                        continue;

                        let teamFile=path.join(fldDir,teamArr[i]);
                        if (!fs.existsSync(teamFile)){
                            fs.mkdirSync(teamFile);
                        } 

                        let s="";
                        for(let k=0;k<name.length;k++)
                        {
                            if(name[k]=="(" || name[k]=="†")
                            break;
                            else
                            s=s+name[k];
                        }
                        let sSplit=s.split(" ");
                        s="";
                        for(let k=0;k<sSplit.length;k++)
                        {
                            s+=sSplit[k];
                        }
                        name=s;

                        name=name.trim();
                        let playerFile=path.join(teamFile,name+".json");
                        
                        if(!fs.existsSync(playerFile))
                        {
                            fs.openSync(playerFile,"w");
                        } 


                        let data= fs.readFileSync(playerFile);
                        if(data.length==0)
                        {
                            let obj=[];
                            obj.push({runs:runs,balls:balls,fours,fours,sixes:sixes,sr:sr,venue:venue,date:date,result:result,opponent:opponentName});
                            fs.writeFileSync(playerFile,JSON.stringify(obj));
                        }
                        else
                        {
                            let string=data.toString('utf8');
                            let obj=JSON.parse(string);
                            obj.push({runs:runs,balls:balls,fours,fours,sixes:sixes,sr:sr,venue:venue,date:date,result:result,opponent:opponentName});
                            fs.writeFileSync(playerFile,JSON.stringify(obj));
                        }
                    }
                } 

            }
        }
    }
}